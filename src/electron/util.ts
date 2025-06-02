import { ipcMain, WebContents } from "electron";
import { WebFrameMain } from "electron/main";
import { pathToFileURL } from "url";
import { getUIPath } from "./pathResolver.js";

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function ipcMainHandler<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key]
) {
  ipcMain.handle(key, (event) => {
    validateEventFrame(event.senderFrame)
    return handler();
  })
}

export function ipcMainOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (payload: EventPayloadMapping[Key]) => void
) {
  ipcMain.on(key, (event, payload) => {
    validateEventFrame(event.senderFrame)
    return handler(payload);
  })
}


export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key]
) {
  webContents.send(key, payload);
}


function validateEventFrame(frame: WebFrameMain | null) {
  if (!frame) {
    throw new Error('Invalid event frame');
  }
  if (isDev() && new URL(frame.url).hostname !== 'localhost:3000') {
    return
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error('Malicious event');
  }
}