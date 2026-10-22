# ⏰ Convex Backend - Alarms Functions Reference (`convex/alarms.js`)

This document provides a technical specification for all functions managing alarm creation, modifications, queries, instant stranger pairing, and scheduled alarm state.

---

## 1. `createAlarm` (Mutation)

### Purpose
Creates a new alarm record for a user. If created in **Stranger Mode** (solo_mode = `false`, buddy = `null`), it attempts an **instant match** with any other enabled stranger alarm scheduled for the exact same time slot.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `time` | `v.string()` | Yes | Alarm time string (e.g. `"6:30"`) |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |
| `label` | `v.string()` | Yes | Alarm label |
| `enabled` | `v.boolean()` | Yes | Initial active toggle state |
| `days` | `v.array(v.number())` | Yes | Array of active day indexes (`0-6`) |
| `user_id` | `v.id("users")` | Yes | Creator user ID |
| `solo_mode` | `v.boolean()` | Yes | `true` for solo, `false` for buddy/stranger |
| `buddy` | `v.union(v.string(), v.null())`| Yes | Buddy email string or `null` |
| `wake_method` | `v.optional(v.string())` | No | Optional wake-up method |

### Execution Logic & Instant Match Algorithm
1. Inserts the alarm into the `alarms` table with `matched_at: undefined`.
2. Evaluates if this is an enabled stranger alarm (`!args.solo_mode && !args.buddy && args.enabled`).
3. If true, searches index `by_time_ampm` for candidate alarms matching `time` and `ampm`.
4. Filters for candidate alarms where:
   - `alarm._id !== alarmId` (not itself)
   - `alarm.solo_mode === false`
   - `alarm.buddy === null` (unmatched)
   - `alarm.enabled === true`
   - `alarm.user_id !== args.user_id` (different user)
5. If a match is found:
   - Looks up both users' emails.
   - Patches the new alarm with `buddy: user2.email` and `matched_at: Date.now()`.
   - Patches the candidate alarm with `buddy: user1.email` and `matched_at: Date.now()`.
6. Returns `alarmId`.

### Return Value
`Id<"alarms">` - The ID of the created alarm.

---

## 2. `getAlarmsByUser` (Query)

### Purpose
Retrieves all alarms created by a specific user ID.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user_id` | `v.id("users")` | Yes | The user's ID |

### Execution Logic
Queries `alarms` using index `by_user`.

### Return Value
`Array<Document<"alarms">>`

---

## 3. `updateAlarm` (Mutation)

### Purpose
Updates the properties of an existing alarm (time, repeat schedule, label, buddy mode).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `v.id("alarms")` | Yes | Alarm ID to update |
| `time` | `v.string()` | Yes | Updated time |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |
| `label` | `v.string()` | Yes | Updated label |
| `enabled` | `v.boolean()` | Yes | Enabled status |
| `days` | `v.array(v.number())` | Yes | Repeat days array |
| `user_id` | `v.id("users")` | Yes | Owner user ID |
| `solo_mode` | `v.boolean()` | Yes | Solo mode flag |
| `buddy` | `v.union(v.string(), v.null())`| Yes | Buddy email |

### Execution Logic
Destructures `id` and applies `ctx.db.patch(id, fields)`.

---

## 4. `deleteAlarm` (Mutation)

### Purpose
Permanently removes a single alarm record by ID.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `v.id("alarms")` | Yes | ID of alarm to delete |

---

## 5. `deleteAllAlarms` (Mutation)

### Purpose
Utility mutation to delete all alarms belonging to a given user.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user_id` | `v.id("users")` | Yes | User ID |

### Return Value
`{ deletedCount: number }`

---

## 6. `toggleAlarm` (Mutation)

### Purpose
Rapidly toggles an alarm on or off without altering its schedule or buddy configuration.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `v.id("alarms")` | Yes | Alarm ID |
| `enabled` | `v.boolean()` | Yes | Target state (`true` or `false`) |

---

## 7. `getAlarmById` (Query)

### Purpose
Retrieves an alarm document by its ID. Used by the native ringing activity to fetch the most up-to-date alarm configuration (crucial if a stranger match occurred after native scheduling).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `alarmId` | `v.id("alarms")` | Yes | Alarm ID |

---

## 8. `getAlarmWithBuddyDetails` (Query)

### Purpose
Fetches an alarm document along with the full profile of the assigned buddy (if a buddy email exists).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `alarmId` | `v.id("alarms")` | Yes | Alarm ID |

### Return Value
```typescript
{
    alarm: Document<"alarms">,
    buddyUser: Document<"users"> | null
} | null
```

---

## 9. `getAlarms` (Query)

### Purpose
Fetches all alarms for a user using their email address.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | User's email |

---

## 10. `getAlarmByTimeAndUser` (Query)

### Purpose
Finds an alarm and associated buddy profile matching an exact time and AM/PM string for a user.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | User email |
| `alarmTime` | `v.string()` | Yes | e.g. `"7:00"` |
| `alarmAmpm` | `v.string()` | Yes | e.g. `"AM"` |

---

## 11. `findAlarmByTimeForUser` (Query)

### Purpose
Finds the active alarm for a user given a time and AM/PM when the `alarmId` is not directly accessible (e.g. cold intent launch).

---

## 12. `findAlarmByDetails` (Query)

### Purpose
Finds an alarm by user email, buddy email, time, and AM/PM.

---

## 13. `getStrangerMatchCounts` (Query)

### Purpose
Aggregates and returns the number of users waiting to match across all upcoming time slots.

### Arguments
None.

### Return Value
An object mapping time keys to waiting counts:
```json
{
    "05:30 AM": 3,
    "06:00 AM": 7,
    "07:15 AM": 2
}
```

---

## 14. `checkPotentialMatches` (Query)

### Purpose
Checks whether potential stranger matches exist for a proposed time slot before the user creates an alarm.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `time` | `v.string()` | Yes | Proposed alarm time |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |
| `excludeUserId` | `v.optional(v.id("users"))`| No | Current user ID to exclude |

### Return Value
```typescript
{
    count: number,
    hasMatch: boolean // true if count >= 1
}
```
