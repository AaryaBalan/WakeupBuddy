# 🧭 Frontend - Navigation & Routing Architecture

WakeupBuddy uses **Expo Router v4** (file-based routing) to manage screen transitions, deep links, modal presentations, and bottom tab navigation.

---

## 1. Directory Tree & Route Mapping

```
app/
├── _layout.jsx             # Root layout with ConvexProvider & Context providers
├── index.jsx               # Entry splash & auth redirect controller
├── login.jsx               # Authentication screen (Email + Password)
├── signup.jsx              # Registration screen (Name, Email, Password, Phone)
│
├── (tabs)/                 # Bottom tab bar navigation group
│   ├── _layout.jsx         # Bottom tab bar styling, icons, and badges
│   ├── home.jsx            # Tab 1: Dashboard (Streaks, Heatmap, Alarms)
│   ├── alarms.jsx          # Tab 2: Alarm list & toggles
│   ├── explore.jsx         # Tab 3: Stranger discovery & friend search
│   ├── rank.jsx            # Tab 4: Daily & Global leaderboards
│   └── profile.jsx         # Tab 5: User profile & achievements showcase
│
├── screens/                # Detail stack screens pushed on top of tabs
│   ├── alarm-editor.jsx    # Alarm creation and editing modal
│   ├── notifications.jsx   # Social invites and alerts inbox
│   ├── my-buddies.jsx      # Friends list, call histories & stats
│   ├── stats.jsx           # Analytics charts and wake consistency
│   ├── PermissionsGuide.jsx# System permissions checklist for Android
│   ├── account-details.jsx # Profile updates and password change
│   ├── premium.jsx         # Premium subscription perks and checkout
│   └── appeal.jsx          # Account ban appeal form
│
└── user/
    └── [id].jsx            # Dynamic public profile screen for any user
```

---

## 2. Root Layout Initialization (`app/_layout.jsx`)

The root layout wraps the entire app in necessary providers:
```javascript
export default function RootLayout() {
    return (
        <ConvexProvider client={convex}>
            <UserProvider>
                <PopupProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="signup" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="screens/alarm-editor" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="screens/PermissionsGuide" />
                        <Stack.Screen name="user/[id]" />
                    </Stack>
                </PopupProvider>
            </UserProvider>
        </ConvexProvider>
    );
}
```

---

## 3. Tab Bar Navigation (`app/(tabs)/_layout.jsx`)

The bottom tab navigator provides intuitive navigation across five core domains:
1. **Home (`home.jsx`)**: Icon `home` / `home-outline`. Main daily dashboard.
2. **Alarms (`alarms.jsx`)**: Icon `alarm` / `alarm-outline`. Alarm management hub.
3. **Explore (`explore.jsx`)**: Icon `compass` / `compass-outline`. Social discovery.
4. **Rank (`rank.jsx`)**: Icon `trophy` / `trophy-outline`. Leaderboards.
5. **Profile (`profile.jsx`)**: Icon `person` / `person-outline`. Profile and achievements.

The tab bar uses curated dark-mode styling with active accent coloring (`#C9E265` lime green).

---

## 4. Deep Linking & Dynamic Routing

### User Profiles (`app/user/[id].jsx`)
- Activated by navigating to `/user/${userId}`.
- Reads route parameter using `useLocalSearchParams()`.
- Fetches public profile, streak, heatmap, and friendship status for that specific user.

### Alarm Editor Modal (`app/screens/alarm-editor.jsx`)
- Rendered with `presentation: 'modal'`.
- Supports passing optional `alarmId` query parameter to populate the form for editing an existing alarm.
