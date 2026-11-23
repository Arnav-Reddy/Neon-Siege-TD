const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
  fit: (w, h) => ipcRenderer.send('fit', w, h),
});
