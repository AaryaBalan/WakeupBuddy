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
            return { status: 'already_marked', streak: existingEntry.count, maxStreak: user.maxStreak || 0 };
        }

        // Check for yesterday's streak
        const yesterdayEntry = await ctx.db
            .query("streaks")
            .withIndex("by_user_date", (q) => q.eq("user_id", user._id).eq("date", yesterday))
            .unique();

        let newStreak = 1;
        if (yesterdayEntry) {
            newStreak = yesterdayEntry.count + 1;
        }

        // Insert new streak entry
        await ctx.db.insert("streaks", {
            user_id: user._id,
            date: today,
            count: newStreak
        });

        // Update user stats
        const currentMax = user.maxStreak || 0;
        const newMax = Math.max(currentMax, newStreak);

        await ctx.db.patch(user._id, {
            streak: newStreak,
            maxStreak: newMax
        });

        return { status: 'success', streak: newStreak, maxStreak: newMax };
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
