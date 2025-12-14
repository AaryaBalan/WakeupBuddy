import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * ============================================================
 * WAKEUP BUDDY LEADERBOARD SCORING ALGORITHM
 * ============================================================
 * 
 * Points are calculated based on 4 key metrics:
 * 
 * 1. CURRENT STREAK POINTS (40% weight - rewards active engagement)
 *    - Base: 10 points per day of current streak
 *    - Bonus multiplier for longer streaks:
 *      * 7+ days: 1.5x multiplier
 *      * 14+ days: 2x multiplier  
 *      * 30+ days: 3x multiplier
 *      * 60+ days: 4x multiplier
 *      * 90+ days: 5x multiplier
 *    Formula: streak × 10 × multiplier
 * 
 * 2. MAX STREAK POINTS (25% weight - rewards achievement)
 *    - Base: 5 points per day of max streak (lifetime best)
 *    - Achievement bonuses:
 *      * First week (7 days): +50 bonus
 *      * Two weeks (14 days): +100 bonus
 *      * One month (30 days): +250 bonus
 *      * Two months (60 days): +500 bonus
 *      * Three months (90 days): +1000 bonus
 *    Formula: maxStreak × 5 + achievement_bonuses
 * 
 * 3. CONSISTENCY POINTS (20% weight - rewards regularity)
 *    - Based on activity ratio (days active / total days since first activity)
 *    - Max 1000 base points × consistency percentage
 *    - Recent activity bonus: +5 points for each of last 7 days active
 *    Formula: 1000 × (daysActive / totalDays) + recentBonus
 * 
 * 4. WAKEUP POINTS (15% weight - rewards volume)
 *    - 2 points per wakeup (daily count matters)
 *    - Diminishing returns after 3 wakeups per day (to prevent gaming)
 *    Formula: totalWakeups × 2 (capped at 3 per day contribution)
 * 
 * TOTAL = streakPoints + maxStreakPoints + consistencyPoints + wakeupPoints
 * ============================================================
 */

// Scoring constants
const POINTS = {
    MAX_STREAK_MULTIPLIER: 27,
    TOTAL_WAKEUPS_MULTIPLIER: 53,
    DAILY_WAKEUP_MULTIPLIER: 97,
};

/**
 * Calculate all points for a user
 * Global Score = Max Streak + Total Wakeups
 */
function calculatePoints(currentStreak, maxStreak, totalWakeups) {
    // Global Score = Max Streak * 5 + Total Wakeups * 3
    const totalPoints = (maxStreak * POINTS.MAX_STREAK_MULTIPLIER) + (totalWakeups * POINTS.TOTAL_WAKEUPS_MULTIPLIER);

    return {
        totalPoints,
        streakPoints: 0,
        maxStreakPoints: 0,
        consistencyPoints: 0,
        wakeupPoints: 0
    };
}

/**
 * Update or create leaderboard entry for a user
 * Should be called after any streak/wakeup activity
 */
