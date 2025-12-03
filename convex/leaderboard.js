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
    // Current streak
    STREAK_BASE: 10,
    STREAK_MULTIPLIER_7: 1.5,
    STREAK_MULTIPLIER_14: 2,
    STREAK_MULTIPLIER_30: 3,
    STREAK_MULTIPLIER_60: 4,
    STREAK_MULTIPLIER_90: 5,

    // Max streak achievements
    MAX_STREAK_BASE: 5,
    ACHIEVEMENT_7_DAYS: 50,
    ACHIEVEMENT_14_DAYS: 100,
    ACHIEVEMENT_30_DAYS: 250,
    ACHIEVEMENT_60_DAYS: 500,
    ACHIEVEMENT_90_DAYS: 1000,

    // Consistency
    CONSISTENCY_MAX_BASE: 1000,
    RECENT_DAY_BONUS: 5,

    // Wakeups
    WAKEUP_BASE: 2,
    MAX_DAILY_WAKEUPS_FOR_POINTS: 3,
};

/**
 * Calculate streak multiplier based on current streak length
 */
function getStreakMultiplier(streak) {
    if (streak >= 90) return POINTS.STREAK_MULTIPLIER_90;
    if (streak >= 60) return POINTS.STREAK_MULTIPLIER_60;
    if (streak >= 30) return POINTS.STREAK_MULTIPLIER_30;
    if (streak >= 14) return POINTS.STREAK_MULTIPLIER_14;
    if (streak >= 7) return POINTS.STREAK_MULTIPLIER_7;
    return 1;
}

/**
 * Calculate achievement bonuses for max streak
 */
function getMaxStreakAchievementBonus(maxStreak) {
    let bonus = 0;
    if (maxStreak >= 7) bonus += POINTS.ACHIEVEMENT_7_DAYS;
    if (maxStreak >= 14) bonus += POINTS.ACHIEVEMENT_14_DAYS;
    if (maxStreak >= 30) bonus += POINTS.ACHIEVEMENT_30_DAYS;
    if (maxStreak >= 60) bonus += POINTS.ACHIEVEMENT_60_DAYS;
    if (maxStreak >= 90) bonus += POINTS.ACHIEVEMENT_90_DAYS;
    return bonus;
}

/**
 * Calculate all points for a user
 */
function calculatePoints(currentStreak, maxStreak, totalWakeups, totalDaysActive, totalDaysSinceStart, recentDaysActive) {
    // 1. Current Streak Points (with multiplier)
    const streakMultiplier = getStreakMultiplier(currentStreak);
    const streakPoints = Math.round(currentStreak * POINTS.STREAK_BASE * streakMultiplier);

    // 2. Max Streak Points (base + achievements)
    const maxStreakBase = maxStreak * POINTS.MAX_STREAK_BASE;
    const achievementBonus = getMaxStreakAchievementBonus(maxStreak);
    const maxStreakPoints = maxStreakBase + achievementBonus;

    // 3. Consistency Points
    const consistencyRatio = totalDaysSinceStart > 0
        ? Math.min(totalDaysActive / totalDaysSinceStart, 1)
        : 0;
    const consistencyBase = Math.round(POINTS.CONSISTENCY_MAX_BASE * consistencyRatio);
    const recentBonus = recentDaysActive * POINTS.RECENT_DAY_BONUS;
    const consistencyPoints = consistencyBase + recentBonus;

    // 4. Wakeup Points (with daily cap)
    const cappedWakeups = Math.min(totalWakeups, totalDaysActive * POINTS.MAX_DAILY_WAKEUPS_FOR_POINTS);
    const wakeupPoints = cappedWakeups * POINTS.WAKEUP_BASE;

    // Total
    const totalPoints = streakPoints + maxStreakPoints + consistencyPoints + wakeupPoints;

    return {
        totalPoints,
        streakPoints,
        maxStreakPoints,
        consistencyPoints,
        wakeupPoints
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

        // Calculate total days since first activity
        let totalDaysSinceStart = 0;
        if (allStreaks.length > 0) {
            const dates = allStreaks.map(s => new Date(s.date));
            const firstDate = new Date(Math.min(...dates));
            const today = new Date();
            totalDaysSinceStart = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        }

        // Calculate recent activity (last 7 days)
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        const recentDaysActive = allStreaks.filter(s => {
            const streakDate = new Date(s.date);
            return streakDate >= sevenDaysAgo;
        }).length;

        const currentStreak = user.streak || 0;
        const maxStreak = user.maxStreak || 0;

        // Calculate points
        const points = calculatePoints(
            currentStreak,
            maxStreak,
            totalWakeups,
            totalDaysActive,
            totalDaysSinceStart,
            recentDaysActive
        );

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
            last_updated: Date.now(),
        };

        if (existingEntry) {
            await ctx.db.patch(existingEntry._id, leaderboardData);
        } else {
            await ctx.db.insert("leaderboard", leaderboardData);
        }

        // Update all ranks
        await updateAllRanks(ctx);

        return {
            ...points,
            currentStreak,
            maxStreak,
            totalWakeups,
            totalDaysActive
        };
    },
});

