/**
 * 抽离的主函数窗口
 */
const path = require('path')
const isDev = require('electron-is-dev')
const { BrowserWindow } = require('electron')

let win
let willQuitApp = false
function create() {
    win = new BrowserWindow({
        width: 1024,
        height: 650,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.on('close', (e) => {
        if (willQuitApp) {
            win = null
        } else {
            e.preventDefault()
            win.hide()
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:3000')
        // 调出控制台
        // win.webContents.openDevTools({ mode: 'right' })
    } else {
        // TODO 后续解决
        win.loadFile(path.resolve(__dirname, '../renderer/pages/main/index.html'))
    }
}

function send(channel, ...args) {
    win.webContents.send(channel, ...args)
}

function show() {
    win.show()
}

function close() {
    willQuitApp = true
    win.close()
}

module.exports = { create, send, show, close }