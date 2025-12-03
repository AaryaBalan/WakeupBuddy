import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";

/**
 * Get the current day of the week index (0 = Monday, 6 = Sunday)
 * Matches the days array format in the alarm schema
 */
function getCurrentDayIndex() {
    const now = new Date();
    // JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Our schema: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    const jsDay = now.getDay();
    // Convert: Sunday (0) -> 6, Monday (1) -> 0, etc.
    return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Convert time string to minutes since midnight for comparison
 * @param {string} time - Time in "H:MM" or "HH:MM" format
 * @param {string} ampm - "AM" or "PM"
 * @returns {number} Minutes since midnight
 */
function timeToMinutes(time, ampm) {
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
        hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

/**
 * Get current time in minutes since midnight
 */
function getCurrentTimeInMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

/**
 * Internal query to find all unmatched stranger alarms for a specific time
 * NOTE: Removed day filtering to allow matching any enabled stranger alarm at that time
 */
export const findUnmatchedStrangerAlarms = internalQuery({
    args: {
        time: v.string(),
        ampm: v.string(),
        dayIndex: v.optional(v.number()), // Made optional - not used anymore
    },
    handler: async (ctx, args) => {
        // Get all alarms matching the time
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_time_ampm", (q) =>
                q.eq("time", args.time).eq("ampm", args.ampm)
            )
            .collect();

        // Filter for stranger mode alarms (solo_mode = false, buddy = null, enabled = true)
        // Removed day filtering - match any enabled stranger alarm at this time
        const unmatchedStrangerAlarms = alarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy === null &&
            alarm.enabled === true
        );

        return unmatchedStrangerAlarms;
    },
});

/**
 * Internal mutation to match two alarms together
 */
export const matchTwoAlarms = internalMutation({
    args: {
        alarm1Id: v.id("alarms"),
        alarm2Id: v.id("alarms"),
        user1Email: v.string(),
        user2Email: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Update alarm 1 with user 2's email as buddy
        await ctx.db.patch(args.alarm1Id, {
            buddy: args.user2Email,
            matched_at: now,
        });

        // Update alarm 2 with user 1's email as buddy
        await ctx.db.patch(args.alarm2Id, {
            buddy: args.user1Email,
            matched_at: now,
        });

        return {
            success: true,
            matchedAt: now,
            alarm1Id: args.alarm1Id,
            alarm2Id: args.alarm2Id,
        };
    },
});

/**
 * Internal mutation that runs the matching logic for alarms due in 2 minutes
 * This should be called by a cron job every minute
 */
export const runMatchingForUpcomingAlarms = internalMutation({
    args: {},
    handler: async (ctx) => {
        const currentMinutes = getCurrentTimeInMinutes();
        const targetMinutes = currentMinutes + 2; // 2 minutes from now
        const dayIndex = getCurrentDayIndex();

        // Handle midnight rollover
        let targetHours = Math.floor(targetMinutes / 60);
        let targetMins = targetMinutes % 60;

        if (targetHours >= 24) {
            targetHours = targetHours - 24;
            // Note: dayIndex would need to change too, but for simplicity
            // we'll handle this edge case by checking both current and next day
        }

        // Convert to 12-hour format for matching
        let ampm = targetHours >= 12 ? "PM" : "AM";
        let hours12 = targetHours % 12;
        if (hours12 === 0) hours12 = 12;

        const timeString = `${hours12}:${targetMins.toString().padStart(2, '0')}`;

        console.log(`[Matching] Checking for alarms at ${timeString} ${ampm} (day index: ${dayIndex})`);

        // Find all unmatched stranger alarms for this time
        const unmatchedAlarms = await ctx.runQuery(internal.matching.findUnmatchedStrangerAlarms, {
            time: timeString,
            ampm: ampm,
            dayIndex: dayIndex,
        });

        console.log(`[Matching] Found ${unmatchedAlarms.length} unmatched stranger alarms`);

        if (unmatchedAlarms.length < 2) {
            console.log(`[Matching] Not enough alarms to match`);
            return { matched: 0, message: "Not enough unmatched alarms" };
        }

        // Get user emails for matching
        const matchedPairs = [];
        const processedAlarmIds = new Set();

        for (let i = 0; i < unmatchedAlarms.length; i++) {
            const alarm1 = unmatchedAlarms[i];

            // Skip if already processed
            if (processedAlarmIds.has(alarm1._id)) continue;

            // Find a match (different user)
            for (let j = i + 1; j < unmatchedAlarms.length; j++) {
                const alarm2 = unmatchedAlarms[j];

                // Skip if already processed or same user
                if (processedAlarmIds.has(alarm2._id)) continue;
                if (alarm1.user_id === alarm2.user_id) continue;

                // Get user emails
                const user1 = await ctx.db.get(alarm1.user_id);
                const user2 = await ctx.db.get(alarm2.user_id);

                if (!user1 || !user2) continue;

                // Match these two alarms
                await ctx.runMutation(internal.matching.matchTwoAlarms, {
                    alarm1Id: alarm1._id,
                    alarm2Id: alarm2._id,
                    user1Email: user1.email,
                    user2Email: user2.email,
                });

                console.log(`[Matching] Matched ${user1.email} with ${user2.email} for alarm at ${timeString} ${ampm}`);

                processedAlarmIds.add(alarm1._id);
                processedAlarmIds.add(alarm2._id);

                matchedPairs.push({
                    user1: user1.email,
                    user2: user2.email,
                    time: timeString,
                    ampm: ampm,
                });

                break; // Move to next alarm1
            }
        }

        return {
            matched: matchedPairs.length,
            pairs: matchedPairs,
        };
    },
});

