/**
 * electron程序启动入口
 */
const { app } = require('electron')
const handleIPC = require('./ipc')
const robot = require('./robot')
const { create: createMainWindow, show: showMainWindow, close:closeMainWindow } = require('./windows/main')
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        showMainWindow()
    })
    app.on('ready', () => {
        createMainWindow()
        handleIPC()
        robot()
    })
    app.on('before-quit', () => {
        closeMainWindow()
    })
    app.on('activate', () => {
        showMainWindow()
    })
}



/**
 * 引入robotjs必须设置这一行
 * 
 * 参考链接 https://stackoverflow.com/questions/60106922/electron-non-context-aware-native-module-in-renderer
 */
app.allowRendererProcessReuse = false