const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';

function createMainWindow () {
    const mainWindow = new BrowserWindow({
        width: isDev ? 1000 : 500,
        height: 600,
        webPreferences: {
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
        nodeIntegration: true
        }
    })

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

app.whenReady().then(() => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
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

app.on('window-all-closed', () => {
    if (!isMac) {
      app.quit()
    }
})