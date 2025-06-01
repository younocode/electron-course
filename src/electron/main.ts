import { BrowserWindow, app } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';

app.on('ready', () => {
    const mainWindow = new BrowserWindow({});
    if (isDev()) {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

     pollResources(mainWindow);
})