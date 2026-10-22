# 📞 Convex Backend - Calls Functions Reference (`convex/calls.js`)

This document provides a technical specification for all functions managing wake-up call records, call duration updates, buddy call histories, and mutual wake-up statistics.

---

## 1. `createCall` (Mutation)

### Purpose
Creates an initial call record in the `calls` table when an outgoing wake-up call is initiated after an alarm dismissal. Initial duration is recorded as `0` seconds and updated when the call finishes.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user1Email` | `v.string()` | Yes | Email of the caller (who pressed "I'm Awake") |
| `user2Email` | `v.string()` | Yes | Email of the buddy being called |
| `alarmId` | `v.id('alarms')` | Yes | Foreign key linking to the alarm |

### Execution Logic
1. Looks up both users by email (`users.by_email`). If either is missing, throws Error `"One or both users not found"`.
2. Inserts new record into `calls`:
   ```javascript
   {
       users: [user1._id, user2._id],
       call_duration: 0,
       call_time: new Date().toISOString(),
       alarm_id: args.alarmId
   }
   ```
3. Returns `{ callId, status: 'initiated', timestamp }`.

---

## 2. `updateCallDuration` (Mutation)

### Purpose
Updates the duration of an ongoing or completed call with the actual duration (in seconds) captured by the Android native telephony bridge.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `callId` | `v.id('calls')` | Yes | Call record ID |
| `duration` | `v.number()` | Yes | Call duration in seconds |

### Execution Logic
Applies `ctx.db.patch(args.callId, { call_duration: args.duration })` and returns `{ status: 'updated', duration }`.

---

## 3. `getCallById` (Query)

### Purpose
Fetches call details along with both participants' emails.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `callId` | `v.id("calls")` | Yes | Call ID |

### Return Value
```typescript
{
    _id: Id<"calls">,
    user1Email: string,
    user2Email: string,
    call_duration: number,
    call_time: string,
    alarm_id: Id<"alarms">
} | null
```

---

## 4. `getCallsByUser` (Query)

### Purpose
Retrieves the call history for a user, sorted newest first, enriched with the other participant's display name and email.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Target user email |
| `limit` | `v.optional(v.number())` | No | Optional maximum number of calls to return |

---

## 5. `getCallsBetweenUsers` (Query)

### Purpose
Fetches all calls between two specific users, sorted chronologically descending.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user1Email` | `v.string()` | Yes | First user email |
| `user2Email` | `v.string()` | Yes | Second user email |

---

## 6. `getBuddyStats` (Query)

### Purpose
Computes in-depth mutual statistics between two buddies for the **Stats** and **My Buddies** screens:
- Total mutual wake-ups.
- Total cumulative call time.
- Longest call and average call duration.
- Mutual buddy streak (consecutive calendar days waking up together).
- Monthly and daily breakdown charts.
- Recent calls log.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user1Email` | `v.string()` | Yes | Current user email |
| `user2Email` | `v.string()` | Yes | Buddy user email |

### Return Value
```typescript
{
    totalWakeups: number,
    totalCallTime: number,      // in seconds
    longestCall: number,        // in seconds
    averageCallTime: number,    // in seconds
    currentStreak: number,      // consecutive days together
    bestStreak: number,
    monthlyStats: Array<{ month: string, label: string, wakeups: number, callTime: number }>,
    dailyStats: Array<{ date: string, label: string, wakeups: number, callTime: number }>,
    recentCalls: Array<{ _id: Id<"calls">, call_time: string, call_duration: number }>
}
```

---

## 7. `getComparisonStats` (Query)

### Purpose
Generates a side-by-side comparison between the user and their buddy across streaks, total wake-ups, and a 7-day daily activity bar chart for the `my-buddies.jsx` screen.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user1Email` | `v.string()` | Yes | User 1 email |
| `user2Email` | `v.string()` | Yes | User 2 email |

### Return Value
```typescript
{
    user1Stats: { name: string, streak: number, maxStreak: number, totalWakeups: number },
    user2Stats: { name: string, streak: number, maxStreak: number, totalWakeups: number },
    weeklyComparison: Array<{
        date: string,        // YYYY-MM-DD
        dayName: string,     // Mon, Tue...
        user1Count: number,
        user2Count: number
    }>
}
```
