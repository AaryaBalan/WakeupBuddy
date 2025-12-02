import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a call record when buddy call is initiated
export const createCall = mutation({
    args: {
        user1Email: v.string(), // Email of user who pressed "I'm awake"
        user2Email: v.string(), // Email of buddy being called
        alarmId: v.id('alarms'), // Required: foreign key to alarms table
    },
    handler: async (ctx, args) => {
        // Get user IDs from emails
        const user1 = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.user1Email))
            .unique();

        const user2 = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.user2Email))
            .unique();

        if (!user1 || !user2) {
            throw new Error("One or both users not found");
        }

        // Create call record with initial data
        const callId = await ctx.db.insert("calls", {
            users: [user1._id, user2._id],
            call_duration: 0, // Will be updated when call ends
            call_time: new Date().toISOString(),
            alarm_id: args.alarmId, // Required foreign key
        });

        return {
            callId,
            status: 'initiated',
            timestamp: new Date().toISOString()
        };
    },
});

// Update call duration (can be called when call ends)
export const updateCallDuration = mutation({
    args: {
        callId: v.id('calls'),
        duration: v.number(), // Duration in seconds
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.callId, {
            call_duration: args.duration
        });

        return {
            status: 'updated',
            duration: args.duration
        };
    },
});

// Get calls for a specific user
export const getCallsByUser = query({
    args: {
        userEmail: v.string(),
        limit: v.optional(v.number()) // Number of calls to retrieve
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        // Get all calls
        const allCalls = await ctx.db.query("calls").collect();

        // Filter calls where user is one of the participants
        const userCalls = allCalls
            .filter(call => call.users.includes(user._id))
            .sort((a, b) => new Date(b.call_time) - new Date(a.call_time));

        // Limit results if specified
        const limitedCalls = args.limit ? userCalls.slice(0, args.limit) : userCalls;

        // Enrich with user details
        const enrichedCalls = await Promise.all(
            limitedCalls.map(async (call) => {
                const otherUserId = call.users.find(id => id !== user._id);
                const otherUser = otherUserId ? await ctx.db.get(otherUserId) : null;

                return {
                    _id: call._id,
                    call_time: call.call_time,
                    call_duration: call.call_duration,
                    buddy_name: otherUser?.name || 'Unknown',
                    buddy_email: otherUser?.email || '',
                    alarm_id: call.alarm_id
                };
            })
        );

        return enrichedCalls;
    },
});

// Get call history between two specific users
export const getCallsBetweenUsers = query({
    args: {
        user1Email: v.string(),
        user2Email: v.string(),
    },
    handler: async (ctx, args) => {
        const user1 = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.user1Email))
            .unique();

        const user2 = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.user2Email))
            .unique();

        if (!user1 || !user2) return [];

        const allCalls = await ctx.db.query("calls").collect();

        // Filter calls between these two users
        const callsBetween = allCalls
            .filter(call =>
                call.users.includes(user1._id) && call.users.includes(user2._id)
            )
            .sort((a, b) => new Date(b.call_time) - new Date(a.call_time));

        return callsBetween.map(call => ({
            _id: call._id,
            call_time: call.call_time,
            call_duration: call.call_duration,
            alarm_id: call.alarm_id
        }));
    },
});
