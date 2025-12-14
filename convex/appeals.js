import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit an appeal to unban account
 */
export const submitAppeal = mutation({
    args: {
        userEmail: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        // Get user
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Check if user is actually banned
        if ((user.reportCount || 0) <= 3) {
            throw new Error("User is not banned");
        }

        // Check if there's already a pending appeal
        const existingAppeal = await ctx.db
            .query("appeals")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .first();

        if (existingAppeal) {
            throw new Error("You already have a pending appeal");
        }

        // Create appeal
        const appealId = await ctx.db.insert("appeals", {
            userId: user._id,
            reason: args.reason,
            status: "pending",
            submittedAt: Date.now(),
        });

        return { success: true, appealId };
    },
});

/**
 * Get user's appeal status
 */
export const getAppealStatus = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return null;

        // Get most recent appeal
        const appeals = await ctx.db
            .query("appeals")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        if (!appeals || appeals.length === 0) return null;

        // Sort by submission date, most recent first
        appeals.sort((a, b) => b.submittedAt - a.submittedAt);

        return appeals[0];
    },
});

/**
 * Get all user's appeals (for history)
 */
export const getUserAppeals = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        const appeals = await ctx.db
            .query("appeals")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        // Sort by submission date, most recent first
        return appeals.sort((a, b) => b.submittedAt - a.submittedAt);
    },
});
