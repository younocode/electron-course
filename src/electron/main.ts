import { BrowserWindow, app } from 'electron';
import path from 'path';
import { ipcMainHandler, ipcMainOn, isDev } from './util.js';
import { getStaticData, pollResources } from './resourceManager.js';
import { getPreloadPath } from './pathResolver.js';
import { createMenu } from './menu.js';
import { createTray } from './tray.js';
import { log } from 'console';

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        }
    });
    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    pollResources(mainWindow);

    ipcMainHandler('getStaticData', () => {
        return getStaticData()
    })


    ipcMainOn('sendFrameAction', (payload) => {
        switch (payload) {
            case 'CLOSE':
                mainWindow.close();
                break;
            case 'MAXIMIZE':
                mainWindow.maximize();
                break;
            case 'MINIMIZE':
                mainWindow.minimize();
                break;
        }
    });

    createTray(mainWindow);


    handleCloseEvents(mainWindow);

    createMenu(mainWindow);
})

function handleCloseEvents(mainWindow: BrowserWindow) {
    let willClose = false
    mainWindow.on('close', (e) => {
        if (willClose) {
            return;
        }
        e.preventDefault();
        mainWindow.hide();
        if (app.dock) {
            app.dock.hide();
        }
    });

    app.on('before-quit', () => {
        willClose = true;
    });

    mainWindow.on('show', () => {
        willClose = false;
    });
}
