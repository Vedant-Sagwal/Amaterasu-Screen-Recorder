// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts



const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  	showVideoSourcesMenu: () => ipcRenderer.invoke('show-video-sources-menu'),
  	onVideoSourceSelected: (callback) => ipcRenderer.on('video-source-selected', callback),
	saveVideo : () => ipcRenderer.invoke('save-recording'),
  	saveFile: (data) => ipcRenderer.invoke('save-file', data),
});
