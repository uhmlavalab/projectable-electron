import * as fs from 'fs';

const dataDir = 'C:/ProgramData/ProjecTable';

export function loadFile(window: Electron.BrowserWindow, fileName: string) {
    fs.readFile(`${dataDir}/${fileName}`, (err, data) => {
        if (err) throw err;
        console.log(fileName);
        window.webContents.send('fileLoaded', data);
    });
}


export function saveFile(window: Electron.BrowserWindow, msg: {filename: string, file: File}) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    console.log(msg);
    fs.writeFile(`${dataDir}/${msg.filename}`, msg.file, (err) => {
        if (err) throw err;
       window.webContents.send('fileSaved', 'File Write Complete');
    });
}