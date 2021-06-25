const peer = require('./peer-control')

peer.on('add-stream', (stream) => {
    play(stream)
})


let video = document.getElementById('screen-video')
function play(stream) {
    video.srcObject = stream
    video.onloadedmetadata = function() {
        // FIXME BUG 有几率不触发onloadedmetadata事件
        video.play()
    }
}

/**
 * 键盘事件
 * 
 * @param {event} e 
 */
window.onkeydown = function(e) {
    let data = {
        keyCode: e.keyCode,
        shift: e.shiftKey,
        meta: e.metaKey,
        control: e.ctrlKey,
        alt: e.altKey,
    }

    peer.emit('robot', 'key', data)
}

/**
 * 鼠标移动事件
 * 
 * @param {event} e 
 */
window.onmouseup = function(e) {
    let data = {
        clientX: e.clientX,
        clientY: e.clientY,
        video: {
            width: video.getBoundingClientRect().width,
            height: video.getBoundingClientRect().height
        }
    }

    peer.emit('robot', 'mouse', data)
}