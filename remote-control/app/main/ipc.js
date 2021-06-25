/**
 * 该文件是ipc通信文件
 * 
 * @author XiaoYu
 * @since 2021/06/25
 * @version 1.0.0
 */
const { ipcMain } = require('electron')
const { send: sendMainWindow } = require('./windows/main')
const { create: createControlWindow, send: sendControlWindow } = require('./windows/control')
const signal = require('./signal')

/**
 * 渲染进程请求+主进程响应（获取自己的控制码） ipcRenderer.invoke + ipcMain.handle
 * 主进程推送（告知状态） webContents.send, ipcRenderer.on
 * 渲染进程发起请求（申请控制） ipcRenderer.send, ipcMain.on
 */
module.exports = function () {

    /**
     * ipcMain处理登录事件
     */
    ipcMain.handle('login', async () => {
        let { code } = await signal.invoke('login', null, 'logined')
        return code
    })

    /**
     * 
     */
    ipcMain.on('control', async (e, remote) => {
        signal.send('control', { remote })
    })

    /**
     * ipcMain接收到control发来的forward事件，并转发到信令服务器中
     * puppet、control共享的信道，就是转发
     */
    ipcMain.on('forward', (e, event, data) => {
        signal.send('forward', { event, data })
    })

    /**
     * 
     */
    signal.on('controlled', (data) => {
        sendMainWindow('control-state-change', data.remote, 1)
        createControlWindow()
    })

    signal.on('be-controlled', (data) => {
        sendMainWindow('control-state-change', data.remote, 2)
    })

    /**
     * WebSocket接收到offer事件，将该事件从ipcMain转发到ipcRenderer(puppet)上
     */
    signal.on('offer', (data) => {
        sendMainWindow('offer', data)
    })

    /**
     * 收到puppet证书，answer响应
     */
    signal.on('answer', (data) => {
        sendControlWindow('answer', data)
    })

    /**
     * 收到control证书，puppet响应
     */
    signal.on('puppet-candidate', (data) => {
        sendControlWindow('candidate', data)
    })

    /**
     * 收到puppet证书，control响应
     */
    signal.on('control-candidate', (data) => {
        sendMainWindow('candidate', data)
    })
}