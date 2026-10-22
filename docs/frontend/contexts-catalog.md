# 🌐 Frontend - Contexts Catalog Reference

This document details the React Context providers that manage application-wide shared state.

---

## 1. `UserContext` (`contexts/UserContext.jsx`)

### Purpose
Central state container for user identity, authentication, session tokens, ban verification, and real-time profile synchronization.

### Interface & Hook
```javascript
import { useUser } from '../contexts/UserContext';

const {
    user,          // Object: Current user document or null
    loading,       // Boolean: True while loading from AsyncStorage
    login,         // Function: async (userData) => void
    logout,        // Function: async () => void
    updateUser,    // Function: async (updatedData) => void
    loadUser,      // Function: async () => void
    isBanned       // Boolean: (user?.reportCount || 0) > 3
} = useUser();
```

### Lifecycle Details
1. **Mount**: Executes `loadUser()`, reading the `'user'` key from `AsyncStorage`. Sets `loading = false`.
2. **Live Subscription**: Uses `api.users.getUserByEmail` to track changes in Convex. When Convex pushes an update, merges new fields into local state and writes back to `AsyncStorage`.
3. **Moderation Gate**: Computes `isBanned = (user?.reportCount || 0) > 3`. If true, downstream screens restrict the user from creating buddy alarms or sending friend requests.

---

## 2. `PopupContext` (`contexts/PopupContext.jsx`)

### Purpose
Exposes a simple imperative API for showing custom modal dialogs from anywhere in the component hierarchy.

### Interface & Hook
```javascript
import { usePopup } from '../contexts/PopupContext';

const { showPopup, hidePopup } = usePopup();

// Example usage:
showPopup({
    title: "Streak Maintained!",
    message: "You've successfully woken up 7 days in a row!",
    type: "success",
    buttons: [
        { text: "Awesome!", onPress: () => hidePopup() }
    ]
});
```
