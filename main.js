const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const resizeImg = require('resize-img');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

let mainWindow;

function createMainWindow () {
    mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    })
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

function createAboutWindow () {
    const aboutWindow = new BrowserWindow({
        width: 300,
        height: 300,
        title: 'About App',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', () => mainWindow = null);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createMainWindow()
        }
    })
});

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
            {
                label: 'About',
                click: () => createAboutWindow()
            }
        ]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [
            {
                label: 'About',
                click: () => createAboutWindow()
            }
        ]
    }] : []),
]

ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths,  } = await dialog.showOpenDialog({
        properties: ['openFile'] , // Allow selecting a single file
        filters: [
            { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }
        ]
    });
    if (!canceled && filePaths.length > 0) {
        return filePaths[0];
    } else {
        return null;
    }
});

ipcMain.on('resize-image', async (e, {imgPath, width, height}) => {
    const dest = path.join(os.homedir(), 'image-resizer');
    try {
        // Resize image
        const resizedImg = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        // Create directory if it doesn't exist
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // Write new image to file
        fs.writeFileSync(
            path.join(dest, path.basename(imgPath)),
            resizedImg
        );

        // Send notification
        mainWindow.webContents.send('image:done');

        // Open directory
        shell.openPath(dest);

    } catch (error) {
        console.log(error);
        
    }
});

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
})