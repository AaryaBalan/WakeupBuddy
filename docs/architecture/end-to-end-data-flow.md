# 🔄 WakeupBuddy - End-to-End Data Flows

This document details the exact sequence of events, data structures, and lifecycle interactions across the client, native Android bridge, and Convex backend.

---

## 1. User Registration & Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as React Native UI (Signup/Login)
    participant Ctx as UserContext
    participant Storage as AsyncStorage
    participant Convex as Convex (users.js)
    participant DB as Convex Database

    User->>App: Enters Name, Email, Password, Phone
    App->>Convex: mutation api.users.createUser(name, email, password, phone)
    Convex->>DB: Check if user exists (by_email)
    alt User Already Exists
        DB-->>Convex: Return existing user
        Convex-->>App: Throw Error "User already exists"
    else New User
        Convex->>Convex: Hash password using bcryptSync(password, 10)
        Convex->>DB: Insert new user record
        DB-->>Convex: Return userId
        Convex-->>App: Return userId
        App->>Ctx: login(userData)
        Ctx->>Storage: AsyncStorage.setItem('user', JSON.stringify(userData))
        Ctx->>App: Set user state & navigate to home.jsx
    end
```

---

## 2. Alarm Creation & Native Scheduling Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Editor as alarm-editor.jsx
    participant Convex as Convex (alarms.js)
    participant Bridge as AlarmNative.js
    participant Native as AlarmModule.java
    participant Android as Android AlarmManager

    User->>Editor: Selects 06:30 AM, repeat days, Solo/Buddy mode
    Editor->>Convex: mutation api.alarms.createAlarm(...)
    Convex->>Convex: Insert into alarms table
    alt Stranger Mode Enabled
        Convex->>Convex: Query existing unmatched stranger alarms at 06:30 AM
        alt Match Found
            Convex->>Convex: Instant match! Patch both alarms with buddy emails
        end
    end
    Convex-->>Editor: Return alarmId
    Editor->>Bridge: scheduleAlarm(alarmDate, buddyName, alarmId, requestCode)
    Bridge->>Bridge: Check canScheduleExactAlarms() & isBatteryOptimizationDisabled()
    Bridge->>Native: scheduleExactAlarm(timestampMs, buddyName, alarmId, requestCode)
    Native->>Android: Intent targeting AlarmReceiver.class
    Native->>Android: AlarmManager.setExactAndAllowWhileIdle(...)
    Android-->>Native: PendingIntent registered
    Native-->>Editor: Promise.resolve(true)
    Editor->>User: Display success & navigate back to Alarms list
```

---

## 3. Morning Alarm Execution & Synchronized Wake-Up Call Protocol

```mermaid
sequenceDiagram
    autonumber
    participant Android as Android System
    participant Rec as AlarmReceiver.java
    participant Svc as AlarmService.java
    participant Act as AlarmActivity.java
    participant UI_A as User A Screen (AlarmScreen.js)
    participant Convex as Convex Cloud (alarmDismissals & streaks)
    participant UI_B as User B Screen (Buddy)
    participant Tel as Native Telephony

    Note over Android,UI_A: 06:30:00 AM - Exact Alarm Triggers
    Android->>Rec: onReceive(Context, Intent)
    Rec->>Svc: startForegroundService (Play ringtone & vibrate loop)
    Rec->>Act: startActivity (FLAG_SHOW_WHEN_LOCKED, FLAG_TURN_SCREEN_ON)
    Act->>UI_A: Mount AlarmScreen.js overlay
    UI_A->>UI_A: Display "WAKE UP!" & "I'm Awake" button

    Note over UI_A,Convex: User A presses "I'm Awake"
    UI_A->>Convex: mutation recordDismissal(alarmId, userEmail)
    Convex->>Convex: Insert alarmDismissals record with buddyEmail
    
    UI_A->>Svc: stopAlarmService() (Silences sound & stops vibration)
    UI_A->>Convex: mutation markAwake(userEmail, localDate, skipIncrement=true)
    
    Note over Convex,UI_B: Real-time dismissal notification to Buddy
    Convex-->>UI_B: Reactive query shouldStopAlarm returns true!
    UI_B->>UI_B: Automatically silence User B's alarm & cancel scheduled ringing

    Note over UI_A,Tel: Outgoing Automated Call
    UI_A->>Convex: mutation createCall(user1Email, user2Email, alarmId)
    Convex-->>UI_A: Return callId
    UI_A->>Tel: Linking.openURL("tel:+1234567890")
    Tel->>Tel: Call connects, buddies talk for 60+ seconds
    Tel-->>Tel: Call finishes

    Note over UI_A,Convex: Call Duration Verification
    Tel->>UI_A: Native CallStateChanged event (duration = 72s)
    UI_A->>Convex: mutation updateCallDuration(callId, duration: 72)
    Convex->>Convex: mutation markAwakeAfterCall(userEmail, buddyEmail, callDuration)
    alt Call Duration >= 60 seconds
        Convex->>Convex: Increment User A and User B streaks!
        Convex->>Convex: Recalculate leaderboard scores & award achievements
    end
```

---

## 4. Stranger Matching Flow (Instant vs Cron)

```mermaid
sequenceDiagram
    autonumber
    participant UserA as User A (Sets 5:00 AM)
    participant UserB as User B (Sets 5:00 AM)
    participant Convex as Convex Backend
    participant Cron as Convex Scheduled Cron

    UserA->>Convex: createAlarm(time: "5:00", ampm: "AM", solo: false, buddy: null)
    Convex->>Convex: Check for existing unmatched alarms at 5:00 AM
    Note over Convex: No one waiting at this moment
    Convex-->>UserA: Alarm saved in pending matchmaking state

    Note over UserA,UserB: Case 1: Instant Match when User B creates alarm
    UserB->>Convex: createAlarm(time: "5:00", ampm: "AM", solo: false, buddy: null)
    Convex->>Convex: Query potential matches at 5:00 AM
    Convex->>Convex: Match found with User A!
    Convex->>Convex: Patch User A alarm (buddy: User B email, matched_at: now)
    Convex->>Convex: Patch User B alarm (buddy: User A email, matched_at: now)
    Convex-->>UserB: Alarms paired instantly!

    Note over Convex,Cron: Case 2: Cron Matching for Unmatched Alarms
    Note over Cron: Runs every 1 minute
    Cron->>Convex: internal.matching.runMatchingForUpcomingAlarms()
    Convex->>Convex: Scan alarms scheduled 2 minutes into future
    Convex->>Convex: Pair any unmatched compatible users
    Convex->>Convex: Leave remaining single alarms to ring safely in Solo fallback
```
