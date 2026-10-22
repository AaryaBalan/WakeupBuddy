# 🤝 Convex Backend - Stranger Matching Reference (`convex/matching.js`)

This document provides a technical specification for the automated matchmaking algorithm that pairs strangers scheduling alarms at the exact same minute.

---

## 1. Matching Algorithm Overview

The stranger matching engine operates via two complementary mechanisms:
1. **Synchronous Immediate Match**: When an alarm is created via `api.alarms.createAlarm`, the system checks for any user currently waiting for that slot.
2. **Asynchronous Cron Match (`runMatchingForUpcomingAlarms`)**: Every 60 seconds, a serverless cron inspects alarms scheduled **2 minutes in advance**, pairing compatible users before native alarms ring.

```
                  [Cron Fires Every 1 Minute]
                               │
                               ▼
               [Calculate Target Time = Now + 2 Mins]
                               │
                               ▼
           [Query All Enabled Stranger Alarms for Target]
                               │
                               ▼
            [Group by User ID to Prevent Self-Matching]
                               │
                               ▼
                  ┌─── Are There >= 2 Users? ───┐
                  │                             │
                 YES                            NO
                  │                             │
                  ▼                             ▼
       [Pair (User 1, User 2)]       [Leave for Solo Fallback]
       [Patch Both Alarms]
       [Set matched_at Timestamp]
```

---

## 2. `findUnmatchedStrangerAlarms` (Internal Query)

### Purpose
Internal backend helper that retrieves all unmatched, enabled stranger alarms for a target time slot.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `time` | `v.string()` | Yes | Target time string (e.g. `"6:30"`) |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |
| `dayIndex` | `v.optional(v.number())` | No | Optional day index |

### Execution Logic
1. Queries index `alarms.by_time_ampm`.
2. Filters for `solo_mode === false`, `buddy === null`, and `enabled === true`.

---

## 3. `matchTwoAlarms` (Internal Mutation)

### Purpose
Atomically pairs two alarms together, updating each alarm's `buddy` field with the other user's email address and recording the `matched_at` timestamp.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `alarm1Id` | `v.id("alarms")` | Yes | First alarm ID |
| `alarm2Id` | `v.id("alarms")` | Yes | Second alarm ID |
| `user1Email` | `v.string()` | Yes | First user's email |
| `user2Email` | `v.string()` | Yes | Second user's email |

### Execution Logic
1. Executes `ctx.db.patch(args.alarm1Id, { buddy: args.user2Email, matched_at: Date.now() })`.
2. Executes `ctx.db.patch(args.alarm2Id, { buddy: args.user1Email, matched_at: Date.now() })`.
3. Returns `{ success: true, matchedCount: 2 }`.

---

## 4. `runMatchingForUpcomingAlarms` (Internal Mutation)

### Purpose
The primary cron worker routine invoked once per minute by `convex/crons.js`. It looks ahead by 2 minutes, matches all pairs of waiting stranger alarms, and leaves unmatched alarms to ring safely in Solo mode.

### Execution Logic
1. Computes the target timestamp: `now + 2 minutes`.
2. Formats target hours, minutes, and AM/PM string.
3. Finds all enabled stranger alarms matching this time slot.
4. Groups alarms by `user_id` to ensure a user cannot be paired with their own alarm.
5. Pairs available alarms sequentially (`User A` with `User B`, `User C` with `User D`).
6. Updates each pair with reciprocal buddy emails.
7. Logs match results for cloud observability.

---

## 5. `getPendingStrangerAlarms` (Query)

### Purpose
Returns all stranger alarms currently in the waiting queue across the entire platform.

---

## 6. `getRecentlyMatchedAlarms` (Query)

### Purpose
Fetches alarms that were successfully matched within the last 24 hours.

---

## 7. `triggerMatching` (Mutation)

### Purpose
Allows an admin or client test runner to manually trigger a matching cycle for a specific time slot without waiting for the scheduled cron.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `time` | `v.string()` | Yes | Target time (e.g., `"6:30"`) |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |

---

## 8. `matchAllPendingStrangerAlarms` (Mutation)

### Purpose
Batch matches all compatible pending stranger alarms across all time slots. Useful for system migrations or testing.

---

## 9. `getMatchingStats` (Query)

### Purpose
Returns system-wide matchmaking health metrics:
- Total pending stranger alarms.
- Total successfully matched alarms.
- Distribution of pending alarms grouped by time slot.
