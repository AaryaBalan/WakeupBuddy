import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        password: v.string(),
        phone: v.string(),
        bio: v.optional(v.string()),
        username: v.string(),
        streak: v.optional(v.number()),
        maxStreak: v.optional(v.number()),
        profile_code: v.optional(v.string()), // Used for avatar generation, defaults to email
    }).index('by_email', ['email']),

    alarms: defineTable({
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id('users'),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null()),
        matched_at: v.optional(v.number()), // Timestamp when stranger match was made
    })
        .index('by_user', ['user_id'])
        .index('by_time_ampm', ['time', 'ampm']) // For efficient matching queries
        .index('by_stranger_mode', ['solo_mode', 'enabled']), // For finding unmatched stranger alarms

    notifications: defineTable({
        alarm_time: v.string(),
        created_by: v.id('users'),
        with_whom: v.string(),
        time: v.string(),
        status: v.number(),
        ampm: v.string(),
    })
        .index('by_creator', ['created_by'])
        .index('by_receiver', ['with_whom']),

    streaks: defineTable({
        user_id: v.id('users'),
        date: v.string(),
        count: v.number()
    })
        .index('by_user', ['user_id'])
        .index('by_user_date', ['user_id', 'date']),

    calls: defineTable({
        users: v.array(v.id('users')), // [id of person1, id of person2]
        call_duration: v.number(),     // duration in seconds
        call_time: v.string(),         // ISO timestamp of when call occurred
        alarm_id: v.id('alarms')       // foreign key to alarms table
    })
        .index('by_user', ['users'])
        .index('by_alarm', ['alarm_id']),

    friends: defineTable({
        users: v.array(v.id('users')),  // [sender_id, receiver_id]
        status: v.number(),              // 0 = pending, 1 = approved, -1 = rejected
        created_at: v.number(),          // timestamp when request was created
        friends_since: v.optional(v.number()), // timestamp when friendship was approved
    })
        .index('by_users', ['users'])
        .index('by_status', ['status']),

    leaderboard: defineTable({
        user_id: v.id('users'),
        // Core stats
        total_points: v.number(),           // Calculated total points
        current_streak: v.number(),         // Current streak count
        max_streak: v.number(),             // Best streak ever
        total_wakeups: v.number(),          // Total times woke up
        total_days_active: v.number(),      // Number of unique days with activity
        // Point breakdown (for transparency)
        streak_points: v.number(),          // Points from current streak
        max_streak_points: v.number(),      // Points from max streak (achievement)
        consistency_points: v.number(),     // Points from daily consistency
        wakeup_points: v.number(),          // Points from total wakeups
        // Metadata
        rank: v.optional(v.number()),       // Computed rank (1 = highest)
        last_updated: v.number(),           // Timestamp of last calculation
        weekly_points: v.optional(v.number()),  // Points earned this week
        monthly_points: v.optional(v.number()), // Points earned this month
    })
        .index('by_user', ['user_id'])
        .index('by_points', ['total_points'])
        .index('by_rank', ['rank'])

})
