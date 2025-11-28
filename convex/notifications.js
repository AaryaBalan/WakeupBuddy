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

export const acceptBuddyRequest = mutation({
    args: {
        notificationId: v.id("notifications"),
        receiverUserId: v.id("users"),
        receiverEmail: v.string()
    },
    handler: async (ctx, args) => {
        // 1. Get notification details
        const notification = await ctx.db.get(args.notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        // 2. Update notification status to accepted (1)
        await ctx.db.patch(args.notificationId, { status: 1 });

        // 3. Get sender user details
        const sender = await ctx.db.get(notification.created_by);
        if (!sender) {
            throw new Error("Sender not found");
        }

        // 4. Create alarm for RECEIVER (User B)
        await ctx.db.insert("alarms", {
            time: notification.alarm_time,
            ampm: notification.ampm,
            label: 'Wake Buddy',
            enabled: true,
            days: [0, 0, 0, 0, 0, 0, 0],
            user_id: args.receiverUserId,
            solo_mode: false,
            buddy: sender.email  // Link to sender
        });

        // 5. Check if sender already has an alarm at this time with this buddy
        const senderAlarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", notification.created_by))
            .collect();

        const existingAlarm = senderAlarms.find(alarm =>
            alarm.time === notification.alarm_time &&
            alarm.ampm === notification.ampm &&
            alarm.buddy === args.receiverEmail
        );

        if (existingAlarm) {
            // Update existing alarm to ensure it's enabled and linked
            await ctx.db.patch(existingAlarm._id, {
                buddy: args.receiverEmail,
                solo_mode: false,
                enabled: true
            });
        } else {
            // Create new alarm for sender
            await ctx.db.insert("alarms", {
                time: notification.alarm_time,
                ampm: notification.ampm,
                label: 'Wake Buddy',
                enabled: true,
                days: [0, 0, 0, 0, 0, 0, 0],
                user_id: notification.created_by,
                solo_mode: false,
                buddy: args.receiverEmail  // Link to receiver
            });
        }

        return { success: true, alarm_time: notification.alarm_time, ampm: notification.ampm };
    }
});
