# 🛡️ Convex Backend - Appeals Functions Reference (`convex/appeals.js`)

This document provides a technical specification for all functions handling user appeals against account suspensions or report penalties.

---

## 1. System Overview

Users who accumulate more than 3 validated reports (`user.reportCount > 3`) are restricted from community features. The appeals system enables users to submit formal explanations requesting review and account reinstatement.

---

## 2. `submitAppeal` (Mutation)

### Purpose
Submits a new formal appeal. Validates that the user is actually in a banned/flagged state and prevents duplicate pending appeals.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Email of the appealing user |
| `reason` | `v.string()` | Yes | User's explanation and justification |

### Execution Logic
1. Retrieves user document. Throws Error `"User not found"` if missing.
2. Checks user moderation status: if `(user.reportCount || 0) <= 3`, throws Error `"User is not banned"`.
3. Checks for existing pending appeals:
   ```javascript
   const existingAppeal = await ctx.db
       .query("appeals")
       .withIndex("by_user", q => q.eq("userId", user._id))
       .filter(q => q.eq(q.field("status"), "pending"))
       .first();
   ```
4. If a pending appeal exists, throws Error `"You already have a pending appeal"`.
5. Inserts new document into `appeals` table with `status: "pending"` and `submittedAt: Date.now()`.
6. Returns `{ success: true, appealId }`.

---

## 3. `getAppealStatus` (Query)

### Purpose
Fetches the current status (`"pending"`, `"approved"`, `"rejected"`) of the user's most recent appeal.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Target user email |

### Return Value
`Document<"appeals"> | null` (most recent by `submittedAt`).

---

## 4. `getUserAppeals` (Query)

### Purpose
Fetches the complete appeal history for a user, sorted chronologically descending.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Target user email |