export const updateUserLeaderboard = mutation({
    args: {
        userEmail: v.string(),
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

        // Get all streak entries for this user
        const allStreaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        // Calculate metrics
        const totalWakeups = allStreaks.reduce((sum, s) => sum + s.count, 0);
        const totalDaysActive = allStreaks.length;

        // Calculate points
        const points = calculatePoints(
            currentStreak,
            maxStreak,
            totalWakeups
        );

        // Calculate daily metrics (today's activity)
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const todayStreaks = allStreaks.filter(s => s.date === todayStr);
        const dailyPoints = todayWakeups * POINTS.DAILY_WAKEUP_MULTIPLIER; // Daily score = wakeups today * 13

        // Calculate call time metrics
        const allCalls = await ctx.db
            .query("calls")
            .collect();

        // Filter calls that include this user
        const userCalls = allCalls.filter(call => call.users.includes(user._id));

        // Total call time (all-time)
        const totalCallTime = userCalls.reduce((sum, call) => sum + (call.call_duration || 0), 0);

        // Today's call time
        const todayCallTime = userCalls
            .filter(call => {
                const callDate = new Date(call.call_time);
                const callDateStr = callDate.toISOString().split('T')[0];
                return callDateStr === todayStr;
            })
            .reduce((sum, call) => sum + (call.call_duration || 0), 0);

        // Check if leaderboard entry exists
        const existingEntry = await ctx.db
            .query("leaderboard")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .unique();

        const leaderboardData = {
            user_id: user._id,
            total_points: points.totalPoints,
            current_streak: currentStreak,
            max_streak: maxStreak,
            total_wakeups: totalWakeups,
            total_days_active: totalDaysActive,
            streak_points: points.streakPoints,
            max_streak_points: points.maxStreakPoints,
            consistency_points: points.consistencyPoints,
            wakeup_points: points.wakeupPoints,
            daily_points: dailyPoints,
            today_wakeups: todayWakeups,
            today_call_time: todayCallTime,
            total_call_time: totalCallTime,
            last_updated: Date.now(),
        };

        if (existingEntry) {
            await ctx.db.patch(existingEntry._id, leaderboardData);
        } else {
            await ctx.db.insert("leaderboard", leaderboardData);
        }

        // Update all ranks (both global and daily)
        await updateAllRanks(ctx);

        return {
            ...points,
            currentStreak,
            maxStreak,
            totalWakeups,
            totalDaysActive,
            todayWakeups,
            todayCallTime,
            totalCallTime,
        };
    },
});

/**
 * Internal function to update ranks for all users
 * Updates both global (total_points) and daily (today_wakeups + today_call_time) rankings
 */
async function updateAllRanks(ctx) {
    const allEntries = await ctx.db
        .query("leaderboard")
        .collect();

    // Sort by total points descending for global rank
    const sortedByPoints = [...allEntries].sort((a, b) => b.total_points - a.total_points);

    // Update global ranks
    for (let i = 0; i < sortedByPoints.length; i++) {
        await ctx.db.patch(sortedByPoints[i]._id, { rank: i + 1 });
    }

    // Sort by daily metrics for daily rank
    // Primary: today_wakeups (descending)
    // Secondary: today_call_time (descending)
    const sortedByDaily = [...allEntries].sort((a, b) => {
        const aWakeups = a.today_wakeups || 0;
        const bWakeups = b.today_wakeups || 0;

        if (aWakeups !== bWakeups) {
            return bWakeups - aWakeups; // Higher wakeups first
        }

        // If wakeups are equal, sort by call time
        const aCallTime = a.today_call_time || 0;
        const bCallTime = b.today_call_time || 0;
        return bCallTime - aCallTime; // Higher call time first
    });

    // Update daily ranks
    for (let i = 0; i < sortedByDaily.length; i++) {
        await ctx.db.patch(sortedByDaily[i]._id, { daily_rank: i + 1 });
    }
}

/**
 * Get the full leaderboard (top users)
 * Supports 'daily', 'all', or 'monthly' period
 * 
 * Daily Rankings (period='daily'):
 * - Primary: today_wakeups (descending)
 * - Secondary: today_call_time (descending)
 * 
 * Global Rankings (period='all'):
 * - Primary: total_points (descending)
 * - Displays: total_wakeups, current_streak, max_streak, total_call_time
 */