/**
 * Internal function to update ranks for all users
 */
async function updateAllRanks(ctx) {
    const allEntries = await ctx.db
        .query("leaderboard")
        .collect();

    // Sort by total points descending
    const sorted = allEntries.sort((a, b) => b.total_points - a.total_points);

    // Update ranks
    for (let i = 0; i < sorted.length; i++) {
        await ctx.db.patch(sorted[i]._id, { rank: i + 1 });
    }
}

/**
 * Get the full leaderboard (top users)
 */
export const getLeaderboard = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
        period: v.optional(v.string()), // 'all', 'weekly', 'monthly'
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        const offset = args.offset || 0;
        const period = args.period || 'all';

        // Get all leaderboard entries
        const entries = await ctx.db
            .query("leaderboard")
            .collect();

        // Sort by appropriate points field based on period
        let sorted;
        if (period === 'weekly') {
            sorted = entries.sort((a, b) => (b.weekly_points || 0) - (a.weekly_points || 0));
        } else if (period === 'monthly') {
            sorted = entries.sort((a, b) => (b.monthly_points || 0) - (a.monthly_points || 0));
        } else {
            sorted = entries.sort((a, b) => b.total_points - a.total_points);
        }

        // Apply pagination
        const paginated = sorted.slice(offset, offset + limit);

        // Fetch user details for each entry
        const leaderboard = await Promise.all(
            paginated.map(async (entry, index) => {
                const user = await ctx.db.get(entry.user_id);
                return {
                    _id: entry._id,
                    user_id: entry.user_id,
                    rank: offset + index + 1,
                    user: {
                        name: user?.name || "Unknown",
                        username: user?.username || "unknown",
                        email: user?.email,
                        profile_code: user?.profile_code || user?.email,
                    },
                    total_points: entry.total_points,
                    weekly_points: entry.weekly_points || 0,
                    monthly_points: entry.monthly_points || 0,
                    current_streak: entry.current_streak,
                    max_streak: entry.max_streak,
                    total_wakeups: entry.total_wakeups,
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

            let totalDaysSinceStart = 0;
            if (allStreaks.length > 0) {
                const dates = allStreaks.map(s => new Date(s.date));
                const firstDate = new Date(Math.min(...dates));
                const today = new Date();
                totalDaysSinceStart = Math.ceil((today - firstDate) / (1000 * 60 * 60 * 24)) + 1;
            }

            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);
            const recentDaysActive = allStreaks.filter(s => {
                const streakDate = new Date(s.date);
                return streakDate >= sevenDaysAgo;
            }).length;

            const currentStreak = user.streak || 0;
            const maxStreak = user.maxStreak || 0;

            const points = calculatePoints(
                currentStreak,
                maxStreak,
                totalWakeups,
                totalDaysActive,
                totalDaysSinceStart,
                recentDaysActive
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
