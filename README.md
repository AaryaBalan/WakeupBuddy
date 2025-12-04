# 🌅 WakeupBuddy

**Wake up together, stay accountable.**

WakeupBuddy is a social alarm clock app that connects you with friends or strangers to help you wake up on time. When your alarm rings, you call your buddy - making waking up a social, accountable experience.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54.0-black)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green)

---

## ✨ Features

### 🔔 Smart Alarms

- Create customizable alarms with labels and repeat days
- **Buddy Mode**: Pair with a friend to wake up together
- **Solo Mode**: Traditional alarm for independent wake-ups
- **Stranger Matching**: Get matched with someone waking up at the same time

### 📞 Wake-up Calls

- Automatic phone calls to your buddy when alarm dismisses
- Call duration tracking and statistics
- Deep link integration for seamless alarm-to-call flow

### 🔥 Streak System

- Track daily wake-up streaks
- Visual heatmap showing last 10/90 days activity
- Streak preservation with consistent wake-ups

### 🏆 Achievements & Gamification

- **17 unique achievements** to unlock:
   - Streak milestones (3, 7, 14, 30, 100 days)
   - Wake-up counts (1, 10, 50, 100 wake-ups)
   - Buddy achievements (1, 5 friends)
   - Special badges (Early Bird, Night Owl, Weekend Warrior, etc.)
- Achievement modal with earned/locked status

### 📊 Leaderboard

- Global ranking based on points system
- Weekly and monthly leaderboards
- Points from streaks, consistency, and achievements

### 👥 Social Features

- Friend system with send/accept/decline requests
- View friends' profiles and achievements
- Buddy achievements section on home screen
- My Buddies screen to manage friendships

### 👤 Profile

- Customizable avatar (DiceBear integration)
- Bio and username
- Wake history visualization
- Achievement showcase

---

## 🛠️ Tech Stack

### Frontend

- **React Native** with Expo SDK 54
- **Expo Router** for file-based navigation
- **React Native Reanimated** for animations
- **Montserrat** font family

### Backend

- **Convex** - Real-time backend with:
   - Users, Alarms, Streaks, Calls tables
   - Friends & Notifications system
   - Leaderboard with point calculation
   - Achievements tracking
   - Cron jobs for stranger matching

### Native Modules (Android)

- Custom `AlarmReceiver` for reliable alarm triggering
- `AlarmService` for foreground notification
- `AlarmActivity` for lock screen alarm UI
- Call state tracking for duration logging
- Boot receiver for alarm persistence

---

## 📁 Project Structure

```
WakeupBuddy/
├── app/                      # Expo Router pages
│   ├── (tabs)/               # Tab navigation screens
│   │   ├── home.jsx          # Home with streaks & upcoming alarms
│   │   ├── alarms.jsx        # Alarm list management
│   │   ├── explore.jsx       # Discover users
│   │   ├── rank.jsx          # Leaderboard
│   │   └── profile.jsx       # User profile & settings
│   ├── screens/              # Stack screens
│   │   ├── alarm-editor.jsx  # Create/edit alarms
│   │   ├── notifications.jsx # Buddy requests
│   │   ├── my-buddies.jsx    # Friends list
│   │   ├── stats.jsx         # Buddy statistics
│   │   └── PermissionsGuide.jsx
│   ├── user/[id].jsx         # Public profile view
│   ├── native/               # Native module bridges
│   └── request/[id].jsx      # Buddy request handling
├── convex/                   # Backend functions
│   ├── schema.js             # Database schema
│   ├── users.js              # User CRUD
│   ├── alarms.js             # Alarm management
│   ├── streaks.js            # Streak tracking
│   ├── friends.js            # Friend system
│   ├── achievements.js       # Achievement system
│   ├── leaderboard.js        # Points & ranking
│   ├── matching.js           # Stranger matching
│   └── calls.js              # Call logging
├── android/                  # Native Android code
│   └── app/src/main/java/    # Custom alarm components
├── styles/                   # StyleSheet files
├── components/               # Reusable components
├── contexts/                 # React contexts
└── assets/                   # Images & fonts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.x
- npm or yarn
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Convex account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AaryaBalan/WakeupBuddy.git
   cd WakeupBuddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Convex**

   ```bash
   npx convex dev
   ```

   This will prompt you to create a Convex project and set up your `.env.local` file.

4. **Configure environment variables**
   Create a `.env.local` file:

   ```env
   EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

5. **Run the app**

   ```bash
   # For Android
   npx expo run:android

   # For iOS
   npx expo run:ios

   # Or start Expo dev server
   npx expo start
   ```

---

## 📱 Android Permissions

The app requires the following permissions:

- `WAKE_LOCK` - Keep device awake for alarms
- `SCHEDULE_EXACT_ALARM` - Schedule precise alarms
- `USE_FULL_SCREEN_INTENT` - Show alarm on lock screen
- `FOREGROUND_SERVICE` - Run alarm service
- `CALL_PHONE` - Make wake-up calls
- `READ_PHONE_STATE` - Track call state
- `READ_CALL_LOG` - Get call duration
- `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` - Reliable alarms

---

## 🎨 Design

- **Theme**: Dark mode with neon lime accent (`#C9E265`)
- **Typography**: Montserrat font family
- **Icons**: Ionicons
- **Avatars**: DiceBear API (Adventurer style)

---

## 📄 License

This project is private and proprietary.

---

## 👨‍💻 Author

**Aarya Balan**

- GitHub: [@AaryaBalan](https://github.com/AaryaBalan)

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - React Native framework
- [Convex](https://convex.dev) - Backend platform
- [DiceBear](https://dicebear.com) - Avatar generation
- [Ionicons](https://ionic.io/ionicons) - Icon library
