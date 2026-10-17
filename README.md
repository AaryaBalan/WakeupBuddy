# 🌅 WakeupBuddy — Social Accountability Alarm Clock

> **Wake up together, stay accountable.**  
> WakeupBuddy makes waking up easy and fun by pairing you with a friend or a stranger. When your alarm rings, you and your buddy must talk on a real phone call for at least 60 seconds to prove you are out of bed. Build daily streaks, unlock badges, and climb the leaderboard!

---

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54.0.25-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Convex](https://img.shields.io/badge/Convex-Realtime%20Backend-FF6B4A?style=for-the-badge&logo=convex&logoColor=white)](https://convex.dev/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

---

## 📑 Table of Contents

- [1. Why WakeupBuddy? (The Problem and the Solution)](#1-why-wakeupbuddy-the-problem-and-the-solution)
- [2. System Architecture](#2-system-architecture)
- [3. A to Z End-to-End Control Flow Diagram](#3-a-to-z-end-to-end-control-flow-diagram)
- [4. Visual Flowcharts and Diagrams](#4-visual-flowcharts-and-diagrams)
  - [4.1 Component Architecture Diagram](#41-component-architecture-diagram)
  - [4.2 Full A-to-Z Sequence Diagram](#42-full-a-to-z-sequence-diagram)
  - [4.3 Android Native Lock Screen Ringing Flowchart](#43-android-native-lock-screen-ringing-flowchart)
  - [4.4 Stranger Matching Engine Flowchart](#44-stranger-matching-engine-flowchart)
  - [4.5 Database Entity-Relationship (ER) Diagram](#45-database-entity-relationship-er-diagram)
- [5. Core Features](#5-core-features)
- [6. Screen Flow and Navigation](#6-screen-flow-and-navigation)
- [7. How Android Native Modules Work](#7-how-android-native-modules-work)
- [8. The 60-Second Anti-Cheating Call Verification](#8-the-60-second-anti-cheating-call-verification)
- [9. Points, Leaderboards and Streaks](#9-points-leaderboards-and-streaks)
- [10. Achievements Catalog (All 17 Badges)](#10-achievements-catalog-all-17-badges)
- [11. Android Permissions Explained](#11-android-permissions-explained)
- [12. Project Directory Structure](#12-project-directory-structure)
- [13. How to Run and Build Locally](#13-how-to-run-and-build-locally)
- [14. Safety, Reporting and Ban Appeals](#14-safety-reporting-and-ban-appeals)
- [15. Authors and Acknowledgments](#15-authors-and-acknowledgments)

---

## 1. Why WakeupBuddy? (The Problem and the Solution)

### The Problem: Why Regular Alarms Fail
Most people struggle to get out of bed with traditional alarm clocks:
- **The Snooze Trap**: When half-asleep, your brain is foggy (sleep inertia). Hitting "Snooze" is too easy because nobody is watching or waiting for you.
- **No Real Commitment**: Making a promise to yourself at night is easy to break in the morning when you are tired.
- **Broken Mornings**: Hitting snooze multiple times leads to rushing, stress, missed workouts, and feeling guilty.

### The Solution: Social Accountability
WakeupBuddy fixes this with human connection:
1. **Shared Waking**: You set an alarm with a friend or a matched stranger waking up at the same minute.
2. **Synchronized Rings**: Both phones ring at the same exact time with a full-screen alarm.
3. **Automated Phone Call**: As soon as you tap **"I'm Awake"**, the app immediately places a phone call to your buddy.
4. **Live Human Conversation**: Talking to another person forces your brain to wake up within seconds. You cannot sleep while speaking!
5. **The 60-Second Rule**: Both you and your buddy **must talk for at least 60 seconds** on the phone. If either person hangs up early, no streak points or badges are given.

---

## 2. System Architecture

WakeupBuddy uses four main layers working together:

```mermaid
graph TD
    subgraph Client ["1. Mobile App (React Native & Expo 54)"]
        UI["App Screens<br/>Home, Alarms, Explore, Rank, Profile"]
        CTX["Contexts<br/>UserContext and PopupContext"]
        BRIDGE["AlarmNative.js<br/>JavaScript Bridge Wrapper"]
        UI --> CTX
        UI --> BRIDGE
    end

    subgraph Native ["2. Android Native Layer (Java)"]
        AM["AlarmModule.java<br/>Phone Calls & CallLog Check"]
        AR["AlarmReceiver.java<br/>Catches Exact Alarm Broadcast"]
        AS["AlarmService.java<br/>Foreground Sound & Vibration"]
        AA["AlarmActivity.java<br/>Full-Screen Lockscreen UI"]
        BR["BootReceiver.java<br/>Reschedules Alarms on Reboot"]
        BRIDGE <-->|"Native Bridge"| AM
        AM -->|"Schedules"| AR
        AR -->|"Starts"| AS
        AR -->|"Launches"| AA
        BR -->|"Restores"| AM
    end

    subgraph OS ["3. Android Operating System"]
        A_MGR["AlarmManager<br/>Exact Millisecond Wakeup"]
        PWR["PowerManager<br/>CPU & Screen WakeLocks"]
        TEL["Telephony & CallLog<br/>Phone State & Call Duration"]
        KEY["KeyguardManager<br/>Lockscreen Dismissal"]
        AR <--> A_MGR
        AR --> PWR
        AM <--> TEL
        AA <--> KEY
    end

    subgraph Backend ["4. Convex Realtime Cloud Backend"]
        SCHEMA["Database Tables<br/>Users, Alarms, Streaks, Calls, Leaderboard"]
        CRON["Scheduled Crons<br/>1-Minute Stranger Matching & Midnight Reset"]
        MUT["Mutations & Queries<br/>Mark Awake, Record Dismissal, Call Logs"]
        CRON --> MUT
        MUT --> SCHEMA
    end

    Client <-->|"Live WebSocket Subscriptions"| Backend
    AA -->|"Deep Link: wakeupbuddy://"| UI
```

---

## 3. A to Z End-to-End Control Flow Diagram

Here is what happens from the moment an alarm is set to when the streak is saved:

```mermaid
flowchart TD
    A["1. User Signs Up & Grants Permissions"] --> B["2. User Creates Alarm<br/>Time, Repeat Days, Mode"]
    B --> C{"Select Mode"}
    
    C -->|Solo Mode| D["Solo Alarm Saved"]
    C -->|Friend Request| E["Friend Receives Alarm Request"]
    C -->|Stranger Mode| F["Added to Stranger Queue"]
    
    F --> G["Convex 1-Minute Cron<br/>Matches 2 Strangers at Same Time"]
    E --> H["Friend Accepts Request"]
    
    D & G & H --> I["3. Native Alarm Scheduled<br/>Android AlarmManager RTC_WAKEUP"]
    I --> J["4. Alarm Time Reached<br/>AlarmReceiver Catches Event"]
    J --> K["5. Screen Turns On & CPU Wakes<br/>PowerManager WakeLocks Acquired"]
    K --> L["6. Sound and Vibration Plays<br/>AlarmService Foreground Service"]
    L --> M["7. Full-Screen UI Shows Over Lock Screen<br/>AlarmActivity Displayed"]
    
    M --> N["8. User Taps 'I'm Awake'"]
    N --> O{"Was Alarm Solo or Buddy?"}
    
    O -->|Solo Alarm| P["markAwake Mutation<br/>Streak Credited Instantly"]
    
    O -->|Buddy Alarm| Q["Alarm Sound Stops"]
    Q --> R["recordDismissal Signals Buddy's Device"]
    R --> S["Deep Link Opens React Native App"]
    S --> T["Native ACTION_CALL Dials Buddy's Phone"]
    T --> U["Both Users Talk on the Phone"]
    U --> V["Call Ends (Phone State IDLE)"]
    V --> W["Native Module Reads Android CallLog"]
    W --> X{"Did Call Last >= 60 Seconds?"}
    
    X -->|No: Under 60s| Y["Streak Denied<br/>Call was too short"]
    X -->|Yes: 60s or more| Z["markAwakeAfterCall Mutation<br/>Both users credited!"]
    
    P & Z --> AA["9. Streaks and Heatmap Updated"]
    AA --> AB["10. 17-Badge Achievements Evaluated"]
    AB --> AC["11. Leaderboard Scores Recalculated"]
    AC --> AD["12. Daily Rankings Reset at Midnight IST"]
```

---

## 4. Visual Flowcharts and Diagrams

### 4.1 Component Architecture Diagram

This diagram shows how data flows across the application components:

```mermaid
flowchart LR
    subgraph MobileApp ["React Native Frontend"]
        Screens["App Screens<br/>Home, Alarms, Explore, Rank, Profile"]
        Contexts["Context Providers<br/>UserContext, PopupContext"]
        NativeWrapper["AlarmNative.js<br/>Bridge Interface"]
        Screens --- Contexts
        Screens --- NativeWrapper
    end

    subgraph NativeAndroid ["Android Native Code"]
        Module["AlarmModule.java"]
        Receiver["AlarmReceiver.java"]
        Service["AlarmService.java"]
        Activity["AlarmActivity.java"]
        Boot["BootReceiver.java"]
        NativeWrapper <--> Module
        Module --> Receiver
        Receiver --> Service
        Receiver --> Activity
        Boot --> Module
    end

    subgraph Cloud ["Convex Cloud Backend"]
        DB[(Convex Database)]
        Crons["Scheduled Crons"]
        API["Mutations & Queries"]
        Crons --> API
        API <--> DB
    end

    Screens <-->|"Live Data (WebSocket)"| API
    Activity -->|"Deep Link (Intent)"| Screens
```

---

### 4.2 Full A-to-Z Sequence Diagram

This sequence diagram details every single network and hardware call during an alarm event:

```mermaid
sequenceDiagram
    autonumber
    actor UserA as User A
    participant NativeA as User A AlarmActivity
    participant ServiceA as User A AlarmService
    participant AppA as User A React Native
    participant BridgeA as User A AlarmModule
    participant Backend as Convex Backend
    participant Telecom as Android Call System
    actor UserB as User B (Buddy)

    Note over UserA, UserB: Morning 07:00 AM arrives
    ServiceA->>NativeA: Alarm rings and vibrates over lockscreen
    NativeA->>UserA: Shows "I'm Awake" button
    UserA->>NativeA: Taps "I'm Awake"
    NativeA->>ServiceA: Stop sound and vibration
    NativeA->>AppA: Open app via deep link: wakeupbuddy://(tabs)/home?alarm=dismissed
    NativeA->>NativeA: Dismiss lock screen and close activity

    AppA->>Backend: recordDismissal(alarmId, userEmail)
    Backend-->>UserB: Signal buddy that User A woke up
    AppA->>Backend: getBuddyPhone(buddyEmail)
    Backend-->>AppA: Returns buddy phone number

    AppA->>BridgeA: savePendingCall(callId, buddyPhone)
    AppA->>BridgeA: makePhoneCall(buddyPhone)
    BridgeA->>Telecom: Start phone call (ACTION_CALL)
    Telecom->>UserB: Phone rings
    UserB->>UserA: Answers call and speaks

    Note over UserA, UserB: Both users talk to wake each other up
    UserA->>Telecom: Call ends and hangs up
    BridgeA->>Telecom: Read CallLog for outgoing call duration
    Telecom-->>BridgeA: Duration = 75 seconds
    BridgeA-->>AppA: Return 75 seconds

    AppA->>Backend: updateCallDuration(callId, 75)
    alt Call duration is 60 seconds or more
        AppA->>Backend: markAwakeAfterCall(userA, userB, 75)
        Backend->>Backend: Increment streak for User A
        Backend->>Backend: Increment streak for User B
        Backend->>Backend: Check and unlock achievements
        Backend->>Backend: Recalculate leaderboard positions
        Backend-->>AppA: Success: Streaks updated!
        AppA->>UserA: Shows celebration popup ("Streak increased!")
    else Call duration is less than 60 seconds
        AppA->>Backend: Reject: call_too_short
        AppA->>UserA: Warning: "Call was under 60 seconds. Streak not saved!"
    end
```

---

### 4.3 Android Native Lock Screen Ringing Flowchart

How the Android phone wakes up from deep sleep (Doze Mode) reliably:

```mermaid
flowchart TD
    A(["AlarmManager Fires RTC_WAKEUP"]) --> B["AlarmReceiver Catches Intent"]
    B --> C["Acquire PARTIAL_WAKE_LOCK<br/>Keeps CPU awake"]
    B --> D["Acquire FULL_WAKE_LOCK<br/>Forces phone screen to turn ON"]
    
    C & D --> E["Start AlarmService as Foreground Service"]
    E --> F["Show Priority Notification"]
    E --> G["Play Continuous Alarm Sound via MediaPlayer"]
    E --> H["Start Vibrator Pulse Pattern"]
    
    B --> I["Launch AlarmActivity with Window Flags"]
    I --> J["Flags: SHOW_WHEN_LOCKED,<br/>TURN_SCREEN_ON,<br/>DISMISS_KEYGUARD"]
    J --> K["Inflate Native Layout with 'I'm Awake' Button"]
    
    K --> L{"User Taps 'I'm Awake'?"}
    L -->|Yes| M["Stop AlarmService Sound"]
    M --> N["Fire Deep Link: wakeupbuddy://"]
    N --> O["Release WakeLocks & Finish Activity"]
    
    L -->|No Action| P["5-Minute Safety Timeout Reached"]
    P --> O
```

---

### 4.4 Stranger Matching Engine Flowchart

How Convex pairs two random strangers waking up at the same minute:

```mermaid
flowchart TD
    A(["Convex Cron Runs Every 60 Seconds"]) --> B["Query alarms table with index 'by_stranger_mode'"]
    B --> C["Find alarms where:<br/>• solo_mode is false<br/>• buddy is null<br/>• enabled is true<br/>• Scheduled time is 2 minutes from now"]
    
    C --> D{"Are there at least 2 matching alarms?"}
    D -->|No| E(["Wait for next minute's cron"])
    
    D -->|Yes| F["Pair Alarm 1 with Alarm 2<br/>Ensure user1 is not user2"]
    F --> G["Run matchTwoAlarms mutation"]
    G --> H["Alarm 1 gets user2 as buddy"]
    G --> I["Alarm 2 gets user1 as buddy"]
    H & I --> J(["Both users now paired for the morning call!"])
```

---

### 4.5 Database Entity-Relationship (ER) Diagram

The complete database schema in Convex:

```mermaid
erDiagram
    users ||--o{ alarms : "creates"
    users ||--o{ streaks : "logs"
    users ||--o{ leaderboard : "ranked_in"
    users ||--o{ achievements : "earns"
    users ||--o{ appeals : "submits"
    users ||--o{ reports : "involved_in"
    users ||--o{ friends : "participates"
    alarms ||--o{ calls : "triggers"
    alarms ||--o{ alarmDismissals : "dismissed_by"

    users {
        id _id PK
        string name
        string email UK "User email"
        string password "Bcrypt hashed"
        string phone "Phone number for calls"
        string bio
        string username
        number streak "Current wake streak"
        number maxStreak "Best streak ever"
        string profile_code "DiceBear avatar seed"
        number reportCount "Ban threshold is 3"
    }

    alarms {
        id _id PK
        id user_id FK "Owner of the alarm"
        string time "e.g. 07:00"
        string ampm "AM or PM"
        string label "Work, Gym, Study, etc."
        boolean enabled "On or Off"
        array days "0=Mon to 6=Sun"
        boolean solo_mode "Solo or Buddy"
        string buddy "Buddy email or null"
        number matched_at "Matching timestamp"
    }

    alarmDismissals {
        id _id PK
        id alarm_id FK "Alarm reference"
        id dismissed_by FK "User reference"
        number dismissed_at "Timestamp"
        string buddy_email "Buddy email"
    }

    streaks {
        id _id PK
        id user_id FK "User reference"
        string date "YYYY-MM-DD"
        number count "Wakeups on this day"
    }

    calls {
        id _id PK
        array users "Array of two user IDs"
        number call_duration "Seconds"
        string call_time "ISO timestamp"
        id alarm_id FK "Alarm reference"
    }

    friends {
        id _id PK
        array users "Sender and Receiver IDs"
        number status "0=pending, 1=approved, -1=rejected"
        number created_at "Timestamp"
        number friends_since "Timestamp"
    }

    leaderboard {
        id _id PK
        id user_id FK "User reference"
        number total_points "All-time points"
        number current_streak "Current days"
        number max_streak "Max days"
        number total_wakeups "Total count"
        number total_days_active "Total active days"
        number today_wakeups "Today count"
        number today_call_time "Today seconds"
        number total_call_time "All-time seconds"
        number rank "Global rank"
        number daily_rank "Daily rank"
        number last_updated "Timestamp"
        number daily_points "Today points"
    }

    achievements {
        id _id PK
        id user_id FK "User reference"
        string achievement_type "Badge key"
        string achievement_name "Display title"
        string description "How it was earned"
        string icon "Ionicons name"
        number earned_at "Timestamp"
    }

    reports {
        id _id PK
        id reporterId FK "User reporting"
        id reportedUserId FK "User reported"
        string reason "Reason text"
        string description "Details"
        number createdAt "Timestamp"
        string status "pending or resolved"
    }

    appeals {
        id _id PK
        id userId FK "User appealing ban"
        string reason "Appeal statement"
        string status "pending, approved, rejected"
        number submittedAt "Timestamp"
    }
```

---

## 5. Core Features

- **Solo Alarms**: Standard alarms for days you want to wake up on your own.
- **Buddy Alarms**: Set an alarm linked with a friend. Both phones ring together.
- **Stranger Matching**: Wake up with someone new from around the world at the exact same minute.
- **Automated Phone Call**: Tapping "I'm Awake" instantly dials your buddy so you talk out loud.
- **60-Second Call Verification**: Android call logs verify you talked for at least 60 seconds before giving streak credit.
- **90-Day Activity Heatmap**: Interactive visual matrix on your home screen inspired by GitHub's contribution chart.
- **17 Unlockable Achievements**: Badges celebrating streaks, wakeup counts, early mornings, and buddy milestones.
- **Dual Leaderboards**:
  - **Daily Tab**: Resets every night at midnight—anyone can win today!
  - **Global Tab**: Long-term rankings based on streaks, consistency, and total wakeups.
- **DiceBear Avatars**: Fun, customized cartoon adventurer avatars generated automatically for each user.

---

## 6. Screen Flow and Navigation

The app is built with **Expo Router** and organized into clean tabs and screens:

```
app/
├── (tabs)/
│   ├── home.jsx        → Main dashboard with streaks, 90-day heatmap, upcoming alarms
│   ├── alarms.jsx      → List of your alarms with toggles, edit, and delete
│   ├── explore.jsx     → Search for users, send buddy requests, discover people
│   ├── rank.jsx        → Leaderboards (Daily Sprint tab & Global Marathon tab)
│   └── profile.jsx     → Your avatar, bio, total stats, and earned badges showcase
└── screens/
    ├── alarm-editor.jsx     → Create or edit alarms (time picker, repeat days, modes)
    ├── PermissionsGuide.jsx → Visual permission checklist for Android
    ├── notifications.jsx    → Social inbox for buddy requests and match alerts
    ├── my-buddies.jsx       → Your friends list and connection statuses
    ├── stats.jsx            → Head-to-head comparison stats with any buddy
    ├── account-details.jsx  → Edit profile, username, phone, and bio
    ├── premium.jsx          → Upgrade plan (unlimited stranger matches, ad-free)
    └── appeal.jsx           → Ban appeal form for users exceeding report limits
```

---

## 7. How Android Native Modules Work

Standard JavaScript timers cannot ring alarms when your phone is locked and sleeping overnight. Android uses **Doze Mode** to save battery by putting apps to sleep.

WakeupBuddy uses custom native Android Java code in `android/app/src/main/java/com/anonymous/WakeupBuddy/`:

1. **`AlarmReceiver.java`**:
   - Catches the alarm event from Android's `AlarmManager.setAlarmClock()`.
   - Acquires two **WakeLocks**:
     - `PARTIAL_WAKE_LOCK`: Keeps the phone CPU running at full speed.
     - `FULL_WAKE_LOCK`: Forces the physical screen to light up.
2. **`AlarmService.java`**:
   - Runs as a **Foreground Service** with maximum priority.
   - Loops the alarm ringtone using Android's `MediaPlayer` on the alarm audio channel.
   - Vibrates the phone hardware with a repeating pattern.
3. **`AlarmActivity.java`**:
   - Displays a clean native screen directly over the secure lock screen.
   - Uses Android window flags so you don't have to unlock your phone first:
     ```java
     setShowWhenLocked(true);
     setTurnScreenOn(true);
     ```
   - When you tap **"I'm Awake"**, it stops the music and sends a deep link (`wakeupbuddy://(tabs)/home?alarm=dismissed`) to open the React Native app.
4. **`BootReceiver.java`**:
   - Whenever your phone restarts, it reads saved alarms from `SharedPreferences` and re-registers them with Android so no alarm is lost.
5. **`AlarmModule.java`**:
   - React Native bridge module that places outbound phone calls and checks the Android `CallLog` to verify call duration.

---

## 8. The 60-Second Anti-Cheating Call Verification

To make sure users actually get out of bed rather than hanging up immediately, WakeupBuddy checks the Android system call log:

```mermaid
flowchart TD
    A["User taps 'I'm Awake'"] --> B["App automatically dials buddy via ACTION_CALL"]
    B --> C["Pending call ID and timestamp saved in SharedPreferences"]
    C --> D["Both buddies talk live on the phone"]
    D --> E["Call ends (Phone returns to IDLE state)"]
    E --> F["Native module queries Android CallLog.Calls"]
    F --> G["Finds the outgoing call made after call start time"]
    G --> H["Extracts exact duration in seconds"]
    H --> I{"Is duration >= 60 seconds?"}
    
    I -->|No: Less than 60s| J["Streak DENIED ❌<br/>Status: call_too_short<br/>Neither user gets streak points"]
    I -->|Yes: 60s or more| K["Streak APPROVED ✅<br/>markAwakeAfterCall runs<br/>Both users gain streak and points!"]
```

---

## 9. Points, Leaderboards and Streaks

### 9.1 Global Leaderboard (Long-Term Dedication)
Ranks users based on total consistency over time:

$$\text{Global Points} = (\text{Max Streak} \times 27) + (\text{Total Wakeups} \times 53)$$

- **Current Streak Bonuses**: Extra multipliers for maintaining long streaks (1.5x at 7 days, 2x at 14 days, 3x at 30 days, 5x at 90 days).
- **Max Streak Lifetime Bonus**: Extra points for hitting personal best records (+50 for 1 week, +100 for 2 weeks, +250 for 1 month, +1,000 for 90 days).
- **Consistency Ratio**: Rewards users who wake up consistently without skipping days.

### 9.2 Daily Leaderboard (Daily Sprint)
Ranks users solely on **today's** performance:
1. **Primary Sort**: Today's wakeups count (higher is better).
2. **Secondary Tie-Breaker**: Today's phone call time (longer talk time wins).
3. **Daily Reset**: Resets to zero every night at **Midnight IST (18:30 UTC)** via an automated Convex cron.

---

## 10. Achievements Catalog (All 17 Badges)

| Badge Name | Category | How to Unlock | Icon |
|:---|:---|:---|:---|
| **Getting Started** | Streak | Keep a 3-day wake streak | `flame-outline` |
| **7 Day Streak** | Streak | Keep a 7-day wake streak | `flame` |
| **Two Week Warrior**| Streak | Keep a 14-day wake streak | `flame` |
| **Monthly Master** | Streak | Keep a 30-day wake streak | `trophy` |
| **Century Club** | Streak | Keep a 100-day wake streak | `medal` |
| **First Wakeup** | Wakeup | Complete your first wake-up | `sunny-outline` |
| **Early Riser** | Wakeup | Complete 10 total wake-ups | `sunny` |
| **Morning Person** | Wakeup | Complete 50 total wake-ups | `star` |
| **Wakeup Legend** | Wakeup | Complete 100 total wake-ups | `star` |
| **Early Bird** | Early | Wake up before your scheduled alarm time | `alarm` |
| **Super Early Bird**| Early | Wake up early 5 times | `alarm` |
| **First Buddy** | Buddy | Connect with your first wake buddy | `people-outline`|
| **Social Butterfly**| Buddy | Connect with 5 different wake buddies | `people` |
| **Buddy Helper** | Buddy | Complete a 60s+ wake-up call helping a friend | `hand-left` |
| **Weekend Warrior** | Special | Wake up on time on both Saturday and Sunday | `calendar` |
| **Night Owl Reformed**| Special| Switch from late alarms to early morning alarms | `moon` |
| **Consistent Week** | Special | Wake up at the exact same minute for 7 days | `time` |

---

## 11. Android Permissions Explained

WakeupBuddy includes an interactive **Permissions Guide screen** (`PermissionsGuide.jsx`) that checks and guides you through granting each permission:

| Permission | Why It Is Needed | What Happens If Denied |
|:---|:---|:---|
| **Exact Alarms** (`SCHEDULE_EXACT_ALARM`) | Rings the alarm at the exact minute without delay | Alarm might ring 10–15 minutes late |
| **Ignore Battery Optimizations** | Prevents Android from killing the app while you sleep | Alarm will fail to ring overnight |
| **Draw Over Other Apps** (`SYSTEM_ALERT_WINDOW`)| Shows the alarm screen when other apps are open | Cannot display the full-screen alarm |
| **Full-Screen Intent** (`USE_FULL_SCREEN_INTENT`)| Displays the alarm directly over the lock screen on Android 14+ | Only shows a small notification banner |
| **Make Phone Calls** (`CALL_PHONE`) | Automatically dials your buddy when you tap "I'm Awake" | Falls back to opening phone dialer manually |
| **Read Call Log** (`READ_CALL_LOG`) | Checks that the phone call lasted at least 60 seconds | Cannot verify call length; streak is not saved |
| **Phone State** (`READ_PHONE_STATE`) | Detects when you answer and hang up the phone call | Cannot detect when call starts or ends |

---

## 12. Project Directory Structure

```
WakeupBuddy/
├── android/                         # Android native project files
│   └── app/src/main/
│       ├── AndroidManifest.xml      # Android permissions & services registration
│       ├── res/layout/              # Native XML layouts for lockscreen alarm
│       └── java/com/anonymous/WakeupBuddy/
│           ├── AlarmActivity.java   # Lockscreen alarm UI
│           ├── AlarmModule.java     # React Native bridge & CallLog duration reader
│           ├── AlarmPackage.java    # Native package registrar
│           ├── AlarmReceiver.java   # Catches AlarmManager triggers with WakeLocks
│           ├── AlarmService.java    # Foreground service playing audio & vibration
│           ├── BootReceiver.java    # Reschedules alarms on device reboot
│           ├── MainActivity.kt      # Main React Native activity
│           └── MainApplication.kt   # Native application entry
├── app/                             # Expo Router pages
│   ├── (tabs)/                      # Bottom tab screens (Home, Alarms, Explore, Rank, Profile)
│   ├── screens/                     # Stack screens (Alarm Editor, Notifications, Stats, Appeal)
│   ├── ads/                         # Mobile banner ad integration
│   ├── native/                      # JavaScript bridge to AlarmModule
│   ├── user/[id].jsx                # Public profile view for other users
│   ├── login.jsx                    # Login page
│   └── signup.jsx                   # Signup and avatar generation page
├── components/                      # Reusable UI components (AppText, ProfilePic)
├── contexts/                        # React contexts (UserContext, PopupContext)
├── convex/                          # Convex backend functions
│   ├── schema.js                    # Database schema (10 tables)
│   ├── alarms.js                    # Alarm CRUD & queries
│   ├── crons.js                     # 1-min stranger matching & midnight daily reset
│   ├── matching.js                  # Stranger pairing algorithm
│   ├── streaks.js                   # Streak increments & markAwake logic
│   ├── calls.js                     # Call records & buddy stats
│   ├── leaderboard.js               # Leaderboard calculations
│   ├── achievements.js              # 17-badge achievement evaluator
│   ├── friends.js                   # Friends & buddy requests
│   └── users.js                     # User authentication & profiles
├── package.json                     # Dependencies & scripts
└── tsconfig.json                    # TypeScript configuration
```

---

## 13. How to Run and Build Locally

### Prerequisites
- **Node.js**: Version 20 or newer
- **Android Studio**: With Android SDK & command-line tools installed
- **Java (JDK)**: OpenJDK 17
- **A real Android device**: Recommended for testing actual phone calls and lock screen alarms
- **Convex Account**: Free account at [convex.dev](https://convex.dev)

### Step-by-Step Setup

1. **Clone the code**:
   ```bash
   git clone https://github.com/AaryaBalan/WakeupBuddy.git
   cd WakeupBuddy
   ```

2. **Install packages**:
   ```bash
   npm install
   ```

3. **Start Convex backend**:
   ```bash
   npx convex dev
   ```
   *This connects to your Convex account and sets up your `.env.local` automatically.*

4. **Verify your `.env.local` file**:
   ```env
   EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   ```

5. **Deploy Convex backend (tables & crons)**:
   ```bash
   npx convex deploy
   ```

6. **Run on your Android phone**:
   *(Make sure your phone is plugged in via USB and USB Debugging is turned ON in Developer Options)*
   ```bash
   npx expo run:android
   ```

---

## 14. Safety, Reporting and Ban Appeals

To ensure a safe and respectful community:
- **Reporting Users**: You can report any user from their profile screen if they behave inappropriately during calls.
- **Automatic Ban Threshold**: If a user receives more than **3 reports**, their account is automatically restricted from stranger matching.
- **Appeal Process**: Banned users can submit an appeal through `screens/appeal.jsx`. An admin reviews the appeal in the `appeals` table to restore or permanently ban the account.

---

## 15. Authors and Acknowledgments

### Authors
- **Aarya B** — [@AaryaBalan](https://github.com/AaryaBalan)
- **Akshaya T** — [@Akshayathiru](https://github.com/Akshayathiru)

### Built With
- [Expo](https://expo.dev/) — React Native framework & developer tools
- [Convex](https://convex.dev/) — Real-time reactive cloud database
- [DiceBear](https://dicebear.com/) — Avatar generation API
- [Ionicons](https://ionic.io/ionicons) — Clean vector icons

---

<p align="center">
  <b>WakeupBuddy</b> • <i>Wake up together, stay accountable.</i>
</p>
