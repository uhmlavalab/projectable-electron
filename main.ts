import { app, BrowserWindow, screen, ipcMain, Display, ipcRenderer } from 'electron';
import * as path from 'path';
import * as url from 'url';

import * as functions from './electron-functions';

let windows: BrowserWindow[] = [];
let mainWindow: BrowserWindow;
let mapWindow: BrowserWindow;
const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

function createWindows() {

  mapWindow = null;
  mainWindow = null;

  screen.getAllDisplays().forEach(el => {
    const window = setupWindow(el);
    windows.push(window);
  });

  ipcMain.on('set-main-window', (evt, msg) => {
    windows.forEach(el => {
      if (el.webContents === evt.sender) {
        mainWindow = el;
        mainWindow.webContents.send('main-window-confirmation', 'Main Window successfully set.');
      }
    });
    if (mainWindow && mapWindow) {
      closeExtraWindows();
    }
  });

  ipcMain.on('set-map-window', (evt, msg) => {
    windows.forEach(el => {
      if (el.webContents === evt.sender) {
        mapWindow = el;
        mapWindow.webContents.send('map-window-confirmation', 'Map Window successfully set.');
      }
    });
    if (mainWindow && mapWindow) {
      closeExtraWindows();
    }
  });

  ipcMain.on('remove-window', (evt, msg) => {
    for (let i = 0; i < windows.length; i++) {
      if (windows[i].webContents === evt.sender) {
        windows.splice(i, 1);
      }
    }
  });


  ipcMain.on('message-to-main-window', (evt, msg) => {
    if (mainWindow) {
      mainWindow.webContents.send('message-for-main-window', msg);
    }
  });

  ipcMain.on('message-to-map-window', (evt, msg) => {
    if (mapWindow) {
      mapWindow.webContents.send('message-for-map-window', msg);
    }
  });

  ipcMain.on('message-to-unset-window', (evt, msg) => {
    windows.forEach(el => {
      el.webContents.send('message-for-unset-window', msg);
    });
  });

  ipcMain.on('clear-window-selections', (evt, msg) => {
    if (mapWindow) {
      mapWindow.webContents.send('message-for-map-window', { reset: true });
    }
    if (mainWindow) {
      mainWindow.webContents.send('message-for-main-window', { reset: true });
    }
    mapWindow = null;
    mainWindow = null;
  });

  ipcMain.on('is-window-set', (evt, msg) => {
    if (mapWindow && mapWindow.webContents === evt.sender) {
      mapWindow.webContents.send('window-is-set', { windowName: "map" });
    } else if (mainWindow && mainWindow.webContents === evt.sender) {
      mainWindow.webContents.send('window-is-set', { windowName: "main" });
    }
  });

  ipcMain.on('saveFile', (evt, msg) => functions.saveFile(mainWindow, msg));
  ipcMain.on('loadFile', (evt, msg) => {
    if (mapWindow && mapWindow.webContents === evt.sender) {
      functions.loadFile(mapWindow, msg);
    } else if (mainWindow && mainWindow.webContents === evt.sender) {
      functions.loadFile(mainWindow, msg);
    }
  });
  ipcMain.on('close', () => closeProgram());
}

function setupWindow(display: Display): BrowserWindow {
  const window = new BrowserWindow({
    x: 0 + display.bounds.x,
    y: 0 + display.bounds.y,
    width: display.workAreaSize.width * display.scaleFactor,
    height: display.workAreaSize.height * display.scaleFactor,
    fullscreen: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`),
      hardResetMethod: 'exit'
    });
    window.loadURL('http://localhost:4200');

  } else {
    window.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }
  return window;
}

function closeExtraWindows() {
  windows.forEach(el => {
    if (el !== mainWindow && el !== mapWindow) {
      el.close();
    }
  });
}

function closeProgram() {
  if (mainWindow) {
    mainWindow.close();
  }
  if (mapWindow) {
    mapWindow.close();
  }
  app.quit();
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindows);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
