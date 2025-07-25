
const { app, BrowserWindow, ipcMain, desktopCapturer, Menu, dialog} = require('electron');
const fs = require("fs").promises
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;


const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
	nodeIntegration : false,
	    contextIsolation : true,
      	preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

//handle showing video sources menu
ipcMain.handle('show-video-sources-menu', async () => {
  try {
    const inputSources = await desktopCapturer.getSources({
      types: ['window', 'screen']
    });
    
    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map(source => {
        return {
          label: source.name,
          click: () => {
            // Send the selected source back to renderer
            mainWindow.webContents.send('video-source-selected', source);
          }
        };
      })
    );
    
    videoOptionsMenu.popup({window : mainWindow});
  } catch (error) {
    console.error('Error showing video sources menu:', error);
    throw error;
  }
});

ipcMain.handle("save-recording", async() => {
	try {
		const {filePath} = await dialog.showSaveDialog({
			buttonLabel : "Save Video",
			defaultPath : `vid-${Date.now()}.webm`,
			filters: [
				{ name: 'WebM Videos', extensions: ['webm'] },
				{ name: 'All Files', extensions: ['*'] }
			]
		})
		return filePath;
	}
	catch(error) {
		console.log("error : ", error);
		throw error;
	}
});

ipcMain.handle('save-file', async (event, { path, buffer }) => {
	if (path) {
		//convert arrayBuffer to Buffer
		const finalBuffer = Buffer.from(buffer);
		await fs.writeFile(path, finalBuffer);
		return 'File saved!';
	} else {
		return 'No path provided.';
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
