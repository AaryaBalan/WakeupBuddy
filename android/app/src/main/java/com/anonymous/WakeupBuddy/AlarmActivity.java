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
            // Get buddy email and alarm time from the intent
            String buddyEmail = getIntent().getStringExtra("buddyName");
            long alarmTimeMs = getIntent().getLongExtra("alarmTime", 0);
            
            // Build deep link URL with parameters
            String deepLinkUrl = "wakeupbuddy://(tabs)/home?alarm=dismissed";
            
            if (buddyEmail != null && !buddyEmail.isEmpty()) {
                String encodedEmail = Uri.encode(buddyEmail);
                deepLinkUrl += "&buddy=" + encodedEmail;
            }
            
            if (alarmTimeMs > 0) {
                // Format time to match DB format (e.g., "5:43" and "PM")
                java.text.SimpleDateFormat timeFormat = new java.text.SimpleDateFormat("h:mm", java.util.Locale.US);
                java.text.SimpleDateFormat ampmFormat = new java.text.SimpleDateFormat("a", java.util.Locale.US);
                java.util.Date date = new java.util.Date(alarmTimeMs);
                
                String timeStr = timeFormat.format(date);
                String ampmStr = ampmFormat.format(date);
                
                deepLinkUrl += "&time=" + Uri.encode(timeStr) + "&ampm=" + Uri.encode(ampmStr);
            }
            
            Log.d(TAG, "Launching app with deep link: " + deepLinkUrl);
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUrl));
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
