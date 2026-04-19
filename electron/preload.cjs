// @ts-check
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  fetchYoutubePlaylist: (/** @type {string} */ url) => ipcRenderer.invoke('fetch-yt-playlist', url),
  windowControl: (/** @type {'minimize' | 'close'} */ action) => ipcRenderer.invoke('window-control', action),
});