export const getLeaderboard = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        period: v.optional(v.string()), // 'all', 'daily', 'monthly'
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        const offset = args.offset || 0;
        const period = args.period || 'all';

        // Get all leaderboard entries
        const entries = await ctx.db
            .query("leaderboard")
            .collect();

        // Sort based on period
        let sorted;
        if (period === 'daily') {
            // Daily leaderboard: Sort by today's wakeups (primary) and today's call time (secondary)
            sorted = entries.sort((a, b) => {
                const aWakeups = a.today_wakeups || 0;
                const bWakeups = b.today_wakeups || 0;

                if (aWakeups !== bWakeups) {
                    return bWakeups - aWakeups;
                }

                const aCallTime = a.today_call_time || 0;
                const bCallTime = b.today_call_time || 0;
                return bCallTime - aCallTime;
            });
        } else if (period === 'monthly') {
            sorted = entries.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));
        } else {
            // Global leaderboard: Sort by total points
            sorted = entries.sort((a, b) => b.total_points - a.total_points);
        }

        // Apply pagination
        const paginated = sorted.slice(offset, offset + limit);

        // Fetch user details for each entry
        const leaderboard = await Promise.all(
            paginated.map(async (entry, index) => {
                const user = await ctx.db.get(entry.user_id);

                // Calculate display rank based on period
                const displayRank = offset + index + 1;

                return {
                    _id: entry._id,
                    user_id: entry.user_id,
                    rank: displayRank,
                    user: {
                        name: user?.name || "Unknown",
                        username: user?.username || "unknown",
                        email: user?.email,
                        profile_code: user?.profile_code || user?.email,
                    },
                    // Global metrics
                    total_points: entry.total_points,
                    current_streak: entry.current_streak,
                    max_streak: entry.max_streak,
                    total_wakeups: entry.total_wakeups,
                    total_call_time: entry.total_call_time || 0,
                    // Daily metrics
                    today_wakeups: entry.today_wakeups || 0,
                    today_call_time: entry.today_call_time || 0,
                    daily_points: entry.daily_points || 0,
                    monthly_points: entry.monthly_points || 0,
                    // Additional info
                    total_days_active: entry.total_days_active,
                    first_activity_date: entry.first_activity_date,
                    // Point breakdown
                    streak_points: entry.streak_points,
                    max_streak_points: entry.max_streak_points,
                    consistency_points: entry.consistency_points,
                    wakeup_points: entry.wakeup_points,
                    last_updated: entry.last_updated,
                };
            })
        );

        return leaderboard;
    },
});

/**
 * Get leaderboard filtered by friends only
 */
export const getFriendsLeaderboard = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;

        // Get current user
        const user = await ctx.db.get(args.userId);

        if (!user) return [];

        // Get approved friendships
        const friendships = await ctx.db
            .query("friends")
            .withIndex("by_status", (q) => q.eq("status", 1))
            .collect();

        // Extract friend IDs
        const friendIds = new Set();
        friendIds.add(user._id); // Include self

        friendships.forEach(f => {
            if (f.users.includes(user._id)) {
                f.users.forEach(id => friendIds.add(id));
            }
        });

        // Get leaderboard entries for friends
        const allEntries = await ctx.db.query("leaderboard").collect();
        const friendEntries = allEntries.filter(e => friendIds.has(e.user_id));

        // Sort by points
        const sorted = friendEntries.sort((a, b) => b.total_points - a.total_points);
        const limited = sorted.slice(0, limit);

        // Build response with user details
        const leaderboard = await Promise.all(
            limited.map(async (entry, index) => {
                const friendUser = await ctx.db.get(entry.user_id);
                return {
                    _id: entry._id,
                    user_id: entry.user_id,
                    rank: index + 1,
                    user: {
                        name: friendUser?.name || "Unknown",
                        username: friendUser?.username || "unknown",
                        email: friendUser?.email,
                        profile_code: friendUser?.profile_code || friendUser?.email,
                    },
                    total_points: entry.total_points,
                    current_streak: entry.current_streak,
                    max_streak: entry.max_streak,
                    total_wakeups: entry.total_wakeups,
                    total_days_active: entry.total_days_active,
                    isCurrentUser: entry.user_id === user._id,
                };
            })
        );

        return leaderboard;
    },
});

/**
 * Get a specific user's leaderboard stats and rank
 */
