package com.anonymous.WakeupBuddy;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "=== ALARM RECEIVER FIRED ===");
        
        // Acquire a temporary WakeLock to ensure CPU runs until Service starts
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "WakeupBuddy:ReceiverLock");
        wl.acquire(5000); // Hold for 5 seconds

        try {
            long alarmTime = intent.getLongExtra("alarmTime", System.currentTimeMillis());
            String buddyName = intent.getStringExtra("buddyName");
            String alarmId = intent.getStringExtra("alarmId");
            
            // 1. Start Foreground Service (Plays Sound & Vibrate)
            Intent serviceIntent = new Intent(context, AlarmService.class);
            serviceIntent.putExtra("alarmTime", alarmTime);
            if (buddyName != null) {
                serviceIntent.putExtra("buddyName", buddyName);
            }
            if (alarmId != null) {
                serviceIntent.putExtra("alarmId", alarmId);
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }

            // 2. Start Full-Screen Activity
            Intent fullScreenIntent = new Intent(context, AlarmActivity.class);
            fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            fullScreenIntent.putExtra("alarmTime", alarmTime);
            if (buddyName != null) {
                fullScreenIntent.putExtra("buddyName", buddyName);
            }
            if (alarmId != null) {
                fullScreenIntent.putExtra("alarmId", alarmId);
            }
            context.startActivity(fullScreenIntent);
            
        } catch (Exception e) {
            Log.e(TAG, "Error in AlarmReceiver", e);
        } finally {
            // Release lock if still held (though 5s timeout handles it)
            if (wl.isHeld()) wl.release();
        }
    }
}
