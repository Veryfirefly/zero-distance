package com.dds.webrtclib;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import com.dds.webrtclib.bean.MediaType;
import com.dds.webrtclib.bean.MyIceServer;
import com.dds.webrtclib.ws.IConnectEvent;
import com.dds.webrtclib.ws.ISignalingEvents;
import com.dds.webrtclib.ws.IWebSocket;
import com.dds.webrtclib.ws.JavaWebSocket;

import org.webrtc.EglBase;
import org.webrtc.IceCandidate;

import java.util.ArrayList;
import java.util.List;

/**
 * 控制信令和各种操作
 * Created by dds on 2019/4/5.
 * android_shuai@163.com
 */
public class WebRTCManager implements ISignalingEvents {

    private final static String TAG = "sing_WebRTCManager";

    /**
     * 信令地址 WebSocket
     */
    private String _wss;

    /**
     * Stun服务器
     */
    private MyIceServer[] _iceServers;

    /**
     * WebSocket
     */
    private IWebSocket _webSocket;

    /**
     * RTCPeerConnection Helper
     */
    private PeerConnectionHelper _peerHelper;

    /**
     * 房间ID
     */
    private String _roomId;

    /**
     * 视频类型
     */
    private int _mediaType;

    private boolean _videoEnable;

    /**
     * 与信令连接后，所做的Activity的回调事件
     */
    private IConnectEvent _connectEvent;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private static volatile WebRTCManager INSTANCE;

    public static WebRTCManager getInstance() {
        if (INSTANCE == null) {
            synchronized (WebRTCManager.class) {
                if (INSTANCE == null) {
                    INSTANCE = new WebRTCManager();
                }
            }
        }
        return INSTANCE;
    }

    /**
     * init address
     *
     * @param wss 信令服务器地址 WebSocket
     * @param iceServers stun服务器
     * @param event {@link IConnectEvent} 与信令连接后，Activity的回调事件
     */
    public void init(String wss, MyIceServer[] iceServers, IConnectEvent event) {
        this._wss = wss;
        this._iceServers = iceServers;
        _connectEvent = event;
    }

    /**
     * connect
     *
     * @param mediaType 视频类型
     * @param roomId 房间号
     */
    public void connect(int mediaType, String roomId) {
        if (_webSocket == null) {
            _mediaType = mediaType;
            _videoEnable = mediaType != MediaType.TYPE_AUDIO;
            _roomId = roomId;
            _webSocket = new JavaWebSocket(this);
            _webSocket.connect(_wss);
            _peerHelper = new PeerConnectionHelper(_webSocket, _iceServers);
        } else {
            // 正在通话中
            _webSocket.close();
            _webSocket = null;
            _peerHelper = null;
        }

    }


    public void setCallback(IViewCallback callback) {
        if (_peerHelper != null) {
            _peerHelper.setViewCallback(callback);
        }
    }

    //===================================控制功能==============================================

    /**
     * 加入房间
     *
     * @param context
     * @param eglBase
     */
    public void joinRoom(Context context, EglBase eglBase) {
        if (_peerHelper != null) {
            _peerHelper.initContext(context, eglBase);
        }
        if (_webSocket != null) {
            _webSocket.joinRoom(_roomId);
        }

    }

    /**
     * 切换相机
     */
    public void switchCamera() {
        if (_peerHelper != null) {
            _peerHelper.switchCamera();
        }
    }

    /**
     * 切换静音
     *
     * @param enable 是否静音
     */
    public void toggleMute(boolean enable) {
        if (_peerHelper != null) {
            _peerHelper.toggleMute(enable);
        }
    }

    public void toggleSpeaker(boolean enable) {
        if (_peerHelper != null) {
            _peerHelper.toggleSpeaker(enable);
        }
    }

    /**
     * 退出房间
     */
    public void exitRoom() {
        if (_peerHelper != null) {
            _webSocket = null;
            _peerHelper.exitRoom();
        }
    }

    // ==================================信令回调===============================================
    @Override
    public void onWebSocketOpen() {
        handler.post(() -> {
            if (_connectEvent != null) {
                _connectEvent.onSuccess();
            }
        });
    }

    @Override
    public void onWebSocketOpenFailed(String msg) {
        handler.post(() -> {
            if (_webSocket != null && !_webSocket.isOpen()) {
                _connectEvent.onFailed(msg);
            } else {
                if (_peerHelper != null) {
                    _peerHelper.exitRoom();
                }
            }
        });
    }

    @Override
    public void onJoinToRoom(ArrayList<String> connections, String myId) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onJoinToRoom(connections, myId, _videoEnable, _mediaType);
                if (_mediaType == MediaType.TYPE_VIDEO || _mediaType == MediaType.TYPE_MEETING) {
                    toggleSpeaker(true);
                }
            }
        });
    }

    @Override
    public void onRemoteJoinToRoom(String socketId) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onRemoteJoinToRoom(socketId);

            }
        });

    }

    @Override
    public void onRemoteIceCandidate(String socketId, IceCandidate iceCandidate) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onRemoteIceCandidate(socketId, iceCandidate);
            }
        });
    }

    @Override
    public void onRemoteIceCandidateRemove(String socketId, List<IceCandidate> iceCandidates) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onRemoteIceCandidateRemove(socketId, iceCandidates);
            }
        });
    }

    @Override
    public void onRemoteOutRoom(String socketId) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onRemoteOutRoom(socketId);
            }
        });
    }

    @Override
    public void onReceiveOffer(String socketId, String sdp) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onReceiveOffer(socketId, sdp);
            }
        });
    }

    @Override
    public void onReceiverAnswer(String socketId, String sdp) {
        handler.post(() -> {
            if (_peerHelper != null) {
                _peerHelper.onReceiverAnswer(socketId, sdp);
            }
        });
    }

}