export const getUserLeaderboardStats = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) return null;

        const entry = await ctx.db
            .query("leaderboard")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .unique();

        if (!entry) {
            return {
                rank: null,
                total_points: 0,
                current_streak: user.streak || 0,
                max_streak: user.maxStreak || 0,
                total_wakeups: 0,
                total_days_active: 0,
                streak_points: 0,
                max_streak_points: 0,
                consistency_points: 0,
                wakeup_points: 0,
                needsUpdate: true,
            };
        }

        // Get total users count for percentile
        const totalUsers = await ctx.db.query("leaderboard").collect();
        const percentile = entry.rank
            ? Math.round((1 - (entry.rank - 1) / totalUsers.length) * 100)
            : 0;

        return {
            rank: entry.rank,
            total_points: entry.total_points,
            current_streak: entry.current_streak,
            max_streak: entry.max_streak,
            total_wakeups: entry.total_wakeups,
            total_days_active: entry.total_days_active,
            streak_points: entry.streak_points,
            max_streak_points: entry.max_streak_points,
            consistency_points: entry.consistency_points,
            wakeup_points: entry.wakeup_points,
            last_updated: entry.last_updated,
            percentile,
            totalUsersCount: totalUsers.length,
        };
    },
});

/**
 * Recalculate leaderboard for all users
 * Useful for admin/maintenance
 */
export const recalculateAllLeaderboards = mutation({
    args: {},
    handler: async (ctx) => {
        const allUsers = await ctx.db.query("users").collect();

        for (const user of allUsers) {
            // Get all streak entries for this user
            const allStreaks = await ctx.db
                .query("streaks")
                .withIndex("by_user", (q) => q.eq("user_id", user._id))
                .collect();

            const totalWakeups = allStreaks.reduce((sum, s) => sum + s.count, 0);
            const totalDaysActive = allStreaks.length;

            const currentStreak = user.streak || 0;
            const maxStreak = user.maxStreak || 0;

            const points = calculatePoints(
                currentStreak,
                maxStreak,
                totalWakeups
            );

            const existingEntry = await ctx.db
                .query("leaderboard")
                .withIndex("by_user", (q) => q.eq("user_id", user._id))
                .unique();

            const leaderboardData = {
                user_id: user._id,
                total_points: points.totalPoints,
                current_streak: currentStreak,
                max_streak: maxStreak,
                total_wakeups: totalWakeups,
                total_days_active: totalDaysActive,
                streak_points: points.streakPoints,
                max_streak_points: points.maxStreakPoints,
                consistency_points: points.consistencyPoints,
                wakeup_points: points.wakeupPoints,
                last_updated: Date.now(),
            };

            // Calculate daily metrics (today's activity)
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            const todayStreaks = allStreaks.filter(s => s.date === todayStr);
            const todayWakeups = todayStreaks.reduce((sum, s) => sum + s.count, 0);

            leaderboardData.today_wakeups = todayWakeups;
            leaderboardData.daily_points = todayWakeups * POINTS.DAILY_WAKEUP_MULTIPLIER;

            if (existingEntry) {
                await ctx.db.patch(existingEntry._id, leaderboardData);
            } else {
                await ctx.db.insert("leaderboard", leaderboardData);
            }
        }

        // Update all ranks
        await updateAllRanks(ctx);

        return { success: true, usersProcessed: allUsers.length };
    },
});

/**
 * Get leaderboard statistics
 */
export const getLeaderboardStats = query({
    args: {},
    handler: async (ctx) => {
        const allEntries = await ctx.db.query("leaderboard").collect();

        if (allEntries.length === 0) {
            return {
                totalUsers: 0,
                averagePoints: 0,
                highestPoints: 0,
                averageStreak: 0,
                highestStreak: 0,
            };
        }

        const totalPoints = allEntries.reduce((sum, e) => sum + e.total_points, 0);
        const totalStreaks = allEntries.reduce((sum, e) => sum + e.current_streak, 0);
        const highestPoints = Math.max(...allEntries.map(e => e.total_points));
        const highestStreak = Math.max(...allEntries.map(e => e.max_streak));

        return {
            totalUsers: allEntries.length,
            averagePoints: Math.round(totalPoints / allEntries.length),
            highestPoints,
            averageStreak: Math.round(totalStreaks / allEntries.length),
            highestStreak,
        };
    },
});

