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

        updateUI(getIntent());

        // Set up the "I'm Awake" button
        Button awakeButton = findViewById(R.id.awake_button);
        awakeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopAlarmAndClose();
            }
        });
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        updateUI(intent);
    }

    private void updateUI(Intent intent) {
        if (intent != null) {
            long alarmTime = intent.getLongExtra("alarmTime", 0);
            String buddyName = intent.getStringExtra("buddyName");
            
            android.widget.TextView timeText = findViewById(R.id.alarm_time_text);
            android.widget.TextView buddyText = findViewById(R.id.buddy_info_text);

            if (alarmTime > 0) {
                java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault());
                String formattedTime = sdf.format(new java.util.Date(alarmTime));
                timeText.setText("Alarm: " + formattedTime);
            } else {
                timeText.setText("Alarm: --:--");
            }
            
            if (buddyName != null && !buddyName.isEmpty()) {
                buddyText.setText("👥 With: " + buddyName);
                buddyText.setVisibility(android.view.View.VISIBLE);
            } else {
                buddyText.setVisibility(android.view.View.GONE);
            }
        }
    }



    private void stopAlarmAndClose() {
        // Stop the Foreground Service (stops sound & vibration)
        Intent stopIntent = new Intent(this, AlarmService.class);
        stopIntent.setAction("STOP");
        startService(stopIntent);

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
        // Ensure service is stopped if activity is destroyed
        Intent stopIntent = new Intent(this, AlarmService.class);
        stopIntent.setAction("STOP");
        startService(stopIntent);
    }
}
