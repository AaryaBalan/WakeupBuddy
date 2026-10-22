# 📚 WakeupBuddy - Technical & Non-Technical Documentation

Welcome to the central documentation hub for **WakeupBuddy**, the social accountability alarm clock app built with React Native (Expo), custom Android native bridging, and a real-time reactive Convex backend.

---

## 🗺️ Master Documentation Directory

```
docs/
├── README.md                                          # 👈 You are here (Master Index & Navigation)
│
├── non-technical/                                     # Product, Design & Business Logic
│   ├── overview-and-value-prop.md                     # Vision, problem statement, user personas & value pillars
│   ├── core-features-guide.md                         # Detailed non-tech breakdown of all features
│   ├── user-journeys-and-scenarios.md                 # Step-by-step user journeys & morning scenarios
│   └── gamification-and-social-mechanics.md          # Streaks, 90-day heatmap, points & 17 achievements
│
├── architecture/                                      # System Architecture & Cross-Cutting Concerns
│   ├── system-overview.md                             # High-level architecture (React Native + Android Native + Convex)
│   ├── end-to-end-data-flow.md                        # Complete sequence diagrams & execution traces
│   ├── state-management-and-sync.md                   # UserContext, PopupContext, AsyncStorage & Convex sync
│   └── database-schema-reference.md                   # Complete specification for all 11 database tables
│
├── backend/                                           # Convex Backend Functions (Per-Module References)
│   ├── overview.md                                    # Serverless philosophy, function types, transactions & crons
│   ├── users-functions.md                             # Auth, bcrypt hashing, profile updates, moderation & reporting
│   ├── alarms-functions.md                            # Alarm CRUD, toggles, instant stranger pairing queries
│   ├── matching-functions.md                          # Stranger matching algorithm, lookahead matcher & crons
│   ├── alarm-dismissals-functions.md                  # Real-time mutual alarm silencing & dismissal events
│   ├── calls-functions.md                             # Call tracking, duration recording, buddy call stats
│   ├── streaks-functions.md                           # Streak increments, 60s verification, 90-day heatmap queries
│   ├── leaderboard-functions.md                       # Daily & Global scoring models, multipliers, midnight resets
│   ├── achievements-functions.md                      # 17 achievement definitions, evaluation triggers & backfills
│   ├── friends-functions.md                           # Social graph, friend requests, approvals & status queries
│   ├── notifications-functions.md                     # In-app inbox, buddy alarm invites & mutual provisioning
│   ├── appeals-functions.md                           # Account ban appeals submission and status checking
│   └── crons-and-scheduled-jobs.md                    # Recurring cron schedules (1-min matching, midnight IST reset)
│
├── frontend/                                          # Client-Side Application (React Native / Expo)
│   ├── navigation-and-routing.md                      # Expo Router structure, tabs, stack modals, dynamic routes
│   ├── screens-catalog.md                             # Detailed breakdown of all 15 screens & user interactions
│   ├── components-catalog.md                          # AlarmScreen overlay, Popup, AppText, ProfilePic & Ads
│   └── contexts-catalog.md                            # UserContext & PopupContext hooks & state lifecycles
│
└── native/                                            # Android OS Native Integration (Java & Bridge)
    ├── alarm-module-bridge.md                         # AlarmNative.js bridge & AlarmModule.java API reference
    ├── native-services-and-receivers.md               # AlarmReceiver, AlarmService, AlarmActivity, BootReceiver
    └── permissions-and-battery-guide.md               # Exact alarms, Doze bypass, overlay, and Android 14 intents
```

---

## 🚀 Quick Navigation by Topic

### For Product Managers, Designers & Stakeholders
- [Product Overview & Value Proposition](./non-technical/overview-and-value-prop.md)
- [Core Features Guide](./non-technical/core-features-guide.md)
- [User Journeys & Scenarios](./non-technical/user-journeys-and-scenarios.md)
- [Gamification, Streaks & Achievements Catalog](./non-technical/gamification-and-social-mechanics.md)

### For System Architects & Technical Leads
- [System Architecture Overview](./architecture/system-overview.md)
- [End-to-End Data Flows & Sequence Diagrams](./architecture/end-to-end-data-flow.md)
- [State Management & Real-Time Sync](./architecture/state-management-and-sync.md)
- [Complete Database Schema Reference (11 Tables)](./architecture/database-schema-reference.md)

### For Backend Engineers (Convex)
- [Convex Backend Overview](./backend/overview.md)
- [Users & Authentication Functions](./backend/users-functions.md)
- [Alarms & Scheduling Functions](./backend/alarms-functions.md)
- [Stranger Matchmaking Engine](./backend/matching-functions.md)
- [Real-Time Alarm Dismissals](./backend/alarm-dismissals-functions.md)
- [Wake-Up Calls & Stats Functions](./backend/calls-functions.md)
- [Streaks & Heatmap Functions](./backend/streaks-functions.md)
- [Daily & Global Leaderboard Functions](./backend/leaderboard-functions.md)
- [17 Achievements Engine](./backend/achievements-functions.md)
- [Social & Friends System](./backend/friends-functions.md)
- [In-App Notifications](./backend/notifications-functions.md)
- [Appeals System](./backend/appeals-functions.md)
- [Scheduled Cron Jobs](./backend/crons-and-scheduled-jobs.md)

### For Frontend & Mobile Engineers (React Native / Expo)
- [Navigation & Routing Structure](./frontend/navigation-and-routing.md)
- [Screens Catalog (15 Screens)](./frontend/screens-catalog.md)
- [Components Catalog (AlarmScreen, Popup, etc.)](./frontend/components-catalog.md)
- [Contexts Catalog (UserContext, PopupContext)](./frontend/contexts-catalog.md)

### For Android Native Engineers
- [AlarmModule Native Bridge](./native/alarm-module-bridge.md)
- [Native Services, Receivers & AlarmActivity](./native/native-services-and-receivers.md)
- [Permissions & Battery Optimization Guide](./native/permissions-and-battery-guide.md)

---

## ⚙️ Core Technical Specifications

| Component | Technology | Version / Key Details |
| :--- | :--- | :--- |
| **Mobile Runtime** | React Native | `0.76+` powered by **Expo SDK 52** |
| **Navigation** | Expo Router | File-based routing with Tabs and Stack modals |
| **Cloud Backend** | Convex | Serverless, reactive document database with WebSocket sync |
| **Authentication** | Custom bcrypt | Password hashing via `bcryptjs` stored in Convex `users` table |
| **Native Alarm Engine** | Android AlarmManager | Exact alarms via `setExactAndAllowWhileIdle()` |
| **Background Audio** | Foreground Service | `AlarmService.java` with `AudioAttributes.USAGE_ALARM` |
| **Lock Screen UI** | Native Activity | `AlarmActivity.java` with `FLAG_SHOW_WHEN_LOCKED` |
| **Call Verification** | Android Telephony | `READ_CALL_LOG` + `PhoneStateListener` verifying >= 60s calls |
| **Avatar Generation** | DiceBear API | Deterministic vector avatars based on user `profile_code` |
