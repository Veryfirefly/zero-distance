package com.dds.nodejs;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.dds.webrtc.R;


/**
 * <p>NodejsActivity -> MainActivity</p>
 * <p>Function -> 界面 O：头像[ O  O  O  O]，单人通讯</p>
 * <p>                      [===========], 正在通讯的房间</p>
 * <p>1. 邀请多人通话时为房间，若单人位一对一</p>
 *
 * Created by dds on 2018/11/7.
 * android_shuai@163.com
 */
public class MainActivity extends AppCompatActivity {

    private final static String DEFAULT_HOST = "wss://xsdq.xyz/wss";
    private final static String DEFAULT_ROOM = "1234";

    private EditText signalText;
    private EditText roomText;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_nodejs);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        initView();
        initVar();
    }

    /**
     * 获取按键
     */
    private void initView() {
        signalText = findViewById(R.id.et_signal);
        roomText = findViewById(R.id.et_room);
    }

    /**
     * 设置host和room参数
     */
    private void initVar() {
        signalText.setText(DEFAULT_HOST);
        roomText.setText(DEFAULT_ROOM);
    }

    /*-------------------------- nodejs版本服务器测试--------------------------------------------*/

    /**
     * 单人对话
     *
     * @param view
     */
    public void joinRoomSingleVideo(View view) {
        // TODO 写死，因为该信令服务器不会变
        String signalServerUri = signalText.getText().toString();
        // TODO room因为要在MainActivity中显示，所以需在信令服务器中生成并保存（如果有的话，没有就生成）
        String room = roomText.getText().toString().trim();

        WebrtcUtil.callSingle(this, signalServerUri, room, true);
    }

    /**
     * 加入房间
     *
     * @param view
     */
    public void joinRoom(View view) {
        WebrtcUtil.call(this, signalText.getText().toString(), roomText.getText().toString().trim());
    }

}
