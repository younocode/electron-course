import osUtils from "os-utils";
import fs from "fs";
import os from "os";
import { BrowserWindow } from 'electron';
import { ipcWebContentsSend } from "./util.js";


const POLLING_INTERVAL = 500;

export function pollResources(mainWindow: BrowserWindow) {
    setInterval(async () => {
        const cpuUsage = await getCpuUsage();
        const ramUsage = getRamUsage();
        const storageData = getStorageData();

        ipcWebContentsSend("statistics", mainWindow.webContents, {
            cpuUsage,
            ramUsage,
            storageUsage: storageData.usage
        })

    }, POLLING_INTERVAL);
}

export function getStaticData() {
    const totalStorage = getStorageData().total;
    const cpuModel = os.cpus()[0].model;
    const totalMemoryGB = Math.floor(os.totalmem() / 1024); // Convert to GB
    return {
        cpuModel,
        totalStorage,
        totalMemoryGB
    };
}

export function getCpuUsage() {
    return new Promise<number>((resolve) => {
        osUtils.cpuUsage(resolve)
    })
}

export function getRamUsage() {
    return 1 - osUtils.freememPercentage()
}

export function getStorageData() {
    const stats = fs.statfsSync(process.platform === "win32" ? "C://" : "/");
    const total = stats.bsize * stats.blocks;
    const free = stats.bsize * stats.bfree;
    return {
        total: Math.floor(total / 1_000_000_000), // Convert to MB
        usage: 1 - free / total
    }
}