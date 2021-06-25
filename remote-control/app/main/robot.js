const { ipcMain } = require('electron')
const robot = require('robotjs')
const vkey = require('vkey')

function handleMouse(data) {
    let { clientX, clientY, screen, video } = data
    let x = clientX * screen.width / video.width
    let y = clientY * screen.height / video.height

    robot.moveMouse(x, y)
    robot.mouseClick()
}

function handleKey(data) {
    const modifiers = []
    if (data.meta) modifiers.push('meta')
    if (data.shift) modifiers.push('shift')
    if (data.alt) modifiers.push('alt')
    if (data.ctrl) modifiers.push('ctrl')

    let key = vkey[data.keyCode].toLowerCase()
    if (key[0] !== '<') {
        // <shift>
        robot.keyTap(key, modifiers)
    }
}

module.exports = function () {
    console.log('executed...');
    ipcMain.on('robot', (e, type, data) => {
        if (type === 'mouse') {
            handleMouse(data)
        } else if (type === 'key') {
            handleKey(data)
        }
    })
}