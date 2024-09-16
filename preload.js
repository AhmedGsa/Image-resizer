const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const os = require('os');
const Toastify = require('toastify-js');

contextBridge.exposeInMainWorld('path', {
    join: path.join,
    basename: path.basename,
});

contextBridge.exposeInMainWorld('os', {
    homedir: os.homedir(),
});

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options) => Toastify(options).showToast(),
});

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, func),
    openFileDialog: () => ipcRenderer.invoke('dialog:openFile')
});

contextBridge.exposeInMainWorld('electronAPI', {
    
});