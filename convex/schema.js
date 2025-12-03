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
        maxStreak: v.optional(v.number())
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
        .index('by_alarm', ['alarm_id'])

})
