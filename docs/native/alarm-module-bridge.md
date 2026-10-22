# 🌉 Android Native - Alarm Module Bridge Reference

This document provides a technical specification for the React Native bridge connecting JavaScript code (`app/native/AlarmNative.js`) to Android's native Java layer (`android/.../AlarmModule.java`).

---

## 1. Bridge Architecture & Event Emitter

Communication between JavaScript and Java occurs via:
1. **Asynchronous Method Calls**: JavaScript calls `@ReactMethod` functions on `AlarmModule` which resolve or reject standard JavaScript Promises.
2. **Device Event Emitter**: `AlarmModule` emits `CallStateChanged` events to JavaScript to stream call duration updates in real time.

```
┌───────────────────────────────────────┐
│     JavaScript (AlarmNative.js)       │
└───────┬───────────────────────▲───────┘
        │                       │
Promise │ Function Call         │ NativeEventEmitter
        ▼                       │ ("CallStateChanged")
┌───────────────────────────────┴───────┐
│     Java (AlarmModule.java)           │
└───────────────────────────────────────┘
```

---

## 2. API Method Reference

### `scheduleExactAlarm(timestampMs, buddyName, alarmId, requestCode)`
- **Native Implementation**: Sets an exact alarm in Android's `AlarmManager` using `setExactAndAllowWhileIdle()`.
- **Arguments**:
  - `timestampMs` (`double`): Target epoch timestamp in milliseconds.
  - `buddyName` (`String`): Optional name of buddy to display.
  - `alarmId` (`String`): Convex alarm ID.
  - `requestCode` (`int`): Unique positive integer identifier for the `PendingIntent`.
- **Return**: `Promise<boolean>` - resolves `true` if scheduled.

### `cancelAlarm(requestCode)`
- **Native Implementation**: Cancels the `PendingIntent` in `AlarmManager` matching the request code.
- **Return**: `Promise<boolean>`

### `stopAlarmService()`
- **Native Implementation**: Stops the foreground `AlarmService`, immediately halting ringtone playback and vibration motors.
- **Return**: `Promise<boolean>`

### `makePhoneCall(phoneNumber)`
- **Native Implementation**: Fires an `Intent.ACTION_CALL` directly to the specified phone number without displaying an intermediary system dialer prompt. Requires `android.permission.CALL_PHONE`.
- **Return**: `Promise<boolean>`

### `getLastCallDuration(phoneNumber)`
- **Native Implementation**: Queries Android's `CallLog.Calls` ContentProvider for the most recent call record to `phoneNumber`, returning duration in seconds.
- **Return**: `Promise<number>`

### `getMostRecentCallDuration()`
- **Native Implementation**: Queries `CallLog.Calls` for the most recent outgoing call record regardless of phone number.
- **Return**: `Promise<number>`

### `savePendingCall(callId, phoneNumber)`, `checkPendingCall()`, `clearPendingCall()`
- **Native Implementation**: Stores call verification context in Android `SharedPreferences` so call tracking survives app process restarts.

### `subscribeToCallState(callback)`
- **JavaScript Helper**: Subscribes to `CallStateChanged` events emitted by `AlarmModule` when a phone call transitions between `'started'` and `'ended'`.
- **Payload**: `{ status: 'started' | 'ended', duration?: number }`.

### `generateRequestCode(alarmId)`
- **JavaScript Helper**: Converts a string Convex document ID into a stable, unique 32-bit positive integer suitable for Android `PendingIntent` request codes:
  ```javascript
  export function generateRequestCode(alarmId) {
      if (!alarmId) return 1001;
      let hash = 0;
      for (let i = 0; i < alarmId.length; i++) {
          hash = ((hash << 5) - hash) + alarmId.charCodeAt(i);
          hash = hash & hash;
      }
      return Math.abs(hash) % 2147483647 || 1;
  }
  ```
