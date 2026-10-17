# 🌅 WakeupBuddy App Description

## Overview
**WakeupBuddy** is a social alarm clock application built with React Native (Expo) and a real-time Convex backend. It transforms the typically solitary and difficult task of waking up into a social and accountable experience. Users can set alarms, pair with friends or strangers ("buddies"), and ensure they wake up on time through automated phone calls initiated upon alarm dismissal. The app heavily incorporates gamification through streaks, achievements, and leaderboards to maintain user motivation.

## Core Features
1. **Smart Alarms**: Supports Solo mode, Buddy mode (with friends), and Stranger Matching.
2. **Wake-up Calls**: Automatically triggers phone calls between buddies when the alarm goes off and is dismissed.
3. **Gamification**: Tracks daily wake-up streaks, provides a 90-day activity heatmap, and offers 17 unique unlockable achievements.
4. **Social & Community**: Includes a friend request system, global point-based leaderboards, and detailed user profiles.
5. **Reliability**: Uses custom Android native modules (`AlarmReceiver`, `AlarmService`, `AlarmActivity`) to ensure alarms ring reliably, even bypassing battery optimizations.

---

## 📱 App Screens and Their Functions

The application is structured using Expo Router for file-based navigation, separated into Authentication, Tab (Main), and Stack (Detail) screens.

### Authentication Screens
* **Login (`app/login.jsx`)**: The entry point for existing users to authenticate and access their account.
* **Signup (`app/signup.jsx`)**: Allows new users to create an account, customize their username, and set up their DiceBear avatar.

### Main Navigation (Tabs)
These screens form the core bottom-tab navigation of the application.
* **Home (`app/(tabs)/home.jsx`)**: The primary dashboard. Displays the user's current wake-up streak, a visual heatmap of recent activity, upcoming scheduled alarms, and buddy achievement progress.
* **Alarms (`app/(tabs)/alarms.jsx`)**: The central hub for alarm management. Lists all active and inactive alarms and allows users to toggle them on or off.
* **Explore (`app/(tabs)/explore.jsx`)**: A discovery screen designed to help users find new friends, send buddy requests, and opt-in to stranger matching for their upcoming alarms.
* **Rank (`app/(tabs)/rank.jsx`)**: The global and weekly leaderboard screen. Displays user rankings based on a points system calculated from streaks, consistency, and unlocked achievements.
* **Profile (`app/(tabs)/profile.jsx`)**: The user's personal hub. Shows their customized avatar, bio, overall wake history visualization, and a showcase of their earned achievements.

### Stack Screens (Detail & Settings)
These screens are pushed onto the navigation stack for specific tasks.
* **Alarm Editor (`app/screens/alarm-editor.jsx`)**: The interface for creating a new alarm or modifying an existing one. Users can set the time, repeat days, labels, and select whether it's a Solo or Buddy alarm.
* **Notifications (`app/screens/notifications.jsx`)**: The inbox for social interactions, displaying incoming buddy requests, system alerts, and friend activities.
* **My Buddies (`app/screens/my-buddies.jsx`)**: A management screen for the user's social circle, showing their current friends list and relationship statuses.
* **Stats (`app/screens/stats.jsx`)**: Provides in-depth statistics and analytics on the user's wake-up consistency, call durations, and historical data.
* **Permissions Guide (`app/screens/PermissionsGuide.jsx`)**: A crucial onboarding and troubleshooting screen. It guides Android users to grant the strict system permissions required for the app to function (e.g., Exact Alarms, Draw Over Other Apps, Ignore Battery Optimizations).
* **Account Details (`app/screens/account-details.jsx`)**: A settings screen for managing account preferences and sensitive information.
* **Premium (`app/screens/premium.jsx`)**: Displays the benefits of upgrading to a premium tier and provides the subscription flow.
* **Appeal (`app/screens/appeal.jsx`)**: A screen designed for users to submit appeals, likely to restore broken streaks due to technical errors or exceptional circumstances.

### Dynamic & Shared Screens
* **Public Profile (`app/user/[id].jsx`)**: A public-facing view of another user's profile, allowing others to view their achievements, stats, and send friend requests.
* **Request Handling (`app/request/[id].jsx`)**: A dedicated interface for managing a specific social interaction or buddy matching event.
