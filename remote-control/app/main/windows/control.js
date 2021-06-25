/**
 * 控制界面窗体
 */
const { BrowserWindow } = require('electron')
const path = require('path')
let win
function create() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.webContents.openDevTools({mode:'right'})
    win.loadFile(path.resolve(__dirname, '../../renderer/pages/control/index.html'))
}

function send(channel, ...args) {
    win.webContents.send(channel, ...args)
}
module.exports = { create, send }