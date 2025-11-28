package com.anonymous.WakeupBuddy;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    private static final String CHANNEL_ID = "alarm_channel";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "=== ALARM RECEIVER FIRED ===");
        Log.i(TAG, "Intent action: " + (intent != null ? intent.getAction() : "null"));
        
        try {
            // Get alarm time if provided
            long alarmTime = intent.getLongExtra("alarmTime", System.currentTimeMillis());
            String buddyName = intent.getStringExtra("buddyName");
            
            // Create intent for AlarmActivity
            Intent fullScreenIntent = new Intent(context, AlarmActivity.class);
            fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            fullScreenIntent.putExtra("alarmTime", alarmTime);
            if (buddyName != null) {
                fullScreenIntent.putExtra("buddyName", buddyName);
            }
            
            PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                context,
                0,
                fullScreenIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            // Create notification channel
            createNotificationChannel(context);
            
            // Try to start activity directly (helps on some devices/versions)
            try {
                context.startActivity(fullScreenIntent);
            } catch (Exception e) {
                Log.e(TAG, "Could not start activity directly", e);
            }
            
            // Build full-screen notification
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                    .setContentTitle("Wake Up!")
                    .setContentText("Time to wake up")
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC) // Show on lock screen
                    .setFullScreenIntent(fullScreenPendingIntent, true)
                    .setAutoCancel(true);
            
            NotificationManager notificationManager = 
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager != null) {
                notificationManager.notify(1001, builder.build());
                Log.i(TAG, "Full-screen notification posted");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error in AlarmReceiver", e);
        }
    }
    
    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Alarm Notifications",
                    NotificationManager.IMPORTANCE_MAX  // MAX priority for full-screen intents
            );
            channel.setDescription("Notifications for alarm clock");
            channel.enableVibration(true);
            channel.setSound(null, null); // Sound handled by AlarmActivity
            
            NotificationManager notificationManager = 
                    (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
