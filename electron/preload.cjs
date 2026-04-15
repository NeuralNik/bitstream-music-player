// @ts-check
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  windowControl: (/** @type {'minimize' | 'close'} */ action) => ipcRenderer.invoke('window-control', action),
});
