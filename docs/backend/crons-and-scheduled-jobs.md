# ⏱️ Convex Backend - Cron Jobs Reference (`convex/crons.js`)

This document details all recurring background jobs and automated schedules configured in WakeupBuddy.

---

## 1. Cron Schedule Configuration

Background workers are declared in `convex/crons.js` using Convex's native cron scheduler:

```javascript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1. Stranger Alarm Matcher (every 1 minute)
crons.interval(
    "stranger-alarm-matching",
    { minutes: 1 },
    internal.matching.runMatchingForUpcomingAlarms
);

// 2. Daily Leaderboard Reset (every day at midnight IST / 18:30 UTC)
crons.daily(
    "reset-daily-leaderboard",
    { hourUTC: 18, minuteUTC: 30 },
    internal.leaderboard.resetDailyLeaderboard
);

export default crons;
```

---

## 2. Job 1: `stranger-alarm-matching`

| Property | Value |
| :--- | :--- |
| **Frequency** | Every 1 minute (`interval: { minutes: 1 }`) |
| **Target Function** | `internal.matching.runMatchingForUpcomingAlarms` |
| **Execution Window** | Scans for alarms scheduled 2 minutes into the future |

### Purpose & Behavior
- Guarantees that users who set an alarm in Stranger Mode without an immediate match get paired before their phone rings.
- Operates 2 minutes ahead of execution time so both Android devices receive the buddy match in their reactive cache prior to the `AlarmReceiver` broadcast.
- If only one user is scheduled for a time slot, the job leaves the alarm alone so it safely triggers as a Solo alarm without failing.

---

## 3. Job 2: `reset-daily-leaderboard`

| Property | Value |
| :--- | :--- |
| **Frequency** | Once every 24 hours (`crons.daily`) |
| **Time of Trigger** | `18:30 UTC` = **`00:00 IST` (Midnight Indian Standard Time)** |
| **Target Function** | `internal.leaderboard.resetDailyLeaderboard` |

### Purpose & Behavior
- Resets all active daily metrics on the `leaderboard` table to zero:
  - `today_wakeups = 0`
  - `today_call_time = 0`
  - `daily_points = 0`
  - `daily_rank = undefined`
- Ensures that competition on the **Daily** tab is refreshed every morning, giving all users an equal opportunity to reach #1.
