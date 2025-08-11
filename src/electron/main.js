const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (isDev) {
    // In development, load from the Next.js dev server
    win.loadURL('http://localhost:9002');
    win.webContents.openDevTools();
  } else {
    // In production, load the exported static files
    // You would need to run `next build && next export`
    // and point to the `out` directory
    win.loadFile(path.join(__dirname, '../../.next/standalone/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
