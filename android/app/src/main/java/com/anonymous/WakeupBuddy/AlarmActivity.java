package com.anonymous.WakeupBuddy;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.view.WindowManager;
import android.view.View;
import android.widget.Button;
import android.media.MediaPlayer;
import android.util.Log;
import androidx.annotation.Nullable;
import android.net.Uri;

public class AlarmActivity extends Activity {
    private static final String TAG = "AlarmActivity";
    private MediaPlayer player;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Set the native layout
        setContentView(R.layout.alarm_screen);

        // Wake screen and show over lock screen
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        );

        // Display alarm time if available
        Intent intent = getIntent();
        if (intent != null) {
            long alarmTime = intent.getLongExtra("alarmTime", 0);
            String buddyName = intent.getStringExtra("buddyName");
            
            if (alarmTime > 0) {
                android.widget.TextView timeText = findViewById(R.id.alarm_time_text);
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault());
                String formattedTime = sdf.format(new java.util.Date(alarmTime));
                timeText.setText("Alarm: " + formattedTime);
            }
            
            if (buddyName != null && !buddyName.isEmpty()) {
                android.widget.TextView buddyText = findViewById(R.id.buddy_info_text);
                buddyText.setText("👥 With: " + buddyName);
                buddyText.setVisibility(android.view.View.VISIBLE);
            }
        }

        // Play alarm sound
        try {
            Uri alert = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI;
            player = MediaPlayer.create(this, alert);
            if (player == null) {
                alert = android.provider.Settings.System.DEFAULT_NOTIFICATION_URI;
                player = MediaPlayer.create(this, alert);
            }
            if (player != null) {
                player.setLooping(true);
                player.start();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to play alarm sound", e);
        }

        // Set up the "I'm Awake" button
        Button awakeButton = findViewById(R.id.awake_button);
        awakeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopAlarmAndClose();
            }
        });
    }

    private void stopAlarmAndClose() {
        // Stop the alarm sound
        if (player != null) {
            player.stop();
            player.release();
            player = null;
        }

        // Launch the main app home screen with alarm dismissed parameter
        try {
            // Use the home route directly to avoid unmatched route errors
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("wakeupbuddy://(tabs)/home?alarm=dismissed"));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Failed to launch app", e);
        }

        // Close the activity
        finish();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        try {
            if (player != null) {
                player.stop();
                player.release();
                player = null;
            }
        } catch (Exception ignored) {}
    }
}
