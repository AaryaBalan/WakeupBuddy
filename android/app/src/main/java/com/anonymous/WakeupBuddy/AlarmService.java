package com.anonymous.WakeupBuddy;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.Vibrator;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class AlarmService extends Service {
    private static final String TAG = "AlarmService";
    private static final String CHANNEL_ID = "alarm_service_channel";
    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private PowerManager.WakeLock wakeLock;
    private TelephonyManager telephonyManager;
    private PhoneStateListener phoneStateListener;

    @Override
    public void onCreate() {
        super.onCreate();
        // Acquire WakeLock to keep CPU running
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "WakeupBuddy:AlarmServiceLock");
        wakeLock.acquire(10 * 60 * 1000L /* 10 minutes */);
        
        // Start listening for phone state changes
        setupPhoneStateListener();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if ("STOP".equals(action)) {
            stopSelf();
            return START_NOT_STICKY;
        }

        // Get extras
        long alarmTime = intent.getLongExtra("alarmTime", 0);
        String buddyName = intent.getStringExtra("buddyName");
        String alarmId = intent.getStringExtra("alarmId");

        // Start Foreground immediately
        startForeground(1001, buildNotification(alarmTime, buddyName, alarmId));

        // Play Sound
        playSound();

        // Vibrate
        vibrate();
        
        // Try to launch AlarmActivity from service as backup
        // This helps on some devices where receiver couldn't launch it
        tryLaunchAlarmActivity(alarmTime, buddyName, alarmId);

        return START_STICKY;
    }
    
    private void tryLaunchAlarmActivity(long alarmTime, String buddyName, String alarmId) {
        try {
            // Wake up the screen first
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            @SuppressWarnings("deprecation")
            PowerManager.WakeLock screenWakeLock = pm.newWakeLock(
                PowerManager.FULL_WAKE_LOCK | 
                PowerManager.ACQUIRE_CAUSES_WAKEUP | 
                PowerManager.ON_AFTER_RELEASE,
                "WakeupBuddy:ServiceScreenLock"
            );
            screenWakeLock.acquire(5000);
            
            // Small delay to let screen wake up
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                try {
                    Intent activityIntent = new Intent(this, AlarmActivity.class);
                    activityIntent.setFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK | 
                        Intent.FLAG_ACTIVITY_CLEAR_TOP |
                        Intent.FLAG_ACTIVITY_NO_USER_ACTION
                    );
                    activityIntent.putExtra("alarmTime", alarmTime);
                    if (buddyName != null) activityIntent.putExtra("buddyName", buddyName);
                    if (alarmId != null) activityIntent.putExtra("alarmId", alarmId);
                    
                    startActivity(activityIntent);
                    Log.i(TAG, "AlarmActivity launched from service");
                } catch (Exception e) {
                    Log.w(TAG, "Could not launch AlarmActivity from service: " + e.getMessage());
                } finally {
                    if (screenWakeLock.isHeld()) screenWakeLock.release();
                }
            }, 500);
        } catch (Exception e) {
            Log.e(TAG, "Error trying to launch alarm activity", e);
        }
    }

    private void playSound() {
        try {
            Uri alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alert == null) {
                alert = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            }
            
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setDataSource(this, alert);
            mediaPlayer.setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception e) {
            Log.e(TAG, "Error playing sound", e);
        }
    }

    private void vibrate() {
        vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            long[] pattern = {0, 1000, 1000}; // Wait 0, Vibrate 1s, Sleep 1s
            vibrator.vibrate(pattern, 0); // 0 = repeat from index 0
        }
    }

    private Notification buildNotification(long alarmTime, String buddyName, String alarmId) {
        createNotificationChannel();

        Intent fullScreenIntent = new Intent(this, AlarmActivity.class);
        fullScreenIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NO_USER_ACTION);
        fullScreenIntent.putExtra("alarmTime", alarmTime);
        if (buddyName != null) {
            fullScreenIntent.putExtra("buddyName", buddyName);
        }
        if (alarmId != null) {
            fullScreenIntent.putExtra("alarmId", alarmId);
        }
        
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
                this, 0, fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, AlarmService.class);
        stopIntent.setAction("STOP");
        PendingIntent stopPendingIntent = PendingIntent.getService(
                this, 0, stopIntent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Wake Up!")
                .setContentText("Alarm is ringing" + (buddyName != null ? " with " + buddyName : ""))
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)  // Show on lockscreen
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Dismiss", stopPendingIntent)
                .setOngoing(true)
                .setAutoCancel(false)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Alarm Service",
                    NotificationManager.IMPORTANCE_MAX  // MUST be MAX for fullScreenIntent to work when screen is off
            );
            channel.setSound(null, null); // Sound played by MediaPlayer
            channel.setBypassDnd(true);  // Bypass Do Not Disturb
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);  // Show on lockscreen
            channel.enableVibration(false);  // We handle vibration separately
            channel.setShowBadge(true);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        
        // Stop phone state listener
        if (telephonyManager != null && phoneStateListener != null) {
            telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
        }
        
        if (mediaPlayer != null) {
            try {
                mediaPlayer.stop();
                mediaPlayer.release();
            } catch (Exception e) {
                Log.e(TAG, "Error stopping media player", e);
            }
            mediaPlayer = null;
        }
        if (vibrator != null) {
            vibrator.cancel();
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }
    
    private void setupPhoneStateListener() {
        try {
            telephonyManager = (TelephonyManager) getSystemService(Context.TELEPHONY_SERVICE);
            if (telephonyManager != null) {
                phoneStateListener = new PhoneStateListener() {
                    @Override
                    public void onCallStateChanged(int state, String phoneNumber) {
                        super.onCallStateChanged(state, phoneNumber);
                        
                        // When phone is ringing (incoming call) or off-hook (outgoing/active call)
                        if (state == TelephonyManager.CALL_STATE_RINGING || state == TelephonyManager.CALL_STATE_OFFHOOK) {
                            Log.i(TAG, "📞 Call detected - auto-stopping alarm to give priority to call");
                            stopSelf(); // Stop the alarm service to give priority to the call
                        }
                    }
                };
                
                telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting up phone state listener", e);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
