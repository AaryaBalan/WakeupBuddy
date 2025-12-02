package com.anonymous.WakeupBuddy;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.provider.CallLog;
import android.database.Cursor;
import android.net.Uri;
import android.content.pm.PackageManager;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import androidx.core.content.ContextCompat;
import androidx.core.app.ActivityCompat;
import android.Manifest;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class AlarmModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private long callStartTime = 0;
    private String lastCalledNumber = null;
    private PhoneStateListener phoneStateListener;
    private TelephonyManager telephonyManager;
    private static final int READ_PHONE_STATE_REQUEST = 2;
    private Handler mainHandler;
    
    public AlarmModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.mainHandler = new Handler(Looper.getMainLooper());
    }
    
    @Override
    public String getName() {
        return "AlarmModule";
    }

    // Required for NativeEventEmitter
    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN event emitter
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN event emitter
    }

    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
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
    public void isBatteryOptimizationDisabled(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                android.os.PowerManager pm = (android.os.PowerManager) reactContext.getSystemService(Context.POWER_SERVICE);
                if (pm != null) {
                    boolean isIgnoring = pm.isIgnoringBatteryOptimizations(reactContext.getPackageName());
                    promise.resolve(isIgnoring);
                } else {
                    promise.resolve(false);
                }
            } else {
                // Pre-Android 6.0, battery optimization doesn't exist
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestBatteryOptimizationExemption(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void canDrawOverlays(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                boolean canDraw = Settings.canDrawOverlays(reactContext);
                promise.resolve(canDraw);
            } else {
                // Pre-Android 6.0, always allowed
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestDrawOverlays(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
                intent.setData(Uri.parse("package:" + reactContext.getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void scheduleExactAlarm(double timestampMs, String buddyName, String alarmId, int requestCode, Promise promise) {
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
            long when = (long) timestampMs;
            
            // Put extras in the intent so they persist
            intent.putExtra("alarmTime", when);
            if (buddyName != null) {
                intent.putExtra("buddyName", buddyName);
            }
            if (alarmId != null) {
                intent.putExtra("alarmId", alarmId);
            }
            
            PendingIntent pi = PendingIntent.getBroadcast(ctx, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    AlarmManager.AlarmClockInfo info = new AlarmManager.AlarmClockInfo(when, pi);
                    am.setAlarmClock(info, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
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

    @ReactMethod
    public void makePhoneCall(String phoneNumber, Promise promise) {
        try {
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                promise.reject("ERROR", "Phone number is required");
                return;
            }

            // Check if we have CALL_PHONE permission
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.CALL_PHONE) 
                != PackageManager.PERMISSION_GRANTED) {
                
                // Request permission
                ActivityCompat.requestPermissions(
                    getCurrentActivity(),
                    new String[]{Manifest.permission.CALL_PHONE},
                    1
                );
                
                promise.reject("PERMISSION_REQUIRED", "CALL_PHONE permission not granted. Please grant permission and try again.");
                return;
            }

            // Store the phone number for later lookup
            lastCalledNumber = phoneNumber.replaceAll("[^0-9]", ""); // Store only digits
            callStartTime = System.currentTimeMillis();

            // Start listening for call state changes
            startCallStateListener();

            // Permission granted, make the call
            Intent callIntent = new Intent(Intent.ACTION_CALL);
            callIntent.setData(Uri.parse("tel:" + phoneNumber));
            callIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(callIntent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", "Failed to make call: " + e.getMessage());
        }
    }

    /**
     * Get the duration of the last call from Android's call log
     * This is more reliable than tracking call state
     */
    @ReactMethod
    public void getLastCallDuration(String phoneNumber, Promise promise) {
        System.out.println("[AlarmModule] getLastCallDuration called with: " + phoneNumber);
        try {
            // Check READ_CALL_LOG permission
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_CALL_LOG) 
                != PackageManager.PERMISSION_GRANTED) {
                System.out.println("[AlarmModule] READ_CALL_LOG permission not granted");
                android.util.Log.e("AlarmModule", "READ_CALL_LOG permission not granted");
                promise.resolve(0);
                return;
            }

            String normalizedInput = phoneNumber.replaceAll("[^0-9]", "");
            // Get last 10 digits for matching
            String last10Digits = normalizedInput.length() > 10 
                ? normalizedInput.substring(normalizedInput.length() - 10) 
                : normalizedInput;
            
            System.out.println("[AlarmModule] Looking for calls to: " + phoneNumber + " (normalized: " + last10Digits + ")");
            android.util.Log.e("AlarmModule", "Looking for calls to: " + phoneNumber + " (normalized: " + last10Digits + ")");
            
            // Get callInitiatedTime from SharedPreferences to filter only calls after that time
            SharedPreferences prefs = reactContext.getSharedPreferences("WakeupBuddy", Context.MODE_PRIVATE);
            long callInitiatedTime = prefs.getLong("callInitiatedTime", 0);
            
            // If no callInitiatedTime, use 2 minutes ago as fallback
            if (callInitiatedTime == 0) {
                callInitiatedTime = System.currentTimeMillis() - (2 * 60 * 1000);
            }
            
            System.out.println("[AlarmModule] Looking for calls after: " + callInitiatedTime);
            
            // Query the call log for recent outgoing calls
            String[] projection = new String[]{
                CallLog.Calls.NUMBER,
                CallLog.Calls.DURATION,
                CallLog.Calls.DATE,
                CallLog.Calls.TYPE
            };
            
            // Get outgoing calls made AFTER call was initiated (not just 10 minutes ago)
            String selection = CallLog.Calls.TYPE + " = ? AND " + CallLog.Calls.DATE + " > ?";
            String[] selectionArgs = new String[]{
                String.valueOf(CallLog.Calls.OUTGOING_TYPE),
                String.valueOf(callInitiatedTime)
            };
            String sortOrder = CallLog.Calls.DATE + " DESC";
            
            Cursor cursor = reactContext.getContentResolver().query(
                CallLog.Calls.CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
            );
            
            int duration = 0;
            if (cursor != null) {
                System.out.println("[AlarmModule] Found " + cursor.getCount() + " outgoing calls after initiation time");
                android.util.Log.e("AlarmModule", "Found " + cursor.getCount() + " outgoing calls after initiation time");
                
                while (cursor.moveToNext()) {
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    int callDuration = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION));
                    long callDate = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));
                    
                    String normalizedLogNumber = number.replaceAll("[^0-9]", "");
                    String logLast10 = normalizedLogNumber.length() > 10 
                        ? normalizedLogNumber.substring(normalizedLogNumber.length() - 10) 
                        : normalizedLogNumber;
                    
                    System.out.println("[AlarmModule] Call log entry: " + number + " (normalized: " + logLast10 + "), duration: " + callDuration + "s");
                    android.util.Log.e("AlarmModule", "Call log entry: " + number + " (normalized: " + logLast10 + "), duration: " + callDuration + "s");
                    
                    // Match by last 10 digits
                    if (logLast10.equals(last10Digits) || 
                        logLast10.endsWith(last10Digits) || 
                        last10Digits.endsWith(logLast10)) {
                        duration = callDuration;
                        System.out.println("[AlarmModule] MATCH FOUND! Duration: " + duration + " seconds");
                        android.util.Log.e("AlarmModule", "MATCH FOUND! Duration: " + duration + " seconds");
                        break;
                    }
                }
                cursor.close();
            } else {
                System.out.println("[AlarmModule] Cursor is null - query failed");
                android.util.Log.e("AlarmModule", "Cursor is null - query failed");
            }
            
            System.out.println("[AlarmModule] Returning duration: " + duration);
            android.util.Log.e("AlarmModule", "Returning duration: " + duration);
            promise.resolve(duration);
        } catch (Exception e) {
            android.util.Log.e("AlarmModule", "Error getting call duration: " + e.getMessage());
            promise.resolve(0);
        }
    }

    /**
     * Get the duration of the most recent outgoing call (regardless of number)
     */
    @ReactMethod
    public void getMostRecentCallDuration(Promise promise) {
        System.out.println("[AlarmModule] getMostRecentCallDuration called");
        try {
            // Check READ_CALL_LOG permission
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_CALL_LOG) 
                != PackageManager.PERMISSION_GRANTED) {
                System.out.println("[AlarmModule] getMostRecentCallDuration: READ_CALL_LOG permission not granted");
                promise.resolve(0);
                return;
            }
            
            System.out.println("[AlarmModule] Permission granted, querying call log...");
            
            // Get callInitiatedTime from SharedPreferences to filter only calls after that time
            SharedPreferences prefs = reactContext.getSharedPreferences("WakeupBuddy", Context.MODE_PRIVATE);
            long callInitiatedTime = prefs.getLong("callInitiatedTime", 0);
            
            // If no callInitiatedTime, use 2 minutes ago as fallback
            if (callInitiatedTime == 0) {
                callInitiatedTime = System.currentTimeMillis() - (2 * 60 * 1000);
            }
            
            System.out.println("[AlarmModule] Looking for calls after: " + callInitiatedTime);
            
            // Get the most recent outgoing call made AFTER call was initiated
            String selection = CallLog.Calls.TYPE + " = ? AND " + CallLog.Calls.DATE + " > ?";
            String[] selectionArgs = new String[]{
                String.valueOf(CallLog.Calls.OUTGOING_TYPE),
                String.valueOf(callInitiatedTime)
            };
            String sortOrder = CallLog.Calls.DATE + " DESC";
            
            System.out.println("[AlarmModule] Executing query...");
            
            Cursor cursor = reactContext.getContentResolver().query(
                CallLog.Calls.CONTENT_URI,
                new String[]{CallLog.Calls.DURATION, CallLog.Calls.NUMBER, CallLog.Calls.DATE},
                selection,
                selectionArgs,
                sortOrder
            );
            
            System.out.println("[AlarmModule] Query executed, cursor: " + (cursor != null ? "not null" : "null"));
            
            int duration = 0;
            if (cursor != null) {
                System.out.println("[AlarmModule] Cursor count: " + cursor.getCount());
                if (cursor.moveToFirst()) {
                    duration = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION));
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    long date = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));
                    System.out.println("[AlarmModule] Most recent call after initiation: " + number + ", duration: " + duration + "s, date: " + date);
                } else {
                    System.out.println("[AlarmModule] No calls found after initiation time");
                }
                cursor.close();
            }
            
            System.out.println("[AlarmModule] Returning duration: " + duration);
            promise.resolve(duration);
        } catch (Exception e) {
            System.out.println("[AlarmModule] Exception in getMostRecentCallDuration: " + e.getMessage());
            android.util.Log.e("AlarmModule", "Exception in getMostRecentCallDuration", e);
            e.printStackTrace();
            promise.resolve(0);
        }
    }

    /**
     * Save pending call information to SharedPreferences
     */
    @ReactMethod
    public void savePendingCall(String callId, String phoneNumber, Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("WakeupBuddy", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("pendingCallId", callId);
            editor.putString("pendingPhoneNumber", phoneNumber);
            editor.putLong("callInitiatedTime", System.currentTimeMillis());
            editor.apply();
            
            System.out.println("[AlarmModule] Saved pending call: " + callId + " to " + phoneNumber);
            promise.resolve(true);
        } catch (Exception e) {
            System.out.println("[AlarmModule] Error saving pending call: " + e.getMessage());
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Check for pending calls and return call info with duration if found
     */
    @ReactMethod
    public void checkPendingCall(Promise promise) {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("WakeupBuddy", Context.MODE_PRIVATE);
            String callId = prefs.getString("pendingCallId", null);
            String phoneNumber = prefs.getString("pendingPhoneNumber", null);
            long callInitiatedTime = prefs.getLong("callInitiatedTime", 0);
            
            System.out.println("[AlarmModule] Checking pending call: callId=" + callId + ", phoneNumber=" + phoneNumber);
            
            if (callId == null || phoneNumber == null) {
                System.out.println("[AlarmModule] No pending call found");
                promise.resolve(null);
                return;
            }
            
            // Check if call was initiated within last 15 minutes
            long timeSinceInitiated = System.currentTimeMillis() - callInitiatedTime;
            if (timeSinceInitiated > 15 * 60 * 1000) {
                System.out.println("[AlarmModule] Pending call too old, clearing");
                clearPendingCall();
                promise.resolve(null);
                return;
            }
            
            // Don't check call log if call was initiated less than 10 seconds ago
            // (call might still be in progress or call log not updated yet)
            if (timeSinceInitiated < 10 * 1000) {
                System.out.println("[AlarmModule] Call initiated too recently (" + timeSinceInitiated + "ms ago), skipping check");
                promise.resolve(null);
                return;
            }
            
            // Try to get call duration
            int duration = 0;
            
            // Check READ_CALL_LOG permission
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_CALL_LOG) 
                == PackageManager.PERMISSION_GRANTED) {
                
                // First try by phone number
                String normalizedInput = phoneNumber.replaceAll("[^0-9]", "");
                String last10Digits = normalizedInput.length() > 10 
                    ? normalizedInput.substring(normalizedInput.length() - 10) 
                    : normalizedInput;
                
                // IMPORTANT: Only look for calls that happened AFTER we initiated the call
                // This prevents picking up old call durations from previous conversations
                String selection = CallLog.Calls.TYPE + " = ? AND " + CallLog.Calls.DATE + " > ?";
                String[] selectionArgs = new String[]{
                    String.valueOf(CallLog.Calls.OUTGOING_TYPE),
                    String.valueOf(callInitiatedTime) // Use callInitiatedTime, not tenMinutesAgo
                };
                String sortOrder = CallLog.Calls.DATE + " DESC";
                
                System.out.println("[AlarmModule] Looking for calls after: " + callInitiatedTime + " (initiated " + timeSinceInitiated + "ms ago)");
                
                Cursor cursor = reactContext.getContentResolver().query(
                    CallLog.Calls.CONTENT_URI,
                    new String[]{CallLog.Calls.NUMBER, CallLog.Calls.DURATION, CallLog.Calls.DATE},
                    selection,
                    selectionArgs,
                    sortOrder
                );
                
                if (cursor != null) {
                    System.out.println("[AlarmModule] Found " + cursor.getCount() + " calls after initiation time");
                    while (cursor.moveToNext() && duration == 0) {
                        String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                        int callDuration = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION));
                        long callDate = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));
                        
                        String normalizedLogNumber = number.replaceAll("[^0-9]", "");
                        String logLast10 = normalizedLogNumber.length() > 10 
                            ? normalizedLogNumber.substring(normalizedLogNumber.length() - 10) 
                            : normalizedLogNumber;
                        
                        System.out.println("[AlarmModule] Call in log: " + number + " (last10: " + logLast10 + "), duration: " + callDuration + "s, date: " + callDate);
                        
                        if (logLast10.equals(last10Digits)) {
                            duration = callDuration;
                            System.out.println("[AlarmModule] ✅ Found matching call duration: " + duration + "s");
                        }
                    }
                    cursor.close();
                }
                
                // If still 0 and we found calls, take the most recent one that was made after initiation
                if (duration == 0) {
                    System.out.println("[AlarmModule] No matching number found, trying most recent call after initiation");
                    cursor = reactContext.getContentResolver().query(
                        CallLog.Calls.CONTENT_URI,
                        new String[]{CallLog.Calls.DURATION, CallLog.Calls.DATE, CallLog.Calls.NUMBER},
                        selection,
                        selectionArgs,
                        sortOrder
                    );
                    
                    if (cursor != null && cursor.moveToFirst()) {
                        duration = cursor.getInt(cursor.getColumnIndexOrThrow(CallLog.Calls.DURATION));
                        long callDate = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));
                        String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                        System.out.println("[AlarmModule] Using most recent call after initiation: " + number + ", duration: " + duration + "s, date: " + callDate);
                        cursor.close();
                    } else {
                        System.out.println("[AlarmModule] No calls found after initiation time");
                    }
                }
            }
            
            WritableMap result = Arguments.createMap();
            result.putString("callId", callId);
            result.putString("phoneNumber", phoneNumber);
            result.putInt("duration", duration);
            
            System.out.println("[AlarmModule] Returning pending call with duration: " + duration);
            promise.resolve(result);
            
        } catch (Exception e) {
            System.out.println("[AlarmModule] Error checking pending call: " + e.getMessage());
            e.printStackTrace();
            promise.reject("ERROR", e.getMessage());
        }
    }

    /**
     * Clear pending call information
     */
    @ReactMethod
    public void clearPendingCall() {
        try {
            SharedPreferences prefs = reactContext.getSharedPreferences("WakeupBuddy", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.remove("pendingCallId");
            editor.remove("pendingPhoneNumber");
            editor.remove("callInitiatedTime");
            editor.apply();
            System.out.println("[AlarmModule] Cleared pending call");
        } catch (Exception e) {
            System.out.println("[AlarmModule] Error clearing pending call: " + e.getMessage());
        }
    }

    private void startCallStateListener() {
        try {
            // Check READ_PHONE_STATE permission
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) 
                != PackageManager.PERMISSION_GRANTED) {
                // Request permission if not granted
                if (getCurrentActivity() != null) {
                    ActivityCompat.requestPermissions(
                        getCurrentActivity(),
                        new String[]{Manifest.permission.READ_PHONE_STATE},
                        READ_PHONE_STATE_REQUEST
                    );
                }
                return;
            }

            telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
            
            if (telephonyManager != null) {
                phoneStateListener = new PhoneStateListener() {
                    @Override
                    public void onCallStateChanged(int state, String phoneNumber) {
                        switch (state) {
                            case TelephonyManager.CALL_STATE_OFFHOOK:
                                // Call started (connected)
                                callStartTime = System.currentTimeMillis();
                                WritableMap startParams = Arguments.createMap();
                                startParams.putString("status", "started");
                                startParams.putDouble("startTime", callStartTime);
                                sendEvent("CallStateChanged", startParams);
                                break;
                            
                            case TelephonyManager.CALL_STATE_IDLE:
                                // Call ended
                                if (callStartTime > 0) {
                                    long callEndTime = System.currentTimeMillis();
                                    long duration = (callEndTime - callStartTime) / 1000; // Convert to seconds
                                    
                                    WritableMap endParams = Arguments.createMap();
                                    endParams.putString("status", "ended");
                                    endParams.putDouble("duration", duration);
                                    endParams.putDouble("startTime", callStartTime);
                                    endParams.putDouble("endTime", callEndTime);
                                    sendEvent("CallStateChanged", endParams);
                                    
                                    callStartTime = 0; // Reset
                                }
                                // Stop listening after call ends
                                stopCallStateListener();
                                break;
                            
                            case TelephonyManager.CALL_STATE_RINGING:
                                // Phone is ringing
                                break;
                        }
                    }
                };
                
                telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
            }
        } catch (Exception e) {
            // Log error but don't fail the call
            e.printStackTrace();
        }
    }

    private void stopCallStateListener() {
        try {
            if (telephonyManager != null && phoneStateListener != null) {
                telephonyManager.listen(phoneStateListener, PhoneStateListener.LISTEN_NONE);
                phoneStateListener = null;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void hasReadPhoneStatePermission(Promise promise) {
        try {
            boolean granted = ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) 
                == PackageManager.PERMISSION_GRANTED;
            promise.resolve(granted);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void requestReadPhoneStatePermission(Promise promise) {
        try {
            if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) 
                == PackageManager.PERMISSION_GRANTED) {
                promise.resolve(true);
                return;
            }

            if (getCurrentActivity() != null) {
                ActivityCompat.requestPermissions(
                    getCurrentActivity(),
                    new String[]{Manifest.permission.READ_PHONE_STATE},
                    READ_PHONE_STATE_REQUEST
                );
                promise.resolve(true);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
