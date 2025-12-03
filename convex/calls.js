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

// Get comprehensive buddy stats between two users
export const getBuddyStats = query({
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

        if (!user1 || !user2) {
            return {
                totalWakeups: 0,
                totalCallTime: 0,
                monthlyStats: [],
                dailyStats: [],
                recentCalls: [],
                longestCall: 0,
                averageCallTime: 0,
                currentStreak: 0,
                bestStreak: 0,
            };
        }

        const allCalls = await ctx.db.query("calls").collect();

        // Filter calls between these two users
        const callsBetween = allCalls
            .filter(call =>
                call.users.includes(user1._id) && call.users.includes(user2._id)
            )
            .sort((a, b) => new Date(b.call_time) - new Date(a.call_time));

        // Overall stats
        const totalWakeups = callsBetween.length;
        const totalCallTime = callsBetween.reduce((sum, call) => sum + (call.call_duration || 0), 0);
        const longestCall = Math.max(...callsBetween.map(c => c.call_duration || 0), 0);
        const averageCallTime = totalWakeups > 0 ? Math.round(totalCallTime / totalWakeups) : 0;

        // Group by month
        const monthlyMap = new Map();
        callsBetween.forEach(call => {
            const date = new Date(call.call_time);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { 
                    month: monthKey,
                    label: monthLabel,
                    wakeups: 0, 
                    callTime: 0 
                });
            }
            const entry = monthlyMap.get(monthKey);
            entry.wakeups += 1;
            entry.callTime += call.call_duration || 0;
        });
        const monthlyStats = Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month));

        // Group by day (last 30 days)
        const dailyMap = new Map();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        callsBetween
            .filter(call => new Date(call.call_time) >= thirtyDaysAgo)
            .forEach(call => {
                const date = new Date(call.call_time);
                const dayKey = date.toISOString().split('T')[0];
                const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                
                if (!dailyMap.has(dayKey)) {
                    dailyMap.set(dayKey, { 
                        date: dayKey,
                        label: dayLabel,
                        wakeups: 0, 
                        callTime: 0 
                    });
                }
                const entry = dailyMap.get(dayKey);
                entry.wakeups += 1;
                entry.callTime += call.call_duration || 0;
            });
        const dailyStats = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));

        // Calculate streak (consecutive days waking up together)
        const uniqueDates = [...new Set(callsBetween.map(c => 
            new Date(c.call_time).toISOString().split('T')[0]
        ))].sort((a, b) => b.localeCompare(a)); // Most recent first

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Check if streak is current (includes today or yesterday)
        const isStreakCurrent = uniqueDates.includes(today) || uniqueDates.includes(yesterday);
        
        for (let i = 0; i < uniqueDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prevDate = new Date(uniqueDates[i - 1]);
                const currDate = new Date(uniqueDates[i]);
                const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);
                
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    bestStreak = Math.max(bestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak);
        currentStreak = isStreakCurrent ? tempStreak : 0;

        // Recent calls (last 10)
        const recentCalls = callsBetween.slice(0, 10).map(call => ({
            _id: call._id,
            call_time: call.call_time,
            call_duration: call.call_duration,
            formattedDate: new Date(call.call_time).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }),
        }));

        return {
            totalWakeups,
            totalCallTime,
            monthlyStats,
            dailyStats,
            recentCalls,
            longestCall,
            averageCallTime,
            currentStreak,
            bestStreak,
        };
    },
});
