# WakeupBuddy Ranking System

## Overview
The leaderboard features two distinct viewing modes: **Daily** and **Global**, each with different ranking criteria and data sources.

---

## 🌅 Daily Tab Rankings

### Primary Ranking Criteria
Users are ranked based on their **performance today**, creating engagement through short-term competition.

### Data Fields Used:
1. **Today's Wake-Up Count** (`today_wakeups`)
   - Number of times the user woke up today
   - Primary sorting criteria (higher is better)

2. **Today's Call Time** (`today_call_time`)
   - Total duration of calls made today (in seconds)
   - Secondary sorting criteria (used when wake-ups are equal)

### Ranking Logic:
```javascript
// Primary: Sort by today_wakeups (descending)
// Secondary: If equal, sort by today_call_time (descending)
sorted = entries.sort((a, b) => {
    const aWakeups = a.today_wakeups || 0;
    const bWakeups = b.today_wakeups || 0;
    
    if (aWakeups !== bWakeups) {
        return bWakeups - aWakeups; // Higher wakeups wins
    }
    
    const aCallTime = a.today_call_time || 0;
    const bCallTime = b.today_call_time || 0;
    return bCallTime - aCallTime; // Higher call time wins
});
```

### Display Format:
- **Primary Metric**: "X wakeups today"
- **Secondary Metric**: "Xh Ym call time" or "Xm call time"
- **Points Column**: Shows number of wakeups (not points)

### Example:
```
Rank | User     | Metrics                  | Wakeups
-----|----------|--------------------------|--------
  1  | Alice    | 5 wakeups today         |   5
     |          | 45m call time           |
  2  | Bob      | 4 wakeups today         |   4
     |          | 1h 20m call time        |
  3  | Charlie  | 4 wakeups today         |   4
     |          | 30m call time           |
```

---

## 🏆 Global Tab Rankings

### Primary Ranking Criteria
Users are ranked based on their **all-time cumulative performance**, creating long-term engagement.

### Data Fields Used:
1. **Total Points** (`total_points`)
   - Calculated score based on multiple factors
   - Primary sorting criteria (higher is better)

2. **Total Wake-Ups** (`total_wakeups`)
   - All-time count of wake-ups
   - Displayed for context

3. **Current Streak** (`current_streak`)
   - Current consecutive days of wake-ups
   - Displayed with flame icon if ≥7 days

4. **Max Streak** (`max_streak`)
   - Highest consecutive wake-ups achieved
   - Historical achievement

5. **Total Call Time** (`total_call_time`)
   - Cumulative call duration across all time (in seconds)
   - Displayed in human-readable format

### Ranking Logic:
```javascript
// Sort by total_points (descending)
sorted = entries.sort((a, b) => b.total_points - a.total_points);
```

### Points Calculation:
Total points are calculated from multiple components:

#### 1. Current Streak Points (40% weight)
```javascript
streakPoints = currentStreak × 10 × multiplier

Multipliers:
- 7+ days:  1.5x
- 14+ days: 2x
- 30+ days: 3x
- 60+ days: 4x
- 90+ days: 5x
```

#### 2. Max Streak Points (25% weight)
```javascript
maxStreakPoints = (maxStreak × 5) + achievementBonuses

Achievement Bonuses:
- 7 days:  +50
- 14 days: +100
- 30 days: +250
- 60 days: +500
- 90 days: +1000
```

#### 3. Consistency Points (20% weight)
```javascript
consistencyPoints = (1000 × consistencyRatio) + recentBonus

Where:
- consistencyRatio = daysActive / totalDaysSinceStart
- recentBonus = 5 points per day active in last 7 days
```

#### 4. Wake-up Points (15% weight)
```javascript
wakeupPoints = totalWakeups × 2
(capped at 3 wakeups per day for fairness)
```

### Display Format:
- **Primary Metric**: "X day streak"
- **Secondary Metric**: "Xh Ym total calls" or "Xm total calls"
- **Points Column**: Shows total points with "pts" label

