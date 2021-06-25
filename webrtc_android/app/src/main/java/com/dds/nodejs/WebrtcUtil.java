package com.dds.nodejs;

import android.app.Activity;
import android.text.TextUtils;

import com.dds.webrtclib.WebRTCManager;
import com.dds.webrtclib.bean.MediaType;
import com.dds.webrtclib.bean.MyIceServer;
import com.dds.webrtclib.ui.ChatRoomActivity;
import com.dds.webrtclib.ui.ChatSingleActivity;
import com.dds.webrtclib.ws.IConnectEvent;

/**
 * Created by dds on 2019/1/7.
 * android_shuai@163.com
 */
public class WebrtcUtil {

    public static final String HOST = "xsdq.xyz";

    // turn and stun
    private static MyIceServer[] iceServers = {
            new MyIceServer("stun:stun.l.google.com:19302"),

            // 测试地址1
            new MyIceServer("stun:" + HOST + ":3478?transport=udp"),
            new MyIceServer("turn:" + HOST + ":3478?transport=udp",
                    "xiaoyu",
                    "xiaoyu123"),
            new MyIceServer("turn:" + HOST + ":3478?transport=tcp",
                    "xiaoyu",
                    "xiaoyu123"),
    };

    // signalling
    private final static String WSS = "wss://" + HOST + "/wss";
    // 本地测试信令地址
    // private static String WSS = "ws://192.168.1.138:3000";

    // one to one

    /**
     * TODO 信令服务器地址冗余，直接在配置里写死，详情请看 {@link MainActivity#joinRoomSingleVideo(android.view.View)}
     *
     * @param activity
     * @param wss
     * @param roomId
     * @param videoEnable
     */
    public static void callSingle(Activity activity, String wss, String roomId, boolean videoEnable) {
        if (TextUtils.isEmpty(wss)) {
            wss = WSS;
        }

        // 初始化WebRTCManager，将[信令服务器、stun服务器、Connect回调处理]传过去
        WebRTCManager.getInstance().init(wss, iceServers, new IConnectEvent() {
            @Override
            public void onSuccess() {
                ChatSingleActivity.openActivity(activity, videoEnable);
            }

            @Override
            public void onFailed(String msg) {

            }
        });
        WebRTCManager.getInstance().connect(videoEnable ? MediaType.TYPE_VIDEO : MediaType.TYPE_AUDIO, roomId);
    }

    // Videoconferencing
    public static void call(Activity activity, String wss, String roomId) {
        if (TextUtils.isEmpty(wss)) {
            wss = WSS;
        }
        WebRTCManager.getInstance().init(wss, iceServers, new IConnectEvent() {
            @Override
            public void onSuccess() {
                ChatRoomActivity.openActivity(activity);
            }

            @Override
            public void onFailed(String msg) {

            }
        });
        WebRTCManager.getInstance().connect(MediaType.TYPE_MEETING, roomId);
    }


}
