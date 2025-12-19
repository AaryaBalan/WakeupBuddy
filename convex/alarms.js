import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAlarm = mutation({
    args: {
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id("users"),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null()),
        wake_method: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Create the alarm
        const alarmId = await ctx.db.insert("alarms", {
            time: args.time,
            ampm: args.ampm,
            label: args.label,
            enabled: args.enabled,
            days: args.days,
            user_id: args.user_id,
            solo_mode: args.solo_mode,
            buddy: args.buddy,
            matched_at: undefined,
        });

        // If this is a stranger mode alarm (solo_mode = false, buddy = null),
        // try to match immediately with another user waiting at the same time
        if (!args.solo_mode && !args.buddy && args.enabled) {
            console.log(`[Matching] New stranger alarm created at ${args.time} ${args.ampm}, checking for matches...`);

            // Find other unmatched stranger alarms at the same time
            const potentialMatches = await ctx.db
                .query("alarms")
                .withIndex("by_time_ampm", (q) =>
                    q.eq("time", args.time).eq("ampm", args.ampm)
                )
                .collect();

            // Filter for unmatched stranger alarms from different users
            const matchableAlarm = potentialMatches.find(alarm =>
                alarm._id !== alarmId &&  // Not our own alarm
                alarm.solo_mode === false &&
                alarm.buddy === null &&
                alarm.enabled === true &&
                alarm.user_id !== args.user_id  // Different user
            );

            if (matchableAlarm) {
                // Get both users' emails
                const user1 = await ctx.db.get(args.user_id);
                const user2 = await ctx.db.get(matchableAlarm.user_id);

                if (user1 && user2) {
                    const now = Date.now();

                    // Update our new alarm with match
                    await ctx.db.patch(alarmId, {
                        buddy: user2.email,
                        matched_at: now,
                    });

                    // Update the other alarm with match
                    await ctx.db.patch(matchableAlarm._id, {
                        buddy: user1.email,
                        matched_at: now,
                    });

                    console.log(`[Matching] ✅ INSTANT MATCH! ${user1.email} matched with ${user2.email} for ${args.time} ${args.ampm}`);
                }
            } else {
                console.log(`[Matching] No match found yet for ${args.time} ${args.ampm}. Waiting for another user to join.`);
            }
        }

        return alarmId;
    },
});

export const getAlarmsByUser = query({
    args: { user_id: v.id("users") },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
            .collect();
        return alarms;
    },
});

