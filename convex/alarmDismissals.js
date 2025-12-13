import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Record when a user dismisses their alarm
 * This signals to the buddy that they should also stop their alarm
 */
export const recordDismissal = mutation({
    args: {
        alarmId: v.id("alarms"),
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        // Get the alarm to find the buddy
        const alarm = await ctx.db.get(args.alarmId);
        if (!alarm) {
            throw new Error("Alarm not found");
        }

        // Get the user who dismissed
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Record the dismissal
        const dismissalId = await ctx.db.insert("alarmDismissals", {
            alarm_id: args.alarmId,
            dismissed_by: user._id,
            dismissed_at: Date.now(),
            buddy_email: alarm.buddy || undefined,
        });

        console.log(`[AlarmDismissal] ${args.userEmail} dismissed alarm, signaling buddy: ${alarm.buddy}`);

        return {
            success: true,
            dismissalId,
            buddyEmail: alarm.buddy,
        };
    },
});

/**
 * Check if the current user's buddy has dismissed their alarm
 * Returns the dismissal if found, otherwise null
 */
export const checkBuddyDismissed = query({
    args: {
        userEmail: v.string(),
        alarmId: v.id("alarms"),
    },
    handler: async (ctx, args) => {
        // Get the alarm
        const alarm = await ctx.db.get(args.alarmId);
        if (!alarm || !alarm.buddy) {
            return null;
        }

        // Check if buddy has dismissed in the last 2 minutes
        const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

        const dismissals = await ctx.db
            .query("alarmDismissals")
            .withIndex("by_alarm", (q) => q.eq("alarm_id", args.alarmId))
            .filter((q) => q.gte(q.field("dismissed_at"), twoMinutesAgo))
            .collect();

        // Find a dismissal where the buddy email matches current user
        const buddyDismissal = dismissals.find(
            (d) => d.buddy_email === args.userEmail
        );

        return buddyDismissal || null;
    },
});

/**
 * Check if current user should stop their alarm based on buddy activity
 * This is polled by the AlarmScreen to automatically stop when buddy dismisses
 */
export const shouldStopAlarm = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        // Get user's active alarms
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            return { shouldStop: false };
        }

        // Check recent dismissals where user is the buddy
        const recentTime = Date.now() - 2 * 60 * 1000; // Last 2 minutes

        const dismissals = await ctx.db
            .query("alarmDismissals")
            .withIndex("by_buddy", (q) =>
                q.eq("buddy_email", args.userEmail).gte("dismissed_at", recentTime)
            )
            .collect();

        if (dismissals.length > 0) {
            const latestDismissal = dismissals.reduce((latest, current) =>
                current.dismissed_at > latest.dismissed_at ? current : latest
            );

            console.log(`[AlarmDismissal] ${args.userEmail} should stop alarm - buddy dismissed at ${new Date(latestDismissal.dismissed_at).toLocaleTimeString()}`);

            return {
                shouldStop: true,
                dismissedAt: latestDismissal.dismissed_at,
                alarmId: latestDismissal.alarm_id,
            };
        }

        return { shouldStop: false };
    },
});
