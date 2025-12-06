package com.anonymous.WakeupBuddy;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import java.util.Map;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action != null && (action.equals(Intent.ACTION_BOOT_COMPLETED) || 
                              action.equals("android.intent.action.QUICKBOOT_POWERON") ||
                              action.equals(Intent.ACTION_MY_PACKAGE_REPLACED))) {
            Log.i(TAG, "Device rebooted or app updated - rescheduling alarms");
            rescheduleAllAlarms(context);
        }
    }
    
    private void rescheduleAllAlarms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("WakeupBuddyAlarms", Context.MODE_PRIVATE);
        Map<String, ?> allAlarms = prefs.getAll();
        
        if (allAlarms == null || allAlarms.isEmpty()) {
            Log.i(TAG, "No alarms to reschedule");
            return;
        }
        
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) {
            Log.e(TAG, "AlarmManager not available");
            return;
        }
        
        // Check if we can schedule exact alarms (Android 12+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
            Log.w(TAG, "Cannot schedule exact alarms - permission not granted");
            return;
        }
        
        long now = System.currentTimeMillis();
        SharedPreferences.Editor editor = prefs.edit();
        
        for (Map.Entry<String, ?> entry : allAlarms.entrySet()) {
            String key = entry.getKey();
            if (!key.startsWith("alarm_")) continue;
            
            try {
                int requestCode = Integer.parseInt(key.replace("alarm_", ""));
                String value = (String) entry.getValue();
                String[] parts = value.split("\\|");
                
                long when = Long.parseLong(parts[0]);
                String buddyName = parts.length > 1 && !parts[1].isEmpty() ? parts[1] : null;
                String alarmId = parts.length > 2 && !parts[2].isEmpty() ? parts[2] : null;
                
                // Skip alarms that have already passed
                if (when <= now) {
                    Log.i(TAG, "Removing expired alarm: " + key);
                    editor.remove(key);
                    continue;
                }
                
                // Reschedule the alarm
                Intent alarmIntent = new Intent(context, AlarmReceiver.class);
                alarmIntent.putExtra("alarmTime", when);
                if (buddyName != null) {
                    alarmIntent.putExtra("buddyName", buddyName);
                }
                if (alarmId != null) {
                    alarmIntent.putExtra("alarmId", alarmId);
                }
                
                PendingIntent pi = PendingIntent.getBroadcast(
                    context, 
                    requestCode, 
                    alarmIntent, 
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(when, pi);
                    am.setAlarmClock(info, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, when, pi);
                }
                
                Log.i(TAG, "Rescheduled alarm: " + key + " for " + new java.util.Date(when));
            } catch (Exception e) {
                Log.e(TAG, "Failed to reschedule alarm: " + key, e);
            }
        }
        
        editor.apply();
    }
}
