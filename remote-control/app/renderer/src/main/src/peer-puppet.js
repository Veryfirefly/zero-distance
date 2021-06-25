/**
 * 傀儡端逻辑
 */
// createAnswer
// addstream

import { desktopCapturer, ipcRenderer } from 'electron'

/**
 * 获取桌面视频流
 */
async function getScreenStream() {
    const sources = await desktopCapturer.getSources({ types: ["window", "screen"] })

    return new Promise((resolve, reject) => {
        // 播放桌面流 audio选项必须设置为false
        // 参考地址 https://www.electronjs.org/docs/api/desktop-capturer
        navigator.webkitGetUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sources[0].id,
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height
                }
            }
        }, (stream) => {
            resolve(stream)
        }, (err) => {
            // handle err
            console.error(err)
        })
    })

}

const peerConnection = new window.RTCPeerConnection()
peerConnection.ondatachannel = (e) => {
    console.log('datachannel', e)
    e.channel.onmessage = (e) => {
        let { type, data } = JSON.parse(e.data)
        if (type === 'mouse') {
            data.screen = {
                width: window.screen.width,
                height: window.screen.height
            }
        }
        ipcRenderer.send('robot', type, data)
    }
}

/**
 * FIX BUG: https://dotnet9.com/13400.html #21560
 * 
 * @param {RTCPeerConnectionIceEvent} e 
 */
peerConnection.onicecandidate = (e) => {
    // ipcRenderer不能发送非JavaScript对象，否则会抛出异常(#21560), An object could not be cloned
    // 需要调用RTCIceCandidate.toJSON()方法传递事件，toJSON: RTCIceCandidateInit
    if (e.candidate) {
        ipcRenderer.send('forward', 'puppet-candidate', e.candidate.toJSON())
    }
}

let candidates = []
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

window.addIceCandidate = addIceCandidate
ipcRenderer.on('offer', async (e, offer) => {
    let answer = await createAnswer(offer)
    let forwardData = { type: answer.type, sdp: answer.sdp };
    console.log('forward data:', forwardData)
    ipcRenderer.send('forward', 'answer', forwardData)
})

async function createAnswer(offer) {
    let screenStream = await getScreenStream()

    peerConnection.addStream(screenStream)
    await peerConnection.setRemoteDescription(offer)
    await peerConnection.setLocalDescription(await peerConnection.createAnswer())
    console.log('answer', JSON.stringify(peerConnection.localDescription))
    return peerConnection.localDescription
}

window.createAnswer = createAnswer