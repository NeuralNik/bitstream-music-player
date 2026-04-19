// @ts-check
const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { execFile } = require('child_process');

/** @type {BrowserWindow | null} */
let mainWindow = null;

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.webm'];

// Resolve yt-dlp binary path from the yt-dlp-exec package
const ytDlpBinary = require('yt-dlp-exec').getBinaryPath
  ? require('yt-dlp-exec').getBinaryPath()
  : path.join(
      path.dirname(require.resolve('yt-dlp-exec')),
      '..',
      'bin',
      process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    );

// CRITICAL: Must be called BEFORE app.ready to enable audio streaming from custom protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-audio',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  },
  {
    scheme: 'yt-audio',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 520,
    resizable: false,
    frame: false,
    center: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register protocol handler for serving local audio files
function registerLocalAudioProtocol() {
  protocol.handle('local-audio', (request) => {
    try {
      // Extract the file path from the URL
      // Format: local-audio://play/C%3A%5CUsers%5C...%5Csong.mp3
      // The path is everything after the host, URL-encoded
      const url = new URL(request.url);
      
      // The pathname contains our encoded file path (after /play/)
      let rawPath = url.pathname;
      
      // Remove the /play/ prefix
      if (rawPath.startsWith('/play/')) {
        rawPath = rawPath.substring(6);
      } else if (rawPath.startsWith('/')) {
        rawPath = rawPath.substring(1);
      }
      
      // Decode the file path
      let filePath = decodeURIComponent(rawPath);

      console.log('[local-audio] Resolved path:', filePath);

      // Security: verify the file is an audio file
      const ext = path.extname(filePath).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        console.error('[local-audio] Forbidden extension:', ext);
        return new Response('Forbidden', { status: 403 });
      }

      if (!fs.existsSync(filePath)) {
        console.error('[local-audio] File not found:', filePath);
        return new Response('Not Found', { status: 404 });
      }

      // Serve the file using net.fetch with file:// protocol
      const fileUrl = pathToFileURL(filePath).toString();
      console.log('[local-audio] Serving:', fileUrl);
      return net.fetch(fileUrl);
    } catch (err) {
      console.error('[local-audio] Protocol error:', err);
      return new Response('Internal Error', { status: 500 });
    }
  });
}

// ---------- YouTube Audio Protocol ----------

/**
 * Helper: run yt-dlp and return stdout as a string
 * @param {string[]} args
 * @returns {Promise<string>}
 */
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    execFile(ytDlpBinary, args, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[yt-dlp] stderr:', stderr);
        return reject(new Error(stderr || err.message));
      }
      resolve(stdout);
    });
  });
}

/**
 * Cache of resolved direct URLs so we don't call yt-dlp on every seek.
 * Maps videoId -> { url, resolvedAt }
 * @type {Map<string, { url: string, resolvedAt: number }>}
 */
const streamUrlCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours (YouTube signed URLs expire after ~6h)

/**
 * Get the direct streaming URL for a YouTube video, with caching.
 * @param {string} videoId
 * @returns {Promise<string>}
 */
async function getStreamUrl(videoId) {
  const cached = streamUrlCache.get(videoId);
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL_MS) {
    return cached.url;
  }
  const stdout = await runYtDlp([
    '-f', 'bestaudio',
    '-g',
    '--no-playlist',
    `https://www.youtube.com/watch?v=${videoId}`,
  ]);
  const url = stdout.trim().split('\n')[0];
  streamUrlCache.set(videoId, { url, resolvedAt: Date.now() });
  return url;
}

function registerYtAudioProtocol() {
  protocol.handle('yt-audio', async (request) => {
    try {
      // URL format: yt-audio://play/<videoId>
      const url = new URL(request.url);
      let videoId = url.pathname;
      if (videoId.startsWith('/play/')) videoId = videoId.substring(6);
      else if (videoId.startsWith('/')) videoId = videoId.substring(1);
      videoId = decodeURIComponent(videoId);

      console.log('[yt-audio] Resolving stream for:', videoId);

      const directUrl = await getStreamUrl(videoId);
      console.log('[yt-audio] Proxying:', directUrl.substring(0, 80) + '...');

      // Proxy through net.fetch so Range headers are forwarded for seeking
      return net.fetch(directUrl, {
        method: request.method,
        headers: request.headers,
      });
    } catch (err) {
      console.error('[yt-audio] Protocol error:', err);
      return new Response('Failed to resolve YouTube audio stream', { status: 502 });
    }
  });
}

// IPC: Open folder dialog and scan for audio files
function registerIpcHandlers() {
  ipcMain.handle('select-folder', async () => {
    if (!mainWindow) return [];

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Music Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    const folderPath = result.filePaths[0];
    const songs = scanFolder(folderPath);
    console.log(`[select-folder] Found ${songs.length} audio files in: ${folderPath}`);
    return songs;
  });

  // ---------- YouTube Playlist IPC ----------
  ipcMain.handle('fetch-yt-playlist', async (_event, playlistUrl) => {
    try {
      console.log('[fetch-yt-playlist] Fetching:', playlistUrl);

      // Use --flat-playlist to quickly dump metadata without downloading
      const stdout = await runYtDlp([
        '--flat-playlist',
        '--dump-json',
        '--no-warnings',
        playlistUrl,
      ]);

      // Each line is a separate JSON object
      const lines = stdout.trim().split('\n').filter(Boolean);
      const songs = lines.map((line, index) => {
        const entry = JSON.parse(line);
        const videoId = entry.id || entry.url;
        const title = entry.title || `Track ${index + 1}`;
        const artist = entry.uploader || entry.channel || 'YouTube';
        const duration = entry.duration || 0;
        // Use YouTube thumbnail or fallback
        const thumbnail =
          entry.thumbnails && entry.thumbnails.length > 0
            ? entry.thumbnails[entry.thumbnails.length - 1].url
            : `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        return {
          id: `yt-${videoId}-${index}`,
          title,
          artist,
          path: `yt-audio://play/${encodeURIComponent(videoId)}`,
          albumArt: thumbnail,
          duration,
          source: 'youtube',
        };
      });

      console.log(`[fetch-yt-playlist] Parsed ${songs.length} tracks`);
      return { success: true, songs };
    } catch (err) {
      console.error('[fetch-yt-playlist] Error:', err);
      return { success: false, error: err.message || String(err) };
    }
  });

  ipcMain.handle('window-control', (_event, action) => {
    if (!mainWindow) return;

    switch (action) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'close':
        mainWindow.close();
        break;
    }
  });
}

/**
 * Scan a directory for audio files
 * @param {string} folderPath 
 */
function scanFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    const songs = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .map((file, index) => {
        const filePath = path.join(folderPath, file);
        const title = path.basename(file, path.extname(file));

        // Build a safe local-audio:// URL
        // Encode the FULL Windows path as a single URL component under /play/
        const encodedPath = encodeURIComponent(filePath);
        const audioUrl = `local-audio://play/${encodedPath}`;

        return {
          id: `${Date.now()}-${index}`,
          title,
          artist: 'Unknown Artist',
          path: audioUrl,
          albumArt: '',
          duration: 0,
          source: 'local',
        };
      });

    return songs;
  } catch (error) {
    console.error('Error scanning folder:', error);
    return [];
  }
}

// App lifecycle
app.whenReady().then(() => {
  registerLocalAudioProtocol();
  registerYtAudioProtocol();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
