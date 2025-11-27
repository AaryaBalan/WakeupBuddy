package com.anonymous.WakeupBuddy;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.Context;
import android.os.Build;
import android.provider.Settings;
import android.net.Uri;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class AlarmModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    
    public AlarmModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }
    
    @Override
    public String getName() {
        return "AlarmModule";
    }

    @ReactMethod
    public void canScheduleExactAlarms(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) reactContext.getSystemService(Context.ALARM_SERVICE);
            if (am != null) {
                promise.resolve(am.canScheduleExactAlarms());
            } else {
                promise.resolve(false);
            }
        } else {
            // Pre-Android 12, always allowed
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void openAlarmSettings(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void scheduleExactAlarm(double timestampMs, int requestCode, Promise promise) {
        try {
            Context ctx = getReactApplicationContext();
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            
            // Check if we can schedule exact alarms
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (am != null && !am.canScheduleExactAlarms()) {
                    promise.reject("PERMISSION_REQUIRED", "Exact alarm permission not granted");
                    return;
                }
            }
            
            Intent intent = new Intent(ctx, AlarmReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(ctx, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            long when = (long) timestampMs;
            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, when, pi);
                }
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "AlarmManager not available");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void cancelAlarm(int requestCode, Promise promise) {
        try {
            Context ctx = getReactApplicationContext();
            AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
            Intent intent = new Intent(ctx, AlarmReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(ctx, requestCode, intent, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
            if (pi != null && am != null) {
                am.cancel(pi);
                pi.cancel();
                promise.resolve(true);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
