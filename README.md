# 🎵 Bitstream Music Player

A compact, neo-brutalist desktop music player widget built with **Electron**, **React**, **TypeScript**, and **Tailwind CSS**. Load your local music folders and enjoy your tracks in a sleek, always-on-top widget-style window.

![Bitstream Music Player](https://img.shields.io/badge/Electron-33-blue?style=flat-square&logo=electron) ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **Local Music Playback** — Load any folder from your computer and play `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`, and `.webm` files
- **Compact Widget UI** — Fixed 400×520 frameless window, designed to stay out of your way
- **Play / Pause / Next / Previous** — Full transport controls
- **Shuffle & Repeat Modes** — Randomize playback or loop your favorite track
- **Seek Bar** — Click anywhere on the progress bar to jump to a position
- **Volume Control** — Interactive volume slider with mute indicator
- **Dark Mode** — Toggle between light and dark themes
- **Playlist Drawer** — Slide-out panel with search/filter functionality
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
| HTML5 Audio API | Audio playback engine |

---

## 🏛 Architecture

The application follows Electron's recommended **multi-process architecture** with strict security boundaries:

```
┌─────────────────────────────────────────────────────┐
│                    Main Process                      │
│              (electron/main.cjs)                     │
│                                                      │
│  • Window management (frameless, fixed size)         │
│  • File system access (folder scanning)              │
│  • Native dialogs (folder picker)                    │
│  • Custom protocol (local-audio://)                  │
│  • IPC handlers                                      │
├─────────────────────────────────────────────────────┤
│                   Preload Script                     │
│              (electron/preload.cjs)                  │
│                                                      │
│  • contextBridge: exposes safe APIs to renderer      │
│  • window.electronAPI.selectFolder()                 │
│  • window.electronAPI.windowControl()                │
├─────────────────────────────────────────────────────┤
│                 Renderer Process                     │
│              (React Application)                     │
│                                                      │
│  • UI rendering with React + Tailwind               │
│  • HTML5 Audio element for playback                  │
│  • State management (React hooks)                    │
│  • Calls electronAPI for system operations           │
└─────────────────────────────────────────────────────┘
```

### Security Rules

1. **`nodeIntegration: false`** — Node.js APIs are NOT available in the renderer
2. **`contextIsolation: true`** — Renderer runs in an isolated JavaScript context
3. **`contextBridge`** — Only specific, whitelisted APIs are exposed to the renderer
4. **Custom Protocol** — Local audio files are served via `local-audio://` protocol instead of raw `file://` paths

---

## 📂 Folder Structure

```
bitstream-music-player/
├── electron/
│   ├── main.cjs              # Electron main process
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
│   │       ├── PlaylistDrawer.tsx # Slide-out playlist with search
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

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/bitstream-music-player.git
cd bitstream-music-player

# Install dependencies
npm install --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is needed due to some peer dependency version mismatches between packages. This is safe to use.

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

### Start in Browser Only

For quick UI development without Electron:

```bash
npm run dev
```

> When running in browser mode, the app uses mock data since `window.electronAPI` is not available. The folder selection button simulates loading songs.

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
| `npm run dev` | Start Vite dev server (browser only) |
| `npm run build` | Build React app for production |
| `npm run electron:dev` | Start Vite + Electron for development |
| `npm run electron:preview` | Build and run in Electron |
| `npm run electron:build` | Build and package as installer |

---

## ⚡ How Electron Works in This Project

### Main Process (`electron/main.cjs`)

The main process runs in Node.js and has full access to OS-level APIs:

1. **Window Creation** — Creates a frameless, fixed-size `BrowserWindow` (400×520)
2. **Protocol Registration** — Registers `local-audio://` custom protocol to serve local files
3. **IPC Handlers** — Listens for messages from the renderer:
   - `select-folder`: Opens native folder dialog, scans for audio files, returns song list
   - `window-control`: Handles minimize/close actions

### Preload Script (`electron/preload.cjs`)

The preload script runs in a special context with access to both Node.js and browser APIs. It uses `contextBridge` to safely expose two functions:

```javascript
window.electronAPI = {
  selectFolder()        // Opens folder picker, returns Song[]
  windowControl(action) // 'minimize' or 'close'
}
```

### Renderer Process (React App)

The React app runs in a sandboxed browser environment. It:
- Uses `window.electronAPI?.selectFolder()` to load music
- Uses HTML5 `<audio>` element for playback (no Node.js needed)
- Gracefully falls back to mock data when `electronAPI` is unavailable (browser dev mode)

### IPC Communication Flow

```
User clicks "Select Folder"
    ↓
React calls window.electronAPI.selectFolder()
    ↓
Preload forwards via ipcRenderer.invoke('select-folder')
    ↓
Main process opens dialog.showOpenDialog()
    ↓
User selects folder → main process scans for audio files
    ↓
Returns Song[] array back through IPC
    ↓
React updates state, displays songs in playlist
    ↓
User clicks song → React sets audio.src to local-audio:// URL
    ↓
Electron's protocol handler serves the file → audio plays
```

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
  id: string;       // Unique identifier (timestamp-based)
  title: string;    // Filename without extension
  artist: string;   // "Unknown Artist" (metadata extraction not yet implemented)
  path: string;     // local-audio:// URL for secure playback
  albumArt: string; // Empty (metadata extraction not yet implemented)
  duration: number; // Set by HTML5 Audio's loadedmetadata event
}
```

### 4. Custom Protocol (`local-audio://`)

Instead of exposing raw `file://` paths (security risk), the app registers a custom protocol:

- **URL Format:** `local-audio:///C:/Users/Music/song.mp3`
- **Security:** Only files with audio extensions are served
- **Implementation:** Uses Electron's `protocol.handle()` API and `net.fetch()` to stream files

### 5. Audio Playback

The React renderer uses a standard HTML5 `<audio>` element:
- `audio.src = song.path` → points to the `local-audio://` URL
- `audio.play()` / `audio.pause()` for transport
- `timeupdate` event → updates progress bar in real-time
- `loadedmetadata` event → captures actual duration
- `ended` event → triggers next song or repeat

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

---

## 📝 License

This project is private and not currently licensed for distribution.

---

<p align="center">
  Built with ❤️ using Electron + React + TypeScript
</p>