/**
 * Query to check if a user has any pending stranger matches
 */
export const getPendingStrangerAlarms = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        // Filter for stranger mode alarms waiting for a match
        return alarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy === null &&
            alarm.enabled === true
        );
    },
});

/**
 * Query to get recently matched stranger alarms for a user
 */
export const getRecentlyMatchedAlarms = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        // Filter for recently matched stranger alarms (matched in last hour)
        const oneHourAgo = Date.now() - 60 * 60 * 1000;

        return alarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy !== null &&
            alarm.matched_at &&
            alarm.matched_at > oneHourAgo
        );
    },
});

/**
 * Mutation to manually trigger matching (for testing or immediate matching)
 */
export const triggerMatching = mutation({
    args: {},
    handler: async (ctx) => {
        const result = await ctx.runMutation(internal.matching.runMatchingForUpcomingAlarms, {});
        return result;
    },
});

/**
 * Mutation to match ALL pending stranger alarms immediately
 * This is useful for testing or when you want immediate matching without waiting for cron
 */
export const matchAllPendingStrangerAlarms = mutation({
    args: {},
    handler: async (ctx) => {
        // Get ALL unmatched stranger alarms (not filtered by time)
        const allAlarms = await ctx.db.query("alarms").collect();

        // Filter for stranger mode alarms waiting for match
        const unmatchedAlarms = allAlarms.filter(alarm =>
            alarm.solo_mode === false &&
            alarm.buddy === null &&
            alarm.enabled === true
        );

        console.log(`[Matching] Found ${unmatchedAlarms.length} total unmatched stranger alarms`);

        if (unmatchedAlarms.length < 2) {
            return { matched: 0, message: "Not enough unmatched alarms" };
        }

        // Group by time + ampm
        const groupedByTime = {};
        for (const alarm of unmatchedAlarms) {
            const key = `${alarm.time}_${alarm.ampm}`;
            if (!groupedByTime[key]) {
                groupedByTime[key] = [];
            }
            groupedByTime[key].push(alarm);
        }

        const matchedPairs = [];

        // Match within each time group
        for (const [timeKey, alarmsInGroup] of Object.entries(groupedByTime)) {
            console.log(`[Matching] Processing ${alarmsInGroup.length} alarms for time ${timeKey}`);

            const processedIds = new Set();

            for (let i = 0; i < alarmsInGroup.length; i++) {
                const alarm1 = alarmsInGroup[i];
                if (processedIds.has(alarm1._id)) continue;

                for (let j = i + 1; j < alarmsInGroup.length; j++) {
                    const alarm2 = alarmsInGroup[j];
                    if (processedIds.has(alarm2._id)) continue;
                    if (alarm1.user_id === alarm2.user_id) continue;

                    // Get user emails
                    const user1 = await ctx.db.get(alarm1.user_id);
                    const user2 = await ctx.db.get(alarm2.user_id);

                    if (!user1 || !user2) continue;

                    // Match!
                    const now = Date.now();
                    await ctx.db.patch(alarm1._id, {
                        buddy: user2.email,
                        matched_at: now,
                    });
                    await ctx.db.patch(alarm2._id, {
                        buddy: user1.email,
                        matched_at: now,
                    });

                    console.log(`[Matching] ✅ Matched ${user1.email} with ${user2.email}`);

                    processedIds.add(alarm1._id);
                    processedIds.add(alarm2._id);

                    matchedPairs.push({
                        user1: user1.email,
                        user2: user2.email,
                        time: alarm1.time,
                        ampm: alarm1.ampm,
                    });

                    break;
                }
            }
        }

        return {
            matched: matchedPairs.length,
            pairs: matchedPairs,
        };
    },
});

/**
 * Query to get matching statistics
 */
export const getMatchingStats = query({
    args: {},
    handler: async (ctx) => {
        const allAlarms = await ctx.db.query("alarms").collect();

        const strangerModeAlarms = allAlarms.filter(a => a.solo_mode === false);
        const matchedAlarms = strangerModeAlarms.filter(a => a.buddy !== null);
        const unmatchedAlarms = strangerModeAlarms.filter(a => a.buddy === null && a.enabled);

        return {
            totalStrangerModeAlarms: strangerModeAlarms.length,
            matchedAlarms: matchedAlarms.length,
            pendingUnmatched: unmatchedAlarms.length,
        };
    },
});
