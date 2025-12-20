package com.anonymous.WakeupBuddy;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "=== ALARM RECEIVER FIRED ===");
        
        // Acquire a FULL WakeLock to turn screen on AND keep CPU running
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        
        // First, acquire a partial wake lock for CPU
        PowerManager.WakeLock cpuLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "WakeupBuddy:ReceiverCpuLock");
        cpuLock.acquire(10000); // Hold for 10 seconds
        
        // Second, acquire FULL wake lock to turn screen ON (deprecated but still works for alarm apps)
        @SuppressWarnings("deprecation")
        PowerManager.WakeLock screenLock = pm.newWakeLock(
            PowerManager.FULL_WAKE_LOCK | 
            PowerManager.ACQUIRE_CAUSES_WAKEUP | 
            PowerManager.ON_AFTER_RELEASE, 
            "WakeupBuddy:ReceiverScreenLock"
        );
        screenLock.acquire(10000); // Hold for 10 seconds to ensure screen stays on

        try {
            long alarmTime = intent.getLongExtra("alarmTime", System.currentTimeMillis());
            String buddyName = intent.getStringExtra("buddyName");
            String alarmId = intent.getStringExtra("alarmId");
            
            // 1. Start Foreground Service FIRST (Plays Sound & Vibrate)
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
            
            Log.i(TAG, "Foreground service started");

            // 2. ALWAYS try to launch AlarmActivity directly
            // Multiple strategies to ensure it shows:
            // Strategy A: Direct launch with all necessary flags
            // Strategy B: Wake screen first, then launch
            
            Log.i(TAG, "Attempting to launch AlarmActivity...");
            
            Intent activityIntent = new Intent(context, AlarmActivity.class);
            activityIntent.setFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK | 
                Intent.FLAG_ACTIVITY_CLEAR_TOP | 
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_NO_USER_ACTION |
                Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
            );
            activityIntent.putExtra("alarmTime", alarmTime);
            if (buddyName != null) activityIntent.putExtra("buddyName", buddyName);
            if (alarmId != null) activityIntent.putExtra("alarmId", alarmId);
            
            try {
                context.startActivity(activityIntent);
                Log.i(TAG, "✅ AlarmActivity launched successfully");
            } catch (Exception e) {
                Log.e(TAG, "❌ Failed to launch AlarmActivity: " + e.getMessage());
            }
            
            Log.i(TAG, "AlarmReceiver completed successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error in AlarmReceiver", e);
        } finally {
            // Release locks after a delay to ensure everything starts
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                if (cpuLock.isHeld()) cpuLock.release();
                if (screenLock.isHeld()) screenLock.release();
            }, 10000); // Hold for 10 seconds
        }
    }
}
