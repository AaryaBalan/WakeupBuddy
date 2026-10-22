# 🔔 Convex Backend - Notifications Functions Reference (`convex/notifications.js`)

This document provides a technical specification for all functions managing in-app notifications, buddy alarm invitations, mutual alarm provisioning upon acceptance, and unread notification badge counters.

---

## 1. `createNotification` (Mutation)

### Purpose
Dispatches an in-app notification to a user's inbox inviting them to share a scheduled alarm.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `alarm_time` | `v.string()` | Yes | Alarm time (e.g. `"6:30"`) |
| `created_by` | `v.id("users")` | Yes | Sender user ID |
| `with_whom` | `v.string()` | Yes | Receiver's email address |
| `ampm` | `v.string()` | Yes | `"AM"` or `"PM"` |
| `status` | `v.number()` | Yes | `0` = Pending, `1` = Accepted, `-1` = Rejected |

---

## 2. `getNotificationsByEmail` (Query)

### Purpose
Fetches all notifications received by a user (where `with_whom === email`), sorted newest first, enriched with the sender's user document.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `email` | `v.string()` | Yes | Target user email |

---

## 3. `acceptBuddyRequest` (Mutation)

### Purpose
Accepts an incoming buddy alarm invitation. In addition to updating the notification status to `1`, it **automatically creates/links matching alarms for both users** so neither party has to manually recreate the alarm.

### Arguments
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `notificationId` | `v.id("notifications")` | Yes | Notification document ID |
| `receiverUserId` | `v.id("users")` | Yes | Receiver user ID |
| `receiverEmail` | `v.string()` | Yes | Receiver email address |

### Execution Logic
1. Retrieves notification record and sets `status = 1`.
2. Fetches the sender user record via `notification.created_by`.
3. Creates a new enabled alarm for the **receiver** matching the sender's alarm time, with `buddy: sender.email` and `solo_mode: false`.
4. Checks if the **sender** already has an alarm at this time. If so, updates it to link to `receiverEmail`. If not, inserts an alarm for the sender.
5. Guarantees that both users have synchronized alarms ready for morning execution.

---

## 4. `updateNotificationStatus` (Mutation)

### Purpose
Directly updates the status integer of a notification (`0`, `1`, or `-1`).

---

## 5. `isBuddyAccepted` (Query)

### Purpose
Checks whether a specific buddy alarm invitation has been accepted by the receiver.

---

## 6. `getPendingNotificationsCount` (Query)

### Purpose
Returns the count of unread/pending notifications (`status === 0`) for a user email. Used to display red badge counters on navigation tabs and header icons.

---

## 7. `clearAllNotifications` (Mutation)

### Purpose
Bulk deletes all notification records for a user email to clear their inbox.
