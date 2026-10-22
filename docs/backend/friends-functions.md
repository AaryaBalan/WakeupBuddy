# 👥 Convex Backend - Friends Functions Reference (`convex/friends.js`)

This document provides a technical specification for all functions managing the social graph, friend requests, approvals, friendship statuses, and buddy discovery.

---

## 1. Friendship Lifecycle & Status Codes

Friendships are modeled in the `friends` table with a pair array `users: [senderId, receiverId]`:

| Status Value | State | Meaning |
| :---: | :--- | :--- |
| `0` | **Pending** | Request sent by user 1, awaiting acceptance by user 2 |
| `1` | **Approved** | Mutual friendship active; can select each other for Buddy Alarms |
| `-1` | **Rejected** | Request declined by receiver |

---

## 2. `sendFriendRequest` (Mutation)

### Purpose
Sends a friend request from the caller to a designated receiver. Prevents self-friending and handles previously rejected requests.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `senderEmail` | `v.string()` | Yes | Email of requesting user |
| `receiverId` | `v.id("users")` | Yes | Target user ID |

### Execution Logic
1. Finds sender via `users.by_email`. Throws error if missing.
2. Asserts `sender._id !== args.receiverId` (throws `"Cannot send friend request to yourself"`).
3. Queries existing records in `friends` involving both users:
   - If `status === 0`: Throws `"Friend request already pending"`.
   - If `status === 1`: Throws `"Already friends"`.
   - If `status === -1`: Updates existing record back to `status = 0`, resetting `created_at` timestamp (returns `{ status: "request_resent" }`).
4. If no previous record exists: inserts new document with `status: 0`. Returns `{ status: "request_sent", friendshipId }`.

---

## 3. `acceptFriendRequest` (Mutation)

### Purpose
Accepts an incoming friend request, sets status to `1`, sets `friends_since: Date.now()`, and evaluates buddy achievements for both users.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `friendshipId` | `v.id("friends")` | Yes | Friendship document ID |
| `userEmail` | `v.string()` | Yes | Accepting user email (must be receiver) |

### Execution Logic
1. Looks up friendship. Verifies `friendship.users[1] === user._id` (enforces that only the designated recipient can accept).
2. Asserts `friendship.status === 0`.
3. Patches friendship with `status: 1` and `friends_since: Date.now()`.
4. Evaluates `first_buddy` and `buddy_5` achievements for **both** users.

---

## 4. `rejectFriendRequest` (Mutation)

### Purpose
Declines a pending friend request, updating its status to `-1`.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `friendshipId` | `v.id("friends")` | Yes | Friendship document ID |
| `userEmail` | `v.string()` | Yes | Rejecting user email |

---

## 5. `removeFriend` (Mutation)

### Purpose
Unfriends a user, removing the friendship document from the database.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `friendshipId` | `v.id("friends")` | Yes | Friendship ID to delete |
| `userEmail` | `v.string()` | Yes | Requesting user email |

---

## 6. `getFriends` (Query)

### Purpose
Retrieves all approved friends for a user, enriched with each friend's public profile data (name, username, email, phone, streak, profile avatar seed).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `userEmail` | `v.string()` | Yes | Target user email |

---

## 7. `getPendingRequests` & `getSentRequests` (Queries)

### Purpose
- `getPendingRequests`: Returns incoming requests waiting for the user's response (`users[1] === user._id` and `status === 0`).
- `getSentRequests`: Returns outgoing requests sent by the user (`users[0] === user._id` and `status === 0`).

---

## 8. `getFriendshipStatus` (Query)

### Purpose
Determines the current relationship status between two users to render the appropriate action button on profile pages (`"Add Buddy"`, `"Pending"`, `"Accept Request"`, or `"Friends"`).

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `user1Email` | `v.string()` | Yes | Current user email |
| `user2Id` | `v.id("users")` | Yes | Target user ID |

### Return Values
`"none"` | `"pending_sent"` | `"pending_received"` | `"friends"` | `"rejected"`
