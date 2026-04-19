# 🎵 Bitstream Music Player

A compact, neo-brutalist desktop music player widget built with **Electron**, **React**, **TypeScript**, and **Tailwind CSS**. Load your local music folders **or paste a YouTube playlist URL** and enjoy your tracks in a sleek, always-on-top widget-style window.

---

## ✨ Features

### 🎧 Local Music Playback
- **Folder Loading** — Load any folder from your computer and play `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, and `.webm` files
- **Custom Protocol** — Secure `local-audio://` protocol for serving local files

### 🎬 YouTube Playlist Integration
- **Paste & Play** — Paste any public YouTube playlist URL and stream all tracks directly
- **Smart Metadata** — Automatically fetches song titles, artist names, thumbnails, and durations
- **Audio Streaming** — Streams audio via a custom `yt-audio://` protocol — no files downloaded to disk
- **Seekable Playback** — Full seek support on streamed YouTube audio via proxied Range requests
- **URL Caching** — Resolved stream URLs are cached for 4 hours to minimize lookup latency
- **Mixed Playlists** — YouTube tracks append to your local playlist, so you can mix both sources

### 🎨 Player Controls & UI
- **Compact Widget UI** — Fixed 400×520 frameless window, designed to stay out of your way
- **Play / Pause / Next / Previous** — Full transport controls
- **Shuffle & Repeat Modes** — Randomize playback or loop your favorite track
- **Seek Bar** — Click anywhere on the progress bar to jump to a position
- **Volume Control** — Interactive volume slider with mute indicator
- **Dark Mode** — Toggle between light and dark themes
- **Playlist Drawer** — Slide-out panel with search/filter functionality
- **Source Badges** — YouTube tracks are marked with a red "YT" badge in the playlist
- **Real-time Progress** — Progress bar and time display sync with actual audio playback
- **Active Song Highlighting** — Currently playing song is highlighted in the playlist
- **Window Controls** — Custom minimize and close buttons (frameless window)
- **Drag to Move** — Drag the title bar to reposition the widget

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Electron 33](https://www.electronjs.org/) | Desktop application shell |
| [React 18](https://react.dev/) | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe frontend code |
| [Vite 6](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icon library |
| [yt-dlp-exec](https://github.com/microlinkhq/youtube-dl-exec) | YouTube playlist extraction & audio streaming |
| HTML5 Audio API | Audio playback engine |

---

## 🏛 Architecture

The application follows Electron's recommended **multi-process architecture** with strict security boundaries:

```
┌─────────────────────────────────────────────────────────┐
│                    Main Process                          │
│              (electron/main.cjs)                         │
│                                                          │
│  • Window management (frameless, fixed size)             │
│  • File system access (folder scanning)                  │
│  • Native dialogs (folder picker)                        │
│  • Custom protocol: local-audio://  (local files)        │
│  • Custom protocol: yt-audio://     (YouTube streams)    │
│  • yt-dlp binary execution (playlist fetch + URL resolve)│
│  • Stream URL caching (4h TTL)                           │
│  • IPC handlers                                          │
├─────────────────────────────────────────────────────────┤
│                   Preload Script                         │
│              (electron/preload.cjs)                      │
│                                                          │
│  • contextBridge: exposes safe APIs to renderer          │
│  • window.electronAPI.selectFolder()                     │
│  • window.electronAPI.fetchYoutubePlaylist()             │
│  • window.electronAPI.windowControl()                    │
├─────────────────────────────────────────────────────────┤
│                 Renderer Process                         │
│              (React Application)                         │
│                                                          │
│  • UI rendering with React + Tailwind                    │
│  • HTML5 Audio element for playback                      │
│  • YouTube URL input + fetch flow                        │
│  • State management (React hooks)                        │
│  • Calls electronAPI for system operations               │
└─────────────────────────────────────────────────────────┘
```

### Security Rules

1. **`nodeIntegration: false`** — Node.js APIs are NOT available in the renderer
2. **`contextIsolation: true`** — Renderer runs in an isolated JavaScript context
3. **`contextBridge`** — Only specific, whitelisted APIs are exposed to the renderer
4. **Custom Protocols** — Local audio files are served via `local-audio://` and YouTube audio via `yt-audio://` instead of raw `file://` paths

---

## 📂 Folder Structure

```
bitstream-music-player/
├── electron/
│   ├── main.cjs              # Electron main process (IPC, protocols, yt-dlp)
│   └── preload.cjs           # Preload bridge script
├── src/
│   ├── main.tsx              # React entry point
│   ├── electron.d.ts         # TypeScript declarations for electronAPI
│   ├── app/
│   │   ├── App.tsx           # Root component with audio logic & state
│   │   ├── types.ts          # Song interface definition
│   │   └── components/
│   │       ├── TopBar.tsx         # Title bar with window controls
│   │       ├── WidgetPlayer.tsx   # Album art, progress, transport controls
│   │       ├── PlaylistDrawer.tsx # Slide-out playlist with search + YouTube input
│   │       ├── BottomWidgetBar.tsx # Volume slider & theme toggle
│   │       ├── figma/
│   │       │   └── ImageWithFallback.tsx
│   │       └── ui/               # Shared UI primitives (shadcn)
│   └── styles/
│       ├── index.css          # CSS entry point
│       ├── tailwind.css       # Tailwind directives
│       ├── theme.css          # Design tokens & base styles
│       └── fonts.css          # Google Fonts imports
├── index.html                 # HTML entry with CSP headers
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite build configuration
└── postcss.config.mjs         # PostCSS configuration
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **Git** ([download](https://git-scm.com/))
- **Python 3** (optional) — Required only if `yt-dlp-exec` needs to build its binary from source on your platform. Most systems will use the pre-built binary automatically.

### Installation

```bash
# Clone the repository
git clone https://github.com/NeuralNik/bitstream-music-player.git
cd bitstream-music-player

# Install dependencies (includes yt-dlp binary download)
npm install --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is needed due to some peer dependency version mismatches between packages. This is safe to use.

> **Note:** During `npm install`, the `yt-dlp-exec` package will automatically download the `yt-dlp` binary (~30 MB) into `node_modules/yt-dlp-exec/bin/`. This is required for YouTube playlist functionality. No separate installation is needed.

### Verify yt-dlp Installation

You can verify the yt-dlp binary is working correctly:

```bash
npx yt-dlp --version
```

This should print a version string like `2026.03.17`.

---

## 💻 Development Workflow

### Start in Electron (Recommended)

This launches both the Vite dev server and the Electron window concurrently:

```bash
npm run electron:dev
```

- Vite serves the React app at `http://localhost:5173`
- Electron loads the React app from the dev server
- **Hot Module Replacement (HMR)** is fully active — edit React components and see changes instantly
- YouTube playlist integration is fully functional in this mode

### Start in Browser Only

For quick UI development without Electron:

```bash
npm run dev
```

> When running in browser mode, the app uses mock data since `window.electronAPI` is not available. The folder selection button simulates loading songs. **YouTube playlist fetching is not available in browser-only mode** as it requires the Electron main process and yt-dlp binary.

---

## 📦 Build and Run Instructions

### Preview Production Build

Build the React app and launch it in Electron:

```bash
npm run electron:preview
```

### Package for Distribution

Build and package as a Windows installer:

```bash
npm run electron:build
```

The installer will be created in the `release/` directory.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server (browser only, no YouTube) |
| `npm run build` | Build React app for production |
| `npm run electron:dev` | Start Vite + Electron for development (full features) |
| `npm run electron:preview` | Build and run in Electron |
| `npm run electron:build` | Build and package as installer |

---

## ⚡ How It Works

### Main Process (`electron/main.cjs`)

The main process runs in Node.js and has full access to OS-level APIs:

1. **Window Creation** — Creates a frameless, fixed-size `BrowserWindow` (400×520)
2. **Protocol Registration** — Registers two custom protocols:
   - `local-audio://` — Serves local audio files securely
   - `yt-audio://` — Resolves and proxies YouTube audio streams
3. **IPC Handlers** — Listens for messages from the renderer:
   - `select-folder`: Opens native folder dialog, scans for audio files, returns song list
   - `fetch-yt-playlist`: Uses yt-dlp to fetch playlist metadata (titles, thumbnails, durations)
   - `window-control`: Handles minimize/close actions

### Preload Script (`electron/preload.cjs`)

The preload script runs in a special context with access to both Node.js and browser APIs. It uses `contextBridge` to safely expose three functions:

```javascript
window.electronAPI = {
  selectFolder()                // Opens folder picker, returns Song[]
  fetchYoutubePlaylist(url)     // Fetches YouTube playlist, returns { success, songs[], error? }
  windowControl(action)         // 'minimize' or 'close'
}
```

### Renderer Process (React App)

The React app runs in a sandboxed browser environment. It:
- Uses `window.electronAPI?.selectFolder()` to load local music
- Uses `window.electronAPI?.fetchYoutubePlaylist(url)` to import YouTube playlists
- Uses HTML5 `<audio>` element for playback (no Node.js needed)
- Gracefully falls back to mock data when `electronAPI` is unavailable (browser dev mode)

---

## 🎶 How Local Music Loading Works

### 1. Folder Selection

When the user clicks "Select Folder", the native OS file dialog opens (via `dialog.showOpenDialog`). Only directories can be selected.

### 2. File Scanning

The main process reads the selected directory and filters files by supported audio extensions: `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, `.webm`.

### 3. Song Object Creation

For each audio file, a `Song` object is created:

```typescript
interface Song {
  id: string;                        // Unique identifier
  title: string;                     // Filename without extension
  artist: string;                    // "Unknown Artist" for local files
  path: string;                      // local-audio:// or yt-audio:// URL
  albumArt: string;                  // YouTube thumbnail URL or empty for local
  duration: number;                  // Set by HTML5 Audio's loadedmetadata event
  source?: 'local' | 'youtube';     // Track origin
}
```

### 4. Custom Protocol (`local-audio://`)

Instead of exposing raw `file://` paths (security risk), the app registers a custom protocol:

- **URL Format:** `local-audio://play/C%3A%5CUsers%5CMusic%5Csong.mp3`
- **Security:** Only files with audio extensions are served
- **Implementation:** Uses Electron's `protocol.handle()` API and `net.fetch()` to stream files

### 5. Audio Playback

The React renderer uses a standard HTML5 `<audio>` element:
- `audio.src = song.path` → points to the `local-audio://` or `yt-audio://` URL
- `audio.play()` / `audio.pause()` for transport
- `timeupdate` event → updates progress bar in real-time
- `loadedmetadata` event → captures actual duration
- `ended` event → triggers next song or repeat

---

## 🎬 How YouTube Playlist Integration Works

### 1. User Input

The user pastes a public YouTube playlist URL (e.g., `https://www.youtube.com/playlist?list=PLxyz...`) into the input field in the playlist drawer and clicks the YouTube fetch button or presses Enter.

### 2. Playlist Metadata Fetch

The main process invokes `yt-dlp` with `--flat-playlist --dump-json` flags to rapidly extract metadata for every video in the playlist **without downloading any media files**. This returns JSON with video IDs, titles, channel names, durations, and thumbnail URLs.

### 3. Song Mapping

Each playlist entry is mapped to a `Song` object with:
- **path:** `yt-audio://play/<videoId>` — the custom protocol URL
- **albumArt:** The highest-resolution YouTube thumbnail
- **source:** `'youtube'`

### 4. Custom Protocol (`yt-audio://`)

When the `<audio>` element loads a `yt-audio://` URL, Electron's protocol handler:

1. Extracts the video ID from the URL
2. Calls `yt-dlp -f bestaudio -g` to resolve the **direct Google video CDN URL**
3. **Caches** the resolved URL for 4 hours (YouTube signed URLs expire after ~6 hours)
4. Proxies the CDN response through `net.fetch()`, **forwarding Range headers** so the HTML5 audio element can seek freely

### 5. IPC Communication Flow

```
User pastes YouTube playlist URL
    ↓
React calls window.electronAPI.fetchYoutubePlaylist(url)
    ↓
Preload forwards via ipcRenderer.invoke('fetch-yt-playlist')
    ↓
Main process runs: yt-dlp --flat-playlist --dump-json <url>
    ↓
Parses JSON output → maps to Song[] with yt-audio:// paths
    ↓
Returns { success: true, songs: Song[] } back through IPC
    ↓
React appends songs to playlist state, displays in drawer
    ↓
User clicks a YouTube song → React sets audio.src = "yt-audio://play/<videoId>"
    ↓
Electron's yt-audio:// handler runs: yt-dlp -f bestaudio -g <videoUrl>
    ↓
Resolves direct CDN URL → proxies stream with Range support → audio plays
```

---

## 🔮 Future Improvements

- [ ] **Metadata Extraction** — Read ID3 tags (artist, album, album art) using `music-metadata` package
- [ ] **Drag & Drop** — Drop audio files or folders directly onto the widget
- [ ] **Keyboard Shortcuts** — Space (play/pause), arrows (next/prev), +/- (volume)
- [ ] **Mini Mode** — Even more compact view showing only transport controls
- [ ] **Audio Visualizer** — Waveform or spectrum analyzer in the album art area
- [ ] **Playlist Persistence** — Remember last loaded folder and playback position
- [ ] **System Tray** — Minimize to system tray with playback controls
- [ ] **Always on Top** — Optional always-on-top mode for the widget
- [ ] **Cross-Platform Builds** — Package for macOS (.dmg) and Linux (.AppImage)
- [ ] **Equalizer** — Basic EQ controls using Web Audio API
- [ ] **Scrobbling** — Last.fm integration for play tracking
- [ ] **YouTube Single Video** — Support pasting individual YouTube video URLs (not just playlists)
- [ ] **Download Mode** — Option to cache/download YouTube audio for offline playback

