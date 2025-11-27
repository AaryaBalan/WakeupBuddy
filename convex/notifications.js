import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createNotification = mutation({
    args: {
        alarm_time: v.string(),
        created_by: v.id("users"),
        with_whom: v.string(),
        ampm: v.string(),
        status: v.number(), // 0: pending, 1: accepted, -1: rejected
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("notifications", {
            alarm_time: args.alarm_time,
            created_by: args.created_by,
            with_whom: args.with_whom,
            time: new Date().toISOString(), // Current time for creation
            status: args.status,
            ampm: args.ampm,
        });
        return notificationId;
    },
});

export const getNotificationsByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // This is a bit tricky because 'with_whom' is just a string email in the schema provided earlier
        // and we want to join with user details for the sender.
        // However, Convex doesn't support joins in the same way SQL does.
        // We'll fetch notifications and then fetch user details for each 'created_by'.

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("with_whom", args.email))
            .collect();

        // Enrich with sender details
        const enrichedNotifications = await Promise.all(
            notifications.map(async (n) => {
                const sender = await ctx.db.get(n.created_by);
                return {
                    ...n,
                    created_by: sender, // Replace ID with full user object or just name/etc
                };
            })
        );

        return enrichedNotifications;
    },
});

export const updateNotificationStatus = mutation({
    args: { id: v.id("notifications"), status: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { status: args.status });
    }
});
