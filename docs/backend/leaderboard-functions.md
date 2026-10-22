# 🏅 Convex Backend - Leaderboard Functions Reference (`convex/leaderboard.js`)

This document provides a technical specification for all functions managing competitive rankings, point calculations, streak multipliers, daily leaderboard resets, and friend leaderboards.

---

## 1. Scoring Mathematics Reference

Points are derived from four weighted factors:

```
Total Global Points = (max_streak × 27) + (total_wakeups × 53)
Daily Points        = today_wakeups × 97
```

### Multipliers & Bonuses
- **Current Streak Multipliers**:
  - 7+ days: `1.5x`
  - 14+ days: `2.0x`
  - 30+ days: `3.0x`
  - 60+ days: `4.0x`
  - 90+ days: `5.0x`
- **Max Streak Milestone Bonuses**:
  - 7 days: `+50 pts`
  - 14 days: `+100 pts`
  - 30 days: `+250 pts`
  - 60 days: `+500 pts`
  - 90 days: `+1000 pts`

---

## 2. `updateUserLeaderboard` (Mutation)

### Purpose
Recalculates points and updates the `leaderboard` table record for a single user. Called whenever a wake-up is logged or a call completes.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Target user email |

### Execution Logic
1. Finds user by email.
2. Queries all streaks for this user (`streaks.by_user`).
3. Computes `totalWakeups = sum(streak.count)` and `totalDaysActive = streaks.length`.
4. Filters today's wakeups to compute `today_wakeups` and `daily_points`.
5. Queries all calls involving this user from `calls` table:
   - Calculates `totalCallTime` (all-time seconds).
   - Calculates `todayCallTime` (calls made today).
6. Calculates total points via `calculatePoints(currentStreak, maxStreak, totalWakeups)`.
7. Checks if a `leaderboard` record already exists for `user._id`:
   - If exists: applies `ctx.db.patch`.
   - If missing: executes `ctx.db.insert`.

---

## 3. `getLeaderboard` (Query)

### Purpose
Fetches ranked leaderboard standings for display on `rank.jsx`. Supports both **Daily** and **Global** modes with user profile enrichment.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `period` | `v.optional(v.string())` | No | `"daily"` or `"all"` (default: `"all"`) |
| `limit` | `v.optional(v.number())` | No | Maximum entries (default: 50) |

### Sorting Logic
- **`period === "daily"`**:
  1. Primary: Sort descending by `today_wakeups`.
  2. Secondary: If wakeups are equal, sort descending by `today_call_time`.
- **`period === "all"`**:
  - Sort descending by `total_points`.
- Enriches each entry with the user's `name`, `username`, `email`, and `profile_code`.
- Assigns rank positions (`1, 2, 3...`).

---

## 4. `getFriendsLeaderboard` (Query)

### Purpose
Fetches a filtered leaderboard showing only the user and their approved friends.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Calling user email |
| `period` | `v.optional(v.string())` | No | `"daily"` or `"all"` |

### Execution Logic
1. Finds user and queries all approved friendships (`friends.status === 1`).
2. Extracts friend user IDs.
3. Queries `leaderboard` records for the user and their friends.
4. Sorts according to period rules and returns enriched array.

---

## 5. `getUserLeaderboardStats` (Query)

### Purpose
Returns a user's individual global rank, daily rank, total points, daily points, and percentiles for display on banner cards.

---

## 6. `resetDailyLeaderboard` (Mutation)

### Purpose
Scheduled maintenance mutation executed every night at **18:30 UTC (Midnight IST)** by `convex/crons.js`.

### Execution Logic
1. Collects all records in `leaderboard` table.
2. Patches each record, zeroing out daily metrics:
   ```javascript
   {
       today_wakeups: 0,
       today_call_time: 0,
       daily_points: 0,
       daily_rank: undefined,
       last_updated: Date.now()
   }
   ```
3. Guarantees that every user starts from an equal score of zero every morning.

---

## 7. `recalculateAllLeaderboards` (Mutation)

### Purpose
Administrative batch recalculation that iterates through every user, recalculates all scoring metrics from raw wake and call logs, and assigns definitive ranking numbers (`rank` and `daily_rank`).

---

## 8. `migrateCallTimeData` (Mutation)

### Purpose
One-time data migration utility that scans the `calls` table and populates historical `total_call_time` and `today_call_time` values onto existing `leaderboard` rows.
