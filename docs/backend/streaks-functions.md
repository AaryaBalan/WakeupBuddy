# 🔥 Convex Backend - Streaks Functions Reference (`convex/streaks.js`)

This document provides a technical specification for all functions handling daily wake-up registration, streak increments, 90-day heatmap generation, and historical analytics.

---

## 1. `markAwake` (Mutation)

### Purpose
Registers a wake-up event for a user on a given date. Handles both instant increment (for Solo and unmatched stranger alarms) and deferred increment (`skipIncrement: true` for matched buddy alarms).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Email of the waking user |
| `userDate` | `v.optional(v.string())` | No | Local device date formatted as `"YYYY-MM-DD"` |
| `skipIncrement` | `v.optional(v.boolean())` | No | If `true`, logs wake-up without incrementing streak |

### Execution Logic
1. Retrieves user record via `users.by_email`.
2. Computes the target date string (prefers `args.userDate` to match device local midnight, falls back to UTC).
3. Queries `streaks` on index `by_user_date` for `[user._id, targetDate]`:
   - If an entry already exists for today: increments its `count` by `+1`.
   - If no entry exists: creates a new document with `count: 1`.
4. Evaluates `skipIncrement`:
   - **If `skipIncrement === true`**: Updates the leaderboard with today's wake-up count, but keeps `user.streak` unchanged (awaiting verification from the upcoming phone call).
   - **If `skipIncrement === false` or undefined**:
     - Calculates yesterday's date string.
     - Checks if a streak entry exists for yesterday.
     - If active yesterday: `newStreak = (user.streak || 0) + 1`.
     - If missed yesterday: resets `newStreak = 1`.
     - Updates `user.maxStreak = Math.max(user.maxStreak || 0, newStreak)`.
     - Patches `users` document.
5. Invokes `updateLeaderboardForUser(ctx, user, targetDate)` to update total and daily leaderboard points.
6. Returns status, current streak, max streak, and today's wake-up count.

---

## 2. `markAwakeAfterCall` (Mutation)

### Purpose
Called after a morning buddy call finishes. Evaluates the call duration to verify genuine human interaction before awarding the streak increment.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Calling user email |
| `buddyEmail` | `v.string()` | Yes | Buddy user email |
| `callDuration` | `v.number()` | Yes | Call duration in seconds |
| `userDate` | `v.optional(v.string())` | No | Local device date (`"YYYY-MM-DD"`) |

### Verification Rule
- **`callDuration >= 60` seconds**: The call is validated! Calculates and applies the streak increment, updates `maxStreak`, triggers leaderboard recalculation, and evaluates achievements.
- **`callDuration < 60` seconds**: The call is rejected as too short to verify wakefulness. Returns `{ status: 'call_too_short', requiredDuration: 60, actualDuration }`. Streak remains unchanged.

---

## 3. `getStreak` (Query)

### Purpose
Returns current streak, max streak, and today's wake-up status for the authenticated user.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | User email |
| `userDate` | `v.optional(v.string())` | No | Local device date (`"YYYY-MM-DD"`) |

### Return Value
```typescript
{
    streak: number,
    maxStreak: number,
    hasWokenUpToday: boolean,
    todayWakeups: number
}
```

---

## 4. `getRecentStreaks` & `getRecentStreaksById` (Queries)

### Purpose
Fetches wake history documents for a user, sorted chronologically descending. Powers the **90-day activity heatmap**.

### Arguments
- `getRecentStreaks`: `{ userEmail: v.string(), days?: v.optional(v.number()) }`
- `getRecentStreaksById`: `{ userId: v.id("users"), days?: v.optional(v.number()) }`

### Return Value
`Array<{ date: string, count: number }>` for the last $N$ days (defaults to 90 days).

---

## 5. `getWeeklyStats` & `getMonthlyStats` (Queries)

### Purpose
Aggregates wake-up counts across calendar weeks and months to render analytics progress bars and consistency percentages on the **Stats** screen.

---

## 6. `getProfileStats` & `getProfileStatsById` (Queries)

### Purpose
Returns comprehensive lifetime profile statistics:
- Current streak & best streak.
- Total lifetime wake-ups.
- Total active days.
- Consistency ratio (active days / total days since account creation).
- Activity heatmap dataset.

---

## 7. `getChartData` (Query)

### Purpose
Pre-formats date-keyed wake-up counts into chart series compatible with React Native chart libraries (e.g. line charts and bar charts for the last 7 or 30 days).
