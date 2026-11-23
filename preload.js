const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlay', {
  fit: (w, h, ax, ay) => ipcRenderer.send('fit', w, h, ax, ay),
});