export const updateAlarm = mutation({
    args: {
        id: v.id("alarms"),
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id("users"),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

export const deleteAlarm = mutation({
    args: { id: v.id("alarms") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

/**
 * Delete all alarms for a specific user
 */
export const deleteAllAlarms = mutation({
    args: { user_id: v.id("users") },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .filter((q) => q.eq(q.field("user_id"), args.user_id))
            .collect();

        // Delete each alarm
        for (const alarm of alarms) {
            await ctx.db.delete(alarm._id);
        }

        return { deletedCount: alarms.length };
    },
});

export const toggleAlarm = mutation({
    args: { id: v.id("alarms"), enabled: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { enabled: args.enabled });
    },
});

/**
 * Get alarm by ID - used to fetch latest alarm data when alarm triggers
 * This is important for stranger matching where buddy is set after alarm was scheduled
 */
export const getAlarmById = query({
    args: {
        alarmId: v.id("alarms"),
    },
    handler: async (ctx, args) => {
        const alarm = await ctx.db.get(args.alarmId);
        return alarm;
    },
});

/**
 * Get alarm by ID with buddy user details
 * Returns alarm data along with buddy's user info if matched
 */
export const getAlarmWithBuddyDetails = query({
    args: {
        alarmId: v.id("alarms"),
    },
    handler: async (ctx, args) => {
        const alarm = await ctx.db.get(args.alarmId);
        if (!alarm) return null;

        let buddyUser = null;
        if (alarm.buddy) {
            // buddy is stored as email string
            buddyUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", alarm.buddy))
                .unique();
        }

        return {
            alarm,
            buddyUser,
        };
    },
});

/**
 * Get all alarms for the current user (by email)
 */
export const getAlarms = query({
    args: {
        userEmail: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();
    },
});

/**
 * Get a specific alarm by time, AM/PM, and user email
 * Used for checking alarm mode (solo/buddy/stranger)
 */
export const getAlarmByTimeAndUser = query({
    args: {
        userEmail: v.string(),
        alarmTime: v.string(),
        alarmAmpm: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return { alarm: null, buddyUser: null };

        // Find alarm matching time and ampm
        const alarm = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .filter((q) =>
                q.and(
                    q.eq(q.field("time"), args.alarmTime),
                    q.eq(q.field("ampm"), args.alarmAmpm)
                )
            )
            .first();

        // Get buddy user if alarm has a buddy email
        let buddyUser = null;
        if (alarm && alarm.buddy && alarm.buddy.includes('@')) {
            buddyUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", alarm.buddy))
                .unique();
        }

        return { alarm, buddyUser };
    },
});
/**
 * Find alarm by time for a user - used when alarmId is not available
 */
export const findAlarmByTimeForUser = query({
    args: {
        userEmail: v.string(),
        time: v.string(),
        ampm: v.string(),
    },
    handler: async (ctx, args) => {
        // First, find the user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            return null;
        }

        // Get all alarms for this user
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        // Find the alarm matching the time (regardless of buddy status)
        const matchingAlarm = alarms.find(alarm =>
            alarm.time === args.time &&
            alarm.ampm === args.ampm &&
            alarm.enabled === true
        );

        if (!matchingAlarm) return null;

        // If alarm has a buddy, get buddy details
        let buddyUser = null;
        if (matchingAlarm.buddy) {
            buddyUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", matchingAlarm.buddy))
                .unique();
        }

        return {
            alarm: matchingAlarm,
            buddyUser,
        };
    },
});

/**
 * Find an alarm by user email, buddy email, time, and ampm
 * Used to look up alarmId when it's not available in the deep link
 */
export const findAlarmByDetails = query({
    args: {
        userEmail: v.string(),
        buddyEmail: v.string(),
        time: v.string(),
        ampm: v.string(),
    },
    handler: async (ctx, args) => {
        // First, find the user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            return null;
        }

        // Get all alarms for this user
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        // Find the alarm matching the criteria
        const matchingAlarm = alarms.find(alarm =>
            alarm.time === args.time &&
            alarm.ampm === args.ampm &&
            alarm.buddy === args.buddyEmail
        );

        return matchingAlarm || null;
    },
});

/**
 * Get count of users waiting to match at each time slot
 * Useful for showing "X people are waiting to match at this time"
 */
export const getStrangerMatchCounts = query({
    args: {},
    handler: async (ctx) => {
        const allAlarms = await ctx.db.query("alarms").collect();

        // Filter for stranger mode alarms waiting for match
        const waitingAlarms = allAlarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy === null &&
            alarm.enabled === true
        );

        // Group by time + ampm
        const countsByTime = {};
        for (const alarm of waitingAlarms) {
            const key = `${alarm.time} ${alarm.ampm}`;
            if (!countsByTime[key]) {
                countsByTime[key] = 0;
            }
            countsByTime[key]++;
        }

        return countsByTime;
    },
});

/**
 * Check if there are potential matches available for a given time
 */
export const checkPotentialMatches = query({
    args: {
        time: v.string(),
        ampm: v.string(),
        excludeUserId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_time_ampm", (q) =>
                q.eq("time", args.time).eq("ampm", args.ampm)
            )
            .collect();

        // Filter for stranger mode alarms waiting for match
        const waitingAlarms = alarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy === null &&
            alarm.enabled === true &&
            (args.excludeUserId ? alarm.user_id !== args.excludeUserId : true)
        );

        return {
            count: waitingAlarms.length,
            hasMatch: waitingAlarms.length >= 1, // At least 1 other person waiting
        };
    },
});
