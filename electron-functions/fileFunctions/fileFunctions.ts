import * as fs from 'fs';

const dataDir = 'C:/ProgramData/ProjecTable';

export function loadFile(window: Electron.BrowserWindow, fileName: string) {
    fs.readFile(`${dataDir}/${fileName}`, (err, data) => {
        if (err) throw err;
        window.webContents.send('fileLoaded', data);
    });
}


export function saveFile(window: Electron.BrowserWindow, msg: string) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    fs.writeFile(`${dataDir}/test.txt`, msg, (err) => {
        if (err) throw err;
        window.webContents.send('fileSaved', 'File Write Complete');
    });
}