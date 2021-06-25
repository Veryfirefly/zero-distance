# INSTALL robotjs需要执行
 1. npm install --global --production windows-build-tools （如需安装Visual C ++ Build Tools 2015（节点7及以下版本所需），请使用windows-build-tools@1.4.2）
 2. npm install -g node-gyp
 3. npm install robotjs --save-dev

> 若npx electron-rebuild遇到问题, 执行如下操作

 1. npm cache clean -f
 2. npm install npm -g
 3. npm uninstall node-gyp -g
 4. npm uninstall node-gyp
 5. npm install node-gyp -g
 6. npm install electron-rebuild
 7. npx electron-rebuild


 # electron desktopCapturere navigator desktop video stream of code sample 
 
 > 播放桌面流 audio选项必须设置为false 参考地址 https://www.electronjs.org/docs/api/desktop-capturer
 ``` javascript
    desktopCapturer.getSources({ types: ['window', 'screen'] })
                .then(async sources => {
                        for (const source of sources) {
                            if (source.name === 'Screen 1') {
                                try {
                                    const stream = await navigator.mediaDevices.getUserMedia({
                                        audio: false,
                                        video: {
                                            mandatory: {
                                                chromeMediaSource: 'desktop',
                                                chromeMediaSourceId: source.id,
                                                minWidth: 1280,
                                                maxWidth: 1280,
                                                minHeight: 720,
                                                maxHeight: 720
                                            }
                                        }
                                    })
                                    peer.emit('add-stream', stream)
                                } catch (e) {
                                    console.error(e)
                                }
                            }
                        }
                    })
 ```

 ##### Java WebRTC Androd会用到
 > https://blog.csdn.net/irizhao/article/details/106640949

 