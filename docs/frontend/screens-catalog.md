# 📱 Frontend - Screens Catalog & User Interactions

This document details every screen in the WakeupBuddy application, outlining its visual layout, local state, backend queries and mutations, and user interaction flows.

---

## 1. Authentication & Entry Screens

### 1.1 Splash & Entry Controller (`app/index.jsx`)
- **Route**: `/`
- **Purpose**: Cold-launch gatekeeper. Checks `AsyncStorage` for cached user session.
- **Interactions**:
  - If user session exists: immediately redirects to `/(tabs)/home`.
  - If no session exists: redirects to `/login`.

### 1.2 Login Screen (`app/login.jsx`)
- **Route**: `/login`
- **Purpose**: Authenticates returning users with email and password.
- **Backend Hooks**: `useMutation(api.users.loginUser)`
- **UI Elements**: Email input, password input with show/hide toggle, "Sign In" button, link to Signup.
- **Interactions**: Calls `loginUser` mutation; upon success, calls `login(user)` from `UserContext` and routes to Home.

### 1.3 Signup Screen (`app/signup.jsx`)
- **Route**: `/signup`
- **Purpose**: Registers new accounts with full profile details.
- **Backend Hooks**: `useMutation(api.users.createUser)`, `useMutation(api.users.loginUser)`
- **UI Elements**: Name, Email, Password, Phone Number, Bio inputs.
- **Interactions**: Creates user, auto-logs in, and routes to `PermissionsGuide.jsx` for essential Android permissions onboarding.

---

## 2. Core Tab Screens (`app/(tabs)/`)

### 2.1 Home Screen (`app/(tabs)/home.jsx`)
- **Route**: `/(tabs)/home`
- **Purpose**: Primary dashboard providing morning readiness, streak tracking, activity heatmap, and quick alarm management.
- **Backend Hooks**:
  - `useQuery(api.streaks.getStreak)`
  - `useQuery(api.streaks.getRecentStreaks)`
  - `useQuery(api.alarms.getAlarmsByUser)`
  - `useQuery(api.notifications.getPendingNotificationsCount)`
- **Key UI Sections**:
  1. **Header Bar**: Dynamic greeting based on time of day ("Good Morning", "Rise & Shine"), notifications bell with unread badge.
  2. **Streak Card**: Flaming streak counter (`🔥`), max streak badge, motivational quotes.
  3. **90-Day Activity Heatmap**: Interactive GitHub-style grid visualizing the last 90 days.
  4. **Active Alarms Carousel**: Horizontal scroll of enabled upcoming alarms with quick toggle switches.
  5. **Quick Action Floating Buttons**: Add Alarm, Find Buddy, View Rank.

### 2.2 Alarms Screen (`app/(tabs)/alarms.jsx`)
- **Route**: `/(tabs)/alarms`
- **Purpose**: Central hub for managing, creating, editing, and toggling alarms.
- **Backend Hooks**:
  - `useQuery(api.alarms.getAlarmsByUser)`
  - `useMutation(api.alarms.toggleAlarm)`
  - `useMutation(api.alarms.deleteAlarm)`
- **Interactions**:
  - Toggling an alarm switch updates both Convex database state and native Android `AlarmManager`.
  - Swiping or tapping delete removes alarm from both cloud and OS scheduler.
  - Floating `+` button opens `alarm-editor.jsx`.

### 2.3 Explore Screen (`app/(tabs)/explore.jsx`)
- **Route**: `/(tabs)/explore`
- **Purpose**: Social discovery screen for finding new wake buddies and checking stranger queue counts.
- **Backend Hooks**:
  - `useQuery(api.users.getAllUsers)`
  - `useQuery(api.alarms.getStrangerMatchCounts)`
  - `useMutation(api.friends.sendFriendRequest)`
- **UI Elements**: Search bar for usernames/names, cards showing active strangers, time slots waiting for matches, "Add Friend" buttons.

### 2.4 Rank Screen (`app/(tabs)/rank.jsx`)
- **Route**: `/(tabs)/rank`
- **Purpose**: Daily and Global leaderboards fostering competition.
- **Backend Hooks**:
  - `useQuery(api.leaderboard.getLeaderboard)`
  - `useQuery(api.leaderboard.getFriendsLeaderboard)`
  - `useQuery(api.leaderboard.getUserLeaderboardStats)`
- **Key UI Sections**:
  - Segmented control: **Daily** vs **Global**.
  - Secondary filter: **All Users** vs **Friends Only**.
  - Podium display for Top 3 performers (Gold, Silver, Bronze badges).
  - Sticky bottom card highlighting the current user's personal rank.

### 2.5 Profile Screen (`app/(tabs)/profile.jsx`)
- **Route**: `/(tabs)/profile`
- **Purpose**: Personal portfolio, avatar customization, wake history, and achievements showcase.
- **Backend Hooks**:
  - `useQuery(api.achievements.getUserAchievementsWithStatus)`
  - `useQuery(api.streaks.getProfileStats)`
  - `useMutation(api.users.updateProfileCode)`
- **UI Elements**: Large avatar, bio, total wakeups counter, 17 achievement badges grid (color for unlocked, gray for locked), navigation buttons to Settings, Stats, and My Buddies.

---

## 3. Detail & Stack Screens (`app/screens/`)

### 3.1 Alarm Editor (`app/screens/alarm-editor.jsx`)
- **Route**: `/screens/alarm-editor`
- **Purpose**: Modal interface for creating or editing alarms.
- **Backend Hooks**: `useMutation(api.alarms.createAlarm)`, `useMutation(api.alarms.updateAlarm)`
- **Controls**: Time pickers (hours, minutes, AM/PM), day-of-week checkboxes, label input, Solo mode toggle, buddy selector modal.

### 3.2 Notifications Screen (`app/screens/notifications.jsx`)
- **Route**: `/screens/notifications`
- **Purpose**: Inbox for incoming buddy requests and alarm invitations.
- **Backend Hooks**: `useQuery(api.notifications.getNotificationsByEmail)`, `useMutation(api.notifications.acceptBuddyRequest)`
- **Interactions**: Tapping "Accept" binds alarms on both devices.

### 3.3 My Buddies Screen (`app/screens/my-buddies.jsx`)
- **Route**: `/screens/my-buddies`
- **Purpose**: Social management, buddy wake comparisons, and call statistics.
- **Backend Hooks**: `useQuery(api.friends.getFriends)`, `useQuery(api.calls.getBuddyStats)`

### 3.4 Permissions Guide (`app/screens/PermissionsGuide.jsx`)
- **Route**: `/screens/PermissionsGuide`
- **Purpose**: Diagnostic and onboarding screen ensuring the user has granted all 5 required Android permissions (Exact Alarms, Battery Optimization Exemption, Overlay Display, Full-Screen Intent, Phone Call).
- **Native Bridge Hooks**: `checkAllPermissions()`, `requestExactAlarmPermission()`, etc.

### 3.5 Account Details (`app/screens/account-details.jsx`)
- **Route**: `/screens/account-details`
- **Purpose**: Profile editing, password changing, and session logout.

### 3.6 Appeal Screen (`app/screens/appeal.jsx`)
- **Route**: `/screens/appeal`
- **Purpose**: Form for banned or restricted users to submit explanations to unblock their accounts.
- **Backend Hooks**: `useMutation(api.appeals.submitAppeal)`, `useQuery(api.appeals.getAppealStatus)`

### 3.7 Public Profile Screen (`app/user/[id].jsx`)
- **Route**: `/user/[id]`
- **Purpose**: Public profile view for any other user on the platform. Displays their stats, achievements, and provides an "Add Buddy" / "Report User" action.
