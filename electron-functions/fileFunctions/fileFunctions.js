"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var dataDir = 'C:/ProgramData/ProjecTable';
function loadFile(window, fileName) {
    fs.readFile(dataDir + "/" + fileName, function (err, data) {
        if (err)
            throw err;
        console.log(fileName);
        window.webContents.send('fileLoaded', data);
    });
}
exports.loadFile = loadFile;
function saveFile(window, msg) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    console.log(msg);
    fs.writeFile(dataDir + "/" + msg.filename, msg.file, function (err) {
        if (err)
            throw err;
        window.webContents.send('fileSaved', 'File Write Complete');
    });
}
exports.saveFile = saveFile;
//# sourceMappingURL=fileFunctions.js.map