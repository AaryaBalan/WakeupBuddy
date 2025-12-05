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
            .order("desc")
            .collect()

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
        const receiverAlarmId = await ctx.db.insert("alarms", {
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

        return {
            success: true,
            alarm_time: notification.alarm_time,
            ampm: notification.ampm,
            receiverAlarmId: receiverAlarmId  // Return the alarm ID for scheduling
        };
    }
});

/**
 * Check if a buddy relationship is accepted between two users for a specific alarm time
 * Returns true if there's an accepted notification (status = 1) with matching alarm time
 */
export const isBuddyAccepted = query({
    args: {
        userEmail: v.string(),
        buddyEmail: v.string(),
        alarmTime: v.optional(v.string()),  // e.g., "5:43"
        alarmAmpm: v.optional(v.string())   // e.g., "PM"
    },
    handler: async (ctx, args) => {
        console.log('🔍 isBuddyAccepted called with:', args);

        // Find notification where one user created and other received, with status = 1
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("with_whom", args.userEmail))
            .collect();

        console.log(`Found ${notifications.length} notifications for receiver: ${args.userEmail}`);

        // Check if any notification from buddyEmail is accepted AND matches alarm time
        for (const n of notifications) {
            console.log(`Notification: status=${n.status}, alarm_time=${n.alarm_time}, ampm=${n.ampm}`);

            // Check status AND alarm time match
            const statusMatch = n.status === 1;
            const timeMatch = !args.alarmTime || (n.alarm_time === args.alarmTime && n.ampm === args.alarmAmpm);

            if (statusMatch && timeMatch) {
                const creator = await ctx.db.get(n.created_by);
                console.log(`Creator email: ${creator?.email}`);
                if (creator && creator.email === args.buddyEmail) {
                    console.log('✅ Found accepted notification with matching alarm time (direction 1)');
                    return true;
                }
            }
        }

        // Also check reverse direction (user created, buddy received)
        const reverseNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("with_whom", args.buddyEmail))
            .collect();

        console.log(`Found ${reverseNotifications.length} reverse notifications for receiver: ${args.buddyEmail}`);

        for (const n of reverseNotifications) {
            console.log(`Reverse notification: status=${n.status}, alarm_time=${n.alarm_time}, ampm=${n.ampm}`);

            // Check status AND alarm time match
            const statusMatch = n.status === 1;
            const timeMatch = !args.alarmTime || (n.alarm_time === args.alarmTime && n.ampm === args.alarmAmpm);

            if (statusMatch && timeMatch) {
                const creator = await ctx.db.get(n.created_by);
                console.log(`Reverse creator email: ${creator?.email}`);
                if (creator && creator.email === args.userEmail) {
                    console.log('✅ Found accepted notification with matching alarm time (direction 2)');
                    return true;
                }
            }
        }

        console.log('❌ No accepted notifications found');
        return false;
    }
});

// Clear all notifications for a user (mark as read/delete processed ones)
export const clearAllNotifications = mutation({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        // Get all notifications where this user is the receiver
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_receiver", (q) => q.eq("with_whom", args.userEmail))
            .collect();

        let deletedCount = 0;

        // Delete all notifications (both pending and processed)
        for (const notification of notifications) {
            await ctx.db.delete(notification._id);
            deletedCount++;
        }

        return { deletedCount };
    }
});
