# 🔒 Android Native - Permissions & Battery Optimization Guide

This document provides a technical and operational guide for navigating Android's security permissions and battery management features.

---

## 1. Why WakeupBuddy Requires Deep Android Permissions

Standard mobile applications operate under strict sandboxing. However, an accountability alarm clock that must ring reliably at an exact second—even if the device is locked, the app is closed, and Doze mode is active—requires explicit system-level exemptions:

| Permission | Android API Level | Purpose in WakeupBuddy | Fallback / Impact if Denied |
| :--- | :---: | :--- | :--- |
| **`SCHEDULE_EXACT_ALARM`** | API 31+ (Android 12+) | Schedules alarms with millisecond precision via `AlarmManager`. | Alarms will be batched and may fire 10-30 minutes late. |
| **`REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`** | API 23+ (Android 6+) | Bypasses Android Doze mode and manufacturer power savers. | OS will kill background timers when device is idle overnight. |
| **`SYSTEM_ALERT_WINDOW`** | All APIs | Enables drawing over other apps while phone is in use. | Ringing UI won't appear if user is using another app. |
| **`USE_FULL_SCREEN_INTENT`** | API 34+ (Android 14+) | Launches the alarm activity over the locked display. | Screen remains black; only notification audio plays. |
| **`CALL_PHONE`** | All APIs | Directly initiates automated call to buddy. | App cannot automatically dial; user must dial manually. |
| **`READ_CALL_LOG`** | All APIs | Reads call duration from call history. | Cannot verify 60-second talk time; streak won't update automatically. |
| **`READ_PHONE_STATE`** | All APIs | Monitors telephony call transitions (`CALL_STATE_OFFHOOK`, etc.). | Real-time call state events won't fire. |

---

## 2. Permission Check & Request Functions in `AlarmNative.js`

### 2.1 Exact Alarm Permission
```javascript
export async function canScheduleExactAlarms() {
    if (Platform.OS !== 'android') return true;
    return await AlarmModule.canScheduleExactAlarms();
}

export async function requestExactAlarmPermission() {
    // Opens Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
    await AlarmModule.openAlarmSettings();
}
```

### 2.2 Battery Optimization Exemption
```javascript
export async function isBatteryOptimizationDisabled() {
    if (Platform.OS !== 'android') return true;
    return await AlarmModule.isBatteryOptimizationDisabled();
}

export async function requestBatteryOptimization() {
    // Directs user to Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS
    await AlarmModule.requestBatteryOptimizationExemption();
}
```

### 2.3 Display Over Other Apps (Overlay)
```javascript
export async function canDrawOverlays() {
    if (Platform.OS !== 'android') return true;
    return await AlarmModule.canDrawOverlays();
}

export async function requestDrawOverlays() {
    // Opens Settings.ACTION_MANAGE_OVERLAY_PERMISSION
    await AlarmModule.requestDrawOverlays();
}
```

### 2.4 Android 14 Full Screen Intent
```javascript
export async function canUseFullScreenIntent() {
    if (Platform.OS !== 'android') return true;
    return await AlarmModule.canUseFullScreenIntent();
}

export async function requestFullScreenIntentPermission() {
    // Opens Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT
    await AlarmModule.requestFullScreenIntentPermission();
}
```

---

## 3. The `checkAllPermissions()` Diagnostic Aggregator

The `PermissionsGuide.jsx` screen uses `checkAllPermissions()` to inspect the status of all permissions in parallel:

```javascript
export async function checkAllPermissions() {
    const exactAlarms = await canScheduleExactAlarms();
    const batteryOpt = await isBatteryOptimizationDisabled();
    const overlays = await canDrawOverlays();
    const fullScreenIntent = await canUseFullScreenIntent();
    const callPhone = await hasCallPhonePermission();
    const readPhoneState = await hasReadPhoneStatePermission();
    const readCallLog = await hasReadCallLogPermission();

    const coreGranted = exactAlarms && batteryOpt && overlays && fullScreenIntent && callPhone;

    return {
        canScheduleExactAlarms: exactAlarms,
        batteryOptimizationDisabled: batteryOpt,
        canDrawOverlays: overlays,
        canUseFullScreenIntent: fullScreenIntent,
        hasCallPermission: callPhone,
        hasReadPhoneStatePermission: readPhoneState,
        hasReadCallLogPermission: readCallLog,
        coreGranted: coreGranted
    };
}
```
