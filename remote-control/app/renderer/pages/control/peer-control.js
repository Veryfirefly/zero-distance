/**
 * 控制端逻辑
 * 
 * @author XiaoYu
 */
const { ipcRenderer, desktopCapturer } = require('electron')
const EventEmitter = require('events');
const peer = new EventEmitter()

/**
 * 参考代码 attachAudioTrack
 * 
 * 获取桌面视频流
 */
// async function getScreenStream() {
//     const sources = await desktopCapturer.getSources({ types: ["window", "screen"] })

//     // 播放桌面流 audio选项必须设置为false
//     // 参考地址 https://www.electronjs.org/docs/api/desktop-capturer
//     navigator.webkitGetUserMedia({
//         audio: false,
//         video: {
//             mandatory: {
//                 chromeMediaSource: 'desktop',
//                 chromeMediaSourceId: sources[0].id,
//                 maxWidth: window.screen.width,
//                 maxHeight: window.screen.height
//             }
//         }
//     }, (stream) => {
//         // 附加音轨
//         peer.on('add-audio-track', (audioTrack) => {
//             console.debug("on [add-audio-track] :", audioTrack)

//             stream.addTrack(audioTrack)
//         })

//         peer.emit('add-stream', stream)
//     }, (err) => {
//         // handle err
//         console.error(err)
//     })

//     attachAudioTrack()
// }

/**
 * MediaStream API https://developer.mozilla.org/zh-CN/docs/Web/API/MediaStream
 * 
 * Attach Audio Track及录制视频保存到本地的参考地址 https://www.cnblogs.com/olivers/p/12609427.html
 */
async function attachAudioTrack() {
    navigator.webkitGetUserMedia({
        audio: true,
        video: false
    }, (audioStream) => {
        let audioTracks = audioStream.getAudioTracks();

        console.debug("all audio tracks: ", audioTracks);
        console.debug("selected audio tracks: ", audioTracks[0])

        peer.emit('add-audio-track', audioTracks[0])
    }, (err) => {
        console.error("can not resolve of audio track", err)
    })
}

/**
 * 获取相机视频流
 */
async function getCameraStream() {
    navigator.webkitGetUserMedia({
        audio: {
            // 回声消除，在外放的情况下，会有啸叫，设置为false会好很多，默认为true
            echoCancellation: false,
            // 抑制噪音
            noiseSuppression: true
        },
        video: {
            width: window.screen.width,
            height: window.screen.height,
            facingMode: "user",
            frameRate: 120.0
        }
    }, (stream) => {
        peer.emit('add-stream', stream)
    }, (err) => {
        // TODO 处理异常
        console.error(err);
    })
}


// TODO 在此处设置iceServer
const peerConnection = new window.RTCPeerConnection()
const dataChannel = peerConnection.createDataChannel('robotChannel', { reliable: false })

dataChannel.onopen = function () {
    peer.on('robot', (type, data) => {
        dataChannel.send(JSON.stringify({ type, data }))
    })
}

dataChannel.onmessage = function(event) {
    console.log('message', event)
}

dataChannel.onerror = (e) => {
    console.log('error', e)
}

peerConnection.onicecandidate = (e) => {
    console.log('candidate', e.candidate)
    if (e.candidate) {
        ipcRenderer.send('forward', 'control-candidate', e.candidate.toJSON())
    }
}

ipcRenderer.on('candidate', (e, candidate) => {
    addIceCandidate(candidate)
})

let candidates = []
/**
 * 添加candidate
 * 
 * @param {candidate} candidate 
 */
async function addIceCandidate(candidate) {
    if (candidate) {
        candidates.push(candidate)
    }

    if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
        for (let i = 0; i < candidates.length; i++) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidates[i]))
        }
        candidates = []
    }
}

/**
 * 创建offer
 */
async function createOffer() {
    const offer = await peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
    })

    await peerConnection.setLocalDescription(offer)
    console.log('peer connection offer', JSON.stringify(offer))
    return peerConnection.localDescription
}

/**
 * 
 * @param {RemoteDescription} answer 
 */
async function setRemote(answer) {
    await peerConnection.setRemoteDescription(answer)
}

ipcRenderer.on('answer', (e, answer) => {
    setRemote(answer)
})

createOffer().then((offer) => {
    ipcRenderer.send('forward', 'offer', { type: offer.type, sdp: offer.sdp })
})

peerConnection.onaddstream = function (e) {
    console.log('add stream', e)
    peer.emit('add-stream', e.stream)
}

module.exports = peer