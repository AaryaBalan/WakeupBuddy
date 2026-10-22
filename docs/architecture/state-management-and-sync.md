# 💾 WakeupBuddy - State Management & Real-Time Sync

This document describes how state is initialized, cached, updated, and synchronized between client storage, React components, and the Convex cloud backend.

---

## 1. State Architecture Overview

WakeupBuddy uses a multi-tier state management model:

```
┌────────────────────────────────────────────────────────┐
│                   React Native UI Layer                │
│    (Tabs, Screens, Components, Modals, Forms)          │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ▼                        ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│       UserContext            │  │        PopupContext          │
│ - Current user profile       │  │ - Global modal dialogs       │
│ - Session authentication     │  │ - Streak celebration alert   │
│ - Ban verification           │  │ - Confirmation prompts       │
└───────────────┬──────────────┘  └──────────────────────────────┘
                │
                ├────────────────────────────────┐
                ▼                                ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│     AsyncStorage (Disk)      │  │     Convex Cloud Engine      │
│ - Key: 'user'                │  │ - WebSocket subscriptions    │
│ - Offline session persistence│  │ - Reactive document updates  │
└──────────────────────────────┘  └──────────────────────────────┘
```

---

## 2. The `UserContext` Provider (`contexts/UserContext.jsx`)

### Purpose
The `UserContext` acts as the single source of truth for the authenticated user session, profile data, and ban moderation status across the entire component tree.

### Key State Variables
- `user`: Holds the user object (e.g., `_id`, `name`, `email`, `username`, `phone`, `bio`, `streak`, `maxStreak`, `profile_code`, `reportCount`).
- `loading`: Boolean indicating whether initial session hydration from `AsyncStorage` is currently executing.
- `isBanned`: Derived boolean computed as `(user?.reportCount || 0) > 3`. Restricts access to community features if true.

### Real-Time Synchronization Mechanism
To guarantee that user changes (such as points earned, streak updates, or updated profile images) reflect immediately without requiring re-login:
1. `UserContext` maintains a live Convex query:
   ```javascript
   const convexUser = useQuery(
       api.users.getUserByEmail,
       user?.email ? { email: user.email } : "skip"
   );
   ```
2. A `useEffect` hook monitors changes to `convexUser`:
   ```javascript
   useEffect(() => {
       if (convexUser && user) {
           const updatedUser = { ...user, ...convexUser };
           setUser(updatedUser);
           AsyncStorage.setItem('user', JSON.stringify(updatedUser));
       }
   }, [convexUser]);
   ```
3. This creates a bidirectional sync: offline persistence in `AsyncStorage` provides instant cold boot loading, followed by real-time patching over WebSocket as soon as Convex connects.

---

## 3. The `PopupContext` Provider (`contexts/PopupContext.jsx`)

### Purpose
Provides a declarative modal alert interface across any screen in the application without having to embed modal boilerplate inside each screen.

### Exposed Methods
- `showPopup({ title, message, type, buttons, icon })`: Opens the overlay with custom actions.
- `hidePopup()`: Closes the current modal overlay.

---

## 4. Convex Reactive Subscriptions (`useQuery`)

Convex replaces traditional REST endpoints (`GET`, `POST`) with reactive WebSocket subscriptions:

### Reactive Query Flow
1. A component declares a query hook:
   ```javascript
   const alarms = useQuery(api.alarms.getAlarmsByUser, { user_id: user._id });
   ```
2. When the component mounts, Convex sends the initial result over a persistent WebSocket.
3. If **any** mutation modifies the `alarms` table matching this query predicate (even if triggered by another user on another phone), Convex automatically pushes the new result set.
4. React re-renders the component with zero boilerplate, eliminating polling and manual state invalidation.

---

## 5. Offline Storage & Session Hydration Lifecycle

1. **App Launch (`app/index.jsx`)**:
   - Reads `AsyncStorage.getItem('user')`.
   - If user exists: redirects immediately to `/(tabs)/home`.
   - If user is null: redirects to `/login`.
2. **User Login (`loginUser` mutation)**:
   - Verifies credentials against bcrypt hash in Convex.
   - Saves sanitized user object to `AsyncStorage`.
   - Updates `UserContext`.
3. **User Logout**:
   - Clears `AsyncStorage.removeItem('user')`.
   - Sets `user = null` in `UserContext`.
   - Routes user to `/login`.
