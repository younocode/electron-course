const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
     // webContents send => ipcRenderer on
    subscribeStatistics: (callback: (statistics: Statistics) => void) => {
        ipcOn('statistics', (stats) => {
            callback(stats)
        });
    },
    // webContents send => ipcRenderer on
    subscribeChangeView: (callback: (view: View) => void) => {
        ipcOn('changeView', (view) => {
            callback(view)
        });
    },
    // ipcRenderer invoke => ipcMain handler
    getStaticData: () => ipcInvoke('getStaticData'),
    // ipcRenderer send => ipcMain on
    sendFrameAction: (payload: FrameWindowAction) => ipcSend('sendFrameAction', payload),
}) satisfies Window['electron'];

function ipcInvoke<Key extends keyof EventPayloadMapping>(key: Key): Promise<EventPayloadMapping[Key]> {
    return ipcRenderer.invoke(key)
}

function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload)
    ipcRenderer.on(key, cb);
    return () => ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
    key: Key,
    payload: EventPayloadMapping[Key]
) {
    ipcRenderer.send(key, payload);
}