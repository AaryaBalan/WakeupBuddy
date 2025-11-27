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
    }).index('by_email', ['email']),

    alarms: defineTable({
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id('users'),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null())
    }).index('by_user', ['user_id']),

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
})
