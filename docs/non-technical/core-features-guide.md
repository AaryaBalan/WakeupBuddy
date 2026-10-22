# 🛠️ WakeupBuddy - Core Features Guide

This document breaks down every user-facing feature of WakeupBuddy in clear, non-technical language.

---

## 1. Smart Alarms System

WakeupBuddy allows users to create customizable alarms tailored to their preferred style of accountability:

| Alarm Mode | Description | How It Works |
| :--- | :--- | :--- |
| **Solo Mode** | Individual wake-up with streak tracking | Acts like a regular alarm clock. When dismissed, your streak increments and points are awarded without triggering a phone call. |
| **Buddy Mode** | 1-on-1 accountability with an existing friend | Link the alarm to a friend's email. When either user dismisses the alarm, both phones stop ringing, and an automated phone call connects them. |
| **Stranger Match** | Global automated pairing | Set your desired wake-up time without a buddy. The system pairs you with another verified user waking up at the exact same minute. |

### Alarm Configuration Options
- **Time & AM/PM**: Exact hour and minute selection.
- **Repeat Days**: Multi-day scheduling (Monday through Sunday).
- **Custom Label**: e.g., "Morning Workout", "Standup Prep", "Study Sprint".
- **Toggle State**: Instant on/off toggle without deleting saved settings.

---

## 2. Automated Wake-up Calls

The core differentiator of WakeupBuddy is the **Synchronized Wake-Up Call Protocol**:

1. **Simultaneous Ringing**: When the alarm time hits, both users' devices play custom ringing audio and activate continuous vibration.
2. **First-to-Wake Dismissal**: As soon as either buddy presses **"I'm Awake"**:
   - The dismissing user's alarm audio stops immediately.
   - A real-time cloud signal is pushed to the other buddy's device, stopping their alarm audio as well.
3. **Automated Dialing**: After a 1.5-second buffer (allowing the receiving phone to silence), the app automatically dials the buddy's phone number using standard cellular telephony.
4. **Verification Window**: The system tracks the call duration. To qualify for streak preservation and leaderboard points in Buddy/Stranger modes, users must speak for **at least 60 seconds**.

---

## 3. Stranger Matching Engine

When users do not have a personal friend available at 5:30 AM, they can toggle on **Stranger Mode**:
- **Instant Matchmaking**: If another user creates an alarm for the exact same time slot, both alarms are instantly matched.
- **Background Cron Matcher**: A serverless cron runs every minute to scan all upcoming alarms scheduled 2 minutes into the future, matching remaining lone users.
- **Fallback Grace**: If no match is found before the alarm rings, the alarm automatically executes in Solo mode, ensuring the user's morning routine is never compromised.

---

## 4. Gamification & Motivation

To build long-term daily habits, WakeupBuddy incorporates behavioral psychology mechanics:

### Consecutive Daily Streaks
- Tracks daily wake-up consistency.
- Displayed prominently with a flaming badge (`🔥`) once a user achieves 7 or more consecutive days.
- Streaks reset if a user fails to wake up or misses their morning call.

### 90-Day Visual Activity Heatmap
- Displayed directly on the Home dashboard and Profile.
- Shows a GitHub-style 90-day grid where square intensity reflects daily activity and completed wake-ups.

### 17 Unlockable Achievements
Achievements are categorized into 5 tiers:
1. **Streak Milestones**: 3-day, 7-day, 14-day, 30-day, and 100-day streaks.
2. **Cumulative Volume**: 1st wakeup, 10 wakeups, 50 wakeups, 100 wakeups.
3. **Early Bird**: Waking up before scheduled alarm times.
4. **Social & Buddy**: First buddy added, 5 buddies connected, helping a buddy wake up.
5. **Special Feats**: Weekend Warrior (both Saturday & Sunday consistency), Reformed Night Owl, Consistent Week.

---

## 5. Daily and Global Leaderboards

WakeupBuddy maintains two distinct leaderboards to motivate both newcomers and veterans:

### Daily Leaderboard ("Today's Standings")
- Resets every day at **midnight IST (18:30 UTC)**.
- Ranks active users based on **Today's Wakeups** and **Today's Call Duration**.
- Gives new users a fair chance to claim #1 rank every single day.

### Global Leaderboard ("All-Time Champions")
- Cumulative points formula weighting current streaks (with multipliers up to 5x), max historical streaks, consistency ratio, and all-time wakeups.
- Badges top performers and permanent hall-of-fame status.

---

## 6. Social Discovery & Community Safety

### Social Management
- **Explore Tab**: Browse active users, send and receive friend requests.
- **My Buddies Screen**: View connected buddies, call histories, average call lengths, and comparison charts.
- **Notifications Inbox**: Accept or decline incoming buddy alarm invitations.

### Community Safety & Moderation
Because users connect via voice calls, safety is paramount:
- **1-Click User Reporting**: Users can report inappropriate behavior, spam, harassment, or no-shows directly from profiles or call logs.
- **Automated Suspension**: If an account receives more than 3 validated reports, they are restricted from social matchmaking.
- **In-App Appeals System**: Banned users can submit formal appeals explaining their situation to request account reinstatement.