### Example:
```
Rank | User    | Metrics                    | Points
-----|---------|----------------------------|--------
  1  | Alice   | 45 day streak 🔥          | 2,450
     |         | 12h 30m total calls        |
  2  | Bob     | 30 day streak 🔥          | 2,100
     |         | 8h 15m total calls         |
  3  | Charlie | 21 day streak 🔥          | 1,875
     |         | 5h 45m total calls         |
```

---

## 🔄 Data Updates

### When Rankings Update:
Rankings are recalculated when:
- User completes a wake-up (updates `today_wakeups`, `total_wakeups`)
- User completes a call (updates `today_call_time`, `total_call_time`)
- Daily reset occurs (resets `today_wakeups`, `today_call_time`)
- Streak changes (updates `current_streak`, `max_streak`)

### Update Trigger:
```javascript
// Called after any activity
await updateUserLeaderboard({ userEmail: user.email });
```

---

## 🛠️ Technical Implementation

### Database Schema
```javascript
leaderboard: defineTable({
    user_id: v.id('users'),
    
    // Global metrics
    total_points: v.number(),
    current_streak: v.number(),
    max_streak: v.number(),
    total_wakeups: v.number(),
    total_call_time: v.optional(v.number()),
    
    // Daily metrics
    today_wakeups: v.optional(v.number()),
    today_call_time: v.optional(v.number()),
    
    // Rankings
    rank: v.optional(v.number()),        // Global rank
    daily_rank: v.optional(v.number()),  // Daily rank
    
    // ... other fields
})
```

### API Endpoints

#### Get Leaderboard
```javascript
const data = useQuery(api.leaderboard.getLeaderboard, {
    limit: 50,
    period: 'daily' // or 'all' for global
});
```

#### Update User Leaderboard
```javascript
const update = useMutation(api.leaderboard.updateUserLeaderboard);
await update({ userEmail: user.email });
```

#### Migrate Call Time Data (One-time)
```javascript
const migrate = useMutation(api.leaderboard.migrateCallTimeData);
await migrate({});
```

---

## 📊 Frontend Display Logic

### Tab Selection
```javascript
const [activeTab, setActiveTab] = useState('global'); // 'global' or 'daily'
```

### Conditional Rendering
```javascript
if (activeTab === 'daily') {
    primaryMetric = `${item.today_wakeups || 0} wakeups today`;
    secondaryMetric = `${formatCallTime(item.today_call_time)} call time`;
    pointsDisplay = item.today_wakeups || 0;
} else {
    primaryMetric = `${item.current_streak} day streak`;
    secondaryMetric = `${formatCallTime(item.total_call_time)} total calls`;
    pointsDisplay = formatPoints(item.total_points);
}
```

---

## 🎯 Engagement Strategy

### Daily Tab Benefits:
- **Fresh Start**: Everyone starts at zero each day
- **Quick Wins**: Immediate feedback and competition
- **Active Users**: Rewards current activity over historical performance
- **Lower Barrier**: New users can compete immediately

### Global Tab Benefits:
- **Long-term Goals**: Encourages sustained engagement
- **Achievement Recognition**: Rewards consistency and dedication
- **Status Symbol**: Top users maintain prestigious positions
- **Fair Weighting**: Multiple metrics prevent single-strategy domination

### Combined Effect:
By offering both views, the app:
1. Keeps new users engaged (daily competition)
2. Retains veteran users (global rankings)
3. Encourages multiple behaviors (wake-ups AND calls)
4. Creates varied competition dynamics

---

## 🚀 Setup Instructions

### 1. Deploy Schema Changes
```bash
npx convex deploy
```

### 2. Run Migration (One-time)
```bash
npx convex run leaderboard:migrateCallTimeData
```

### 3. Verify Rankings
- Check Daily tab: Users should be ranked by today's activity
- Check Global tab: Users should be ranked by total points
- Confirm call times are displaying correctly

---

## 📝 Notes

- Call time is tracked in **seconds** in the database
- Display format converts to human-readable (e.g., "1h 30m")
- Rankings update in real-time via Convex reactivity
- Daily metrics reset at midnight (server time)
- The 🔥 flame icon appears for streaks ≥7 days
