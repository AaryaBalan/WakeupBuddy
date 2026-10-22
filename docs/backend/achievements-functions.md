# 🏆 Convex Backend - Achievements Functions Reference (`convex/achievements.js`)

This document provides a technical specification for all functions handling milestone evaluations, badge awards, achievement catalogs, and retroactive backfills.

---

## 1. Achievement Definitions Catalog

All 17 platform achievements are defined centrally in `ACHIEVEMENT_DEFINITIONS`:

```javascript
// Streaks
streak_3:    { name: "Getting Started",     threshold: 3,   category: "streak", icon: "flame-outline" }
streak_7:    { name: "7 Day Streak",        threshold: 7,   category: "streak", icon: "flame" }
streak_14:   { name: "Two Week Warrior",    threshold: 14,  category: "streak", icon: "flame" }
streak_30:   { name: "Monthly Master",      threshold: 30,  category: "streak", icon: "trophy" }
streak_100:  { name: "Century Club",        threshold: 100, category: "streak", icon: "medal" }

// Wakeup Volume
wakeup_1:    { name: "First Wakeup",        threshold: 1,   category: "wakeup", icon: "sunny-outline" }
wakeup_10:   { name: "Early Riser",         threshold: 10,  category: "wakeup", icon: "sunny" }
wakeup_50:   { name: "Morning Person",      threshold: 50,  category: "wakeup", icon: "star" }
wakeup_100:  { name: "Wakeup Legend",       threshold: 100, category: "wakeup", icon: "star" }

// Early Bird Timing
early_bird:   { name: "Early Bird",         threshold: 1,   category: "early",  icon: "alarm" }
early_bird_5: { name: "Super Early Bird",   threshold: 5,   category: "early",  icon: "alarm" }

// Social & Buddies
first_buddy:  { name: "First Buddy",        threshold: 1,   category: "buddy",  icon: "people-outline" }
buddy_5:      { name: "Social Butterfly",   threshold: 5,   category: "buddy",  icon: "people" }
buddy_helper: { name: "Buddy Helper",       threshold: 1,   category: "buddy",  icon: "hand-left" }

// Special Feats
weekend_warrior:    { name: "Weekend Warrior",    category: "special", icon: "calendar" }
night_owl_reformed: { name: "Night Owl Reformed", category: "special", icon: "moon" }
consistent_week:    { name: "Consistent Week",    category: "special", icon: "time" }
```

---

## 2. `getUserAchievements` & `getAchievementsByEmail` (Queries)

### Purpose
Fetches all achievement badges currently unlocked by a user.

### Arguments
- `getUserAchievements`: `{ userId: v.id("users") }`
- `getAchievementsByEmail`: `{ userEmail: v.string() }`

### Return Value
`Array<Document<"achievements">>` sorted by `earned_at` descending.

---

## 3. `getUserAchievementsWithStatus` (Query)

### Purpose
Returns all 17 achievement definitions merged with the user's unlock status (`unlocked: true/false`, `earned_at`, metadata). Used by `profile.jsx` to render both earned and locked greyed-out badges.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userId` | `v.id("users")` | Yes | Target user ID |

---

## 4. `awardAchievement` (Mutation)

### Purpose
Safely awards a specific achievement badge to a user. Uses compound index `by_user_type` (`[user_id, achievement_type]`) to guarantee idempotency and prevent duplicate awards.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userId` | `v.id("users")` | Yes | Target user ID |
| `achievementType` | `v.string()` | Yes | Badge key (e.g., `"streak_7"`) |
| `metadata` | `v.optional(v.object(...))` | No | Optional contextual metadata |

### Execution Logic
1. Checks if `achievementType` exists in definitions.
2. Queries `achievements` on index `by_user_type`.
3. If document exists, returns `{ awarded: false, reason: "already_earned" }`.
4. Inserts new document into `achievements` and returns `{ awarded: true, achievementId }`.

---

## 5. Evaluation Mutations

### `checkStreakAchievements` (Mutation)
- **Args**: `{ userId: v.id("users"), currentStreak: v.number() }`
- Evaluates against streak thresholds (`3, 7, 14, 30, 100`) and awards any newly crossed milestones.

### `checkWakeupAchievements` (Mutation)
- **Args**: `{ userId: v.id("users"), totalWakeups: v.number() }`
- Evaluates against volume thresholds (`1, 10, 50, 100`) and awards newly crossed milestones.

### `checkBuddyAchievements` (Mutation)
- **Args**: `{ userId: v.id("users"), friendCount: v.number() }`
- Evaluates against friend count thresholds (`1, 5`) and awards `first_buddy` or `buddy_5`.

### `awardEarlyBird` (Mutation)
- **Args**: `{ userId: v.id("users"), minutesEarly: v.number() }`
- Awards `early_bird` and tracks early wakeup counts toward `early_bird_5`.

---

## 6. Backfill Routines

### `backfillUserAchievements` (Mutation)
- Evaluates a single user's historical streaks, total wake-ups, and friend counts, awarding all milestones they qualify for retrospectively.

### `backfillAllUsersAchievements` (Mutation)
- Batch routine executing `backfillUserAchievements` for every registered user in the database.
