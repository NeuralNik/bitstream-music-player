// @ts-check
const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

/** @type {BrowserWindow | null} */
let mainWindow = null;

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.webm'];

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