/**
 * Recalculate daily points for all users
 * Run this to update existing entries with daily_points
 */
export const recalculateAllDailyPoints = mutation({
    args: {},
    handler: async (ctx) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Get all leaderboard entries
        const allEntries = await ctx.db.query("leaderboard").collect();

        let updated = 0;
        for (const entry of allEntries) {
            // Get today's streaks for this user
            const todayStreaks = await ctx.db
                .query("streaks")
                .withIndex("by_user_date", (q) => q.eq("user_id", entry.user_id).eq("date", todayStr))
                .collect();

            const todayWakeups = todayStreaks.reduce((sum, s) => sum + s.count, 0);
            const dailyPoints = todayWakeups * POINTS.DAILY_WAKEUP_MULTIPLIER;

            await ctx.db.patch(entry._id, {
                daily_points: dailyPoints,
                today_wakeups: todayWakeups
            });
            updated++;
        }

        return { updated, date: todayStr };
    },
});

/**
 * Migration: Populate call time data for all existing leaderboard entries
 * Calculates total_call_time and today_call_time for all users
 */
export const migrateCallTimeData = mutation({
    args: {},
    handler: async (ctx) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        // Get all leaderboard entries
        const allEntries = await ctx.db.query("leaderboard").collect();

        // Get all calls once
        const allCalls = await ctx.db.query("calls").collect();

        let updated = 0;
        for (const entry of allEntries) {
            // Filter calls that include this user
            const userCalls = allCalls.filter(call => call.users.includes(entry.user_id));

            // Total call time (all-time)
            const totalCallTime = userCalls.reduce((sum, call) => sum + (call.call_duration || 0), 0);

            // Today's call time
            const todayCallTime = userCalls
                .filter(call => {
                    const callDate = new Date(call.call_time);
                    const callDateStr = callDate.toISOString().split('T')[0];
                    return callDateStr === todayStr;
                })
                .reduce((sum, call) => sum + (call.call_duration || 0), 0);

            // Get today's wakeups
            const todayStreaks = await ctx.db
                .query("streaks")
                .withIndex("by_user_date", (q) => q.eq("user_id", entry.user_id).eq("date", todayStr))
                .collect();
            const todayWakeups = todayStreaks.reduce((sum, s) => sum + s.count, 0);

            await ctx.db.patch(entry._id, {
                total_call_time: totalCallTime,
                today_call_time: todayCallTime,
                today_wakeups: todayWakeups,
            });

            updated++;
        }

        // Update all ranks (both global and daily)
        await updateAllRanks(ctx);

        return {
            success: true,
            updated,
            date: todayStr,
            message: `Migrated call time data for ${updated} users and updated rankings`
        };
    },
});

/**
 * Reset daily leaderboard data (runs at midnight)
 * Clears today_wakeups, today_call_time, and daily_points for all users
 */
export const resetDailyLeaderboard = mutation({
    args: {},
    handler: async (ctx) => {
        console.log('🌙 Running daily leaderboard reset at midnight...');

        // Get all leaderboard entries
        const allEntries = await ctx.db.query("leaderboard").collect();

        let resetCount = 0;
        for (const entry of allEntries) {
            await ctx.db.patch(entry._id, {
                today_wakeups: 0,
                today_call_time: 0,
                daily_points: 0,
            });
            resetCount++;
        }

        // Update all ranks after reset
        await updateAllRanks(ctx);

        const resetTime = new Date().toISOString();
        console.log(`✅ Daily leaderboard reset complete! Reset ${resetCount} entries at ${resetTime}`);

        return {
            success: true,
            resetCount,
            resetTime,
            message: `Reset daily metrics for ${resetCount} users`
        };
    },
});

