# 🏆 WakeupBuddy - Gamification & Social Mechanics

Gamification is the behavioral engine that drives consistency in WakeupBuddy. This document explains the exact mathematical models, streak mechanics, heatmap algorithms, and all 17 achievement badges.

---

## 1. Streak Rules & Lifecycle

### How Streaks Are Maintained
- A user must register a successful wake-up event **every calendar day** (local device date: `YYYY-MM-DD`).
- **Solo Alarm**: As soon as the user presses **"I'm Awake"**, the streak increments by `+1`.
- **Buddy / Matched Alarm**:
  - Pressing **"I'm Awake"** marks the wake-up date but **pauses** streak incrementation (`skipIncrement: true`).
  - Once the follow-up phone call finishes, the call duration is evaluated:
    - **Duration >= 60 seconds**: The streak successfully increments by `+1`.
    - **Duration < 60 seconds**: The streak does not increment, ensuring users cannot "game" the system by hanging up immediately.
- If a user misses an entire calendar day without a recorded wake-up, their `current_streak` resets to `0`, while their lifetime `max_streak` is preserved.

### The Flame Badge (`🔥`)
When a user reaches a streak of **7 or more consecutive days**, a flame icon appears alongside their name across leaderboards and profile cards.

---

## 2. 90-Day Visual Activity Heatmap

The Home screen and Profile screen feature a 90-day activity matrix (similar to GitHub contribution graphs).
- Displays 90 consecutive days up to today.
- Each block corresponds to a single day:
  - **Gray / Dim**: Inactive (no wake-up).
  - **Light Lime**: 1 wake-up completed.
  - **Medium Lime**: 2 wake-ups completed.
  - **Vibrant Lime**: 3+ wake-ups completed.
- Tapping any square shows the exact date and wake-up count.

---

## 3. Leaderboard Scoring Formulas

WakeupBuddy uses two distinct ranking models:

### A. Daily Tab Scoring
- **Purpose**: Short-term daily competition that resets every 24 hours.
- **Reset Time**: **18:30 UTC / 00:00 IST (Midnight Indian Standard Time)**.
- **Sorting Hierarchy**:
  1. Primary: **Today's Wake-Up Count** (`today_wakeups`) — higher is better.
  2. Secondary: **Today's Call Duration** (`today_call_time`) in seconds — higher duration breaks ties.
- **Formula**:
  $$\text{Daily Points} = \text{today\_wakeups} \times 97$$

### B. Global Tab Scoring
- **Purpose**: All-time cumulative prestige ranking rewarding sustained discipline over weeks and months.
- **Formula**:
  $$\text{Global Points} = (\text{max\_streak} \times 27) + (\text{total\_wakeups} \times 53)$$
- **Historical Point Weighting Distribution**:
  - Current Streak component: Rewards active consistency with progressive multipliers:
    - 7+ days: `1.5x`
    - 14+ days: `2.0x`
    - 30+ days: `3.0x`
    - 60+ days: `4.0x`
    - 90+ days: `5.0x`
  - Max Streak component: Rewards lifetime peak performance.
  - Consistency Ratio: Rewards long-term adherence percentage ($\frac{\text{days active}}{\text{total days}}$).
  - Wake-up Volume: Rewards total alarms completed (capped at 3 per day to prevent artificial inflation).

---

## 4. Complete Catalog of 17 Unlockable Achievements

| # | Achievement Key | Name | Category | Threshold / Requirement | Display Icon |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | `streak_3` | Getting Started | Streak | 3-day consecutive wake streak | `flame-outline` |
| **2** | `streak_7` | 7 Day Streak | Streak | 7-day consecutive wake streak | `flame` |
| **3** | `streak_14` | Two Week Warrior | Streak | 14-day consecutive wake streak | `flame` |
| **4** | `streak_30` | Monthly Master | Streak | 30-day consecutive wake streak | `trophy` |
| **5** | `streak_100` | Century Club | Streak | 100-day consecutive wake streak | `medal` |
| **6** | `wakeup_1` | First Wakeup | Volume | 1st completed wake-up | `sunny-outline` |
| **7** | `wakeup_10` | Early Riser | Volume | 10 completed wake-ups | `sunny` |
| **8** | `wakeup_50` | Morning Person | Volume | 50 completed wake-ups | `star` |
| **9** | `wakeup_100` | Wakeup Legend | Volume | 100 completed wake-ups | `star` |
| **10** | `early_bird` | Early Bird | Timing | Woke up before scheduled alarm | `alarm` |
| **11** | `early_bird_5` | Super Early Bird | Timing | Woke up early 5 times | `alarm` |
| **12** | `first_buddy` | First Buddy | Social | Connected with 1st wake buddy | `people-outline` |
| **13** | `buddy_5` | Social Butterfly | Social | Connected with 5 wake buddies | `people` |
| **14** | `buddy_helper` | Buddy Helper | Social | Successfully helped buddy wake up | `hand-left` |
| **15** | `weekend_warrior` | Weekend Warrior | Special | Woke up early on Sat & Sun | `calendar` |
| **16** | `night_owl_reformed` | Night Owl Reformed | Special | Transitioned to early mornings | `moon` |
| **17** | `consistent_week` | Consistent Week | Special | Woke up at exact same time 7 days | `time` |
