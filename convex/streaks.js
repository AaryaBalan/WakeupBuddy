import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const markAwake = mutation({
    args: {
        userEmail: v.string(), // User email to identify who is marking awake
        userDate: v.optional(v.string()) // YYYY-MM-DD from client
    },
    handler: async (ctx, args) => {
        // Get user by email instead of using auth context
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Use client date if provided, otherwise fallback to server UTC
        const today = args.userDate || new Date().toISOString().split('T')[0];

        // Calculate yesterday based on 'today'
        const todayDate = new Date(today);
        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // Check if already marked for today
        const existingEntry = await ctx.db
            .query("streaks")
            .withIndex("by_user_date", (q) => q.eq("user_id", user._id).eq("date", today))
            .unique();

        if (existingEntry) {
            // Increment the count for this day (multiple wakeups)
            const newCount = existingEntry.count + 1;
            await ctx.db.patch(existingEntry._id, {
                count: newCount
            });

            return {
                status: 'incremented',
                wakeupCount: newCount,
                streak: user.streak || 0,
                maxStreak: user.maxStreak || 0
            };
        }

        // First wakeup today - check for yesterday's streak
        const yesterdayEntry = await ctx.db
            .query("streaks")
            .withIndex("by_user_date", (q) => q.eq("user_id", user._id).eq("date", yesterday))
            .unique();

        let newStreak = 1;
        if (yesterdayEntry) {
            newStreak = (user.streak || 0) + 1;
        }

        // Insert new streak entry with count = 1 (first wakeup of the day)
        await ctx.db.insert("streaks", {
            user_id: user._id,
            date: today,
            count: 1  // Number of wakeups today starts at 1
        });

        // Update user stats
        const currentMax = user.maxStreak || 0;
        const newMax = Math.max(currentMax, newStreak);

        await ctx.db.patch(user._id, {
            streak: newStreak,
            maxStreak: newMax
        });

        return {
            status: 'success',
            wakeupCount: 1,
            streak: newStreak,
            maxStreak: newMax
        };
    },
});

export const getStreak = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return null;

        return {
            currentStreak: user.streak || 0,
            maxStreak: user.maxStreak || 0
        };
    }
});

export const getRecentStreaks = query({
    args: {
        userEmail: v.string(),
        days: v.optional(v.number()) // Number of days to fetch (default 10)
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        const numberOfDays = args.days || 10;

        // Calculate date range (last X days from today)
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (numberOfDays - 1));

        // Format dates as YYYY-MM-DD
        const endDateStr = today.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

        // Get all streak entries for this user in date range
        const streaks = await ctx.db
            .query("streaks")
            .withIndex("by_user_date", (q) => q.eq("user_id", user._id))
            .collect();

        // Filter by date range and map to return format
        const filteredStreaks = streaks
            .filter(s => s.date >= startDateStr && s.date <= endDateStr)
            .map(s => ({
                date: s.date,
                count: s.count
            }))
            .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date ascending

        return filteredStreaks;
    }
});
