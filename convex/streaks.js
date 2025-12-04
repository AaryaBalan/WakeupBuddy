import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * ============================================================
 * LEADERBOARD POINTS CALCULATION (Called after streak updates)
 * ============================================================
 */
const POINTS = {
    STREAK_BASE: 10,
    STREAK_MULTIPLIER_7: 1.5,
    STREAK_MULTIPLIER_14: 2,
    STREAK_MULTIPLIER_30: 3,
    STREAK_MULTIPLIER_60: 4,
    STREAK_MULTIPLIER_90: 5,
    MAX_STREAK_BASE: 5,
    ACHIEVEMENT_7_DAYS: 50,
    ACHIEVEMENT_14_DAYS: 100,
    ACHIEVEMENT_30_DAYS: 250,
    ACHIEVEMENT_60_DAYS: 500,
    ACHIEVEMENT_90_DAYS: 1000,
    CONSISTENCY_MAX_BASE: 1000,
    RECENT_DAY_BONUS: 5,
    WAKEUP_BASE: 2,
    MAX_DAILY_WAKEUPS_FOR_POINTS: 3,
};

function getStreakMultiplier(streak) {
    if (streak >= 90) return POINTS.STREAK_MULTIPLIER_90;
    if (streak >= 60) return POINTS.STREAK_MULTIPLIER_60;
    if (streak >= 30) return POINTS.STREAK_MULTIPLIER_30;
    if (streak >= 14) return POINTS.STREAK_MULTIPLIER_14;
    if (streak >= 7) return POINTS.STREAK_MULTIPLIER_7;
    return 1;
}

function getMaxStreakAchievementBonus(maxStreak) {
    let bonus = 0;
    if (maxStreak >= 7) bonus += POINTS.ACHIEVEMENT_7_DAYS;
    if (maxStreak >= 14) bonus += POINTS.ACHIEVEMENT_14_DAYS;
    if (maxStreak >= 30) bonus += POINTS.ACHIEVEMENT_30_DAYS;
    if (maxStreak >= 60) bonus += POINTS.ACHIEVEMENT_60_DAYS;
    if (maxStreak >= 90) bonus += POINTS.ACHIEVEMENT_90_DAYS;
    return bonus;
}

function calculatePoints(currentStreak, maxStreak, totalWakeups, totalDaysActive, totalDaysSinceStart, recentDaysActive) {
    const streakMultiplier = getStreakMultiplier(currentStreak);
    const streakPoints = Math.round(currentStreak * POINTS.STREAK_BASE * streakMultiplier);

    const maxStreakBase = maxStreak * POINTS.MAX_STREAK_BASE;
    const achievementBonus = getMaxStreakAchievementBonus(maxStreak);
    const maxStreakPoints = maxStreakBase + achievementBonus;

    const consistencyRatio = totalDaysSinceStart > 0
        ? Math.min(totalDaysActive / totalDaysSinceStart, 1)
        : 0;
    const consistencyBase = Math.round(POINTS.CONSISTENCY_MAX_BASE * consistencyRatio);
    const recentBonus = recentDaysActive * POINTS.RECENT_DAY_BONUS;
    const consistencyPoints = consistencyBase + recentBonus;

    const cappedWakeups = Math.min(totalWakeups, totalDaysActive * POINTS.MAX_DAILY_WAKEUPS_FOR_POINTS);
    const wakeupPoints = cappedWakeups * POINTS.WAKEUP_BASE;

    return {
        totalPoints: streakPoints + maxStreakPoints + consistencyPoints + wakeupPoints,
        streakPoints,
        maxStreakPoints,
        consistencyPoints,
        wakeupPoints
    };
}

async function updateLeaderboardForUser(ctx, user) {
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

    // Update ranks for all users
    const allEntries = await ctx.db.query("leaderboard").collect();
    const sorted = allEntries.sort((a, b) => b.total_points - a.total_points);
    for (let i = 0; i < sorted.length; i++) {
        await ctx.db.patch(sorted[i]._id, { rank: i + 1 });
    }

    return points;
}

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

            // Update leaderboard with new wakeup count
            const leaderboardPoints = await updateLeaderboardForUser(ctx, user);

            return {
                status: 'incremented',
                wakeupCount: newCount,
                streak: user.streak || 0,
                maxStreak: user.maxStreak || 0,
                points: leaderboardPoints.totalPoints
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

        // Update leaderboard with new streak data
        const updatedUser = await ctx.db.get(user._id);
        const leaderboardPoints = await updateLeaderboardForUser(ctx, updatedUser);

        // Check and award achievements
        const awardedAchievements = [];

        // Check streak achievements
        const streakThresholds = [
            { type: "streak_3", threshold: 3 },
            { type: "streak_7", threshold: 7 },
            { type: "streak_14", threshold: 14 },
            { type: "streak_30", threshold: 30 },
            { type: "streak_100", threshold: 100 },
        ];

        for (const { type, threshold } of streakThresholds) {
            if (newStreak >= threshold) {
                const existing = await ctx.db
                    .query("achievements")
                    .withIndex("by_user_type", (q) =>
                        q.eq("user_id", user._id).eq("achievement_type", type)
                    )
                    .first();

                if (!existing) {
                    const achievementDefs = {
                        streak_3: { name: "Getting Started", description: "Maintained a 3-day wake streak", icon: "flame-outline" },
                        streak_7: { name: "7 Day Streak", description: "Maintained a 7-day wake streak", icon: "flame" },
                        streak_14: { name: "Two Week Warrior", description: "Maintained a 14-day wake streak", icon: "flame" },
                        streak_30: { name: "Monthly Master", description: "Maintained a 30-day wake streak", icon: "trophy" },
                        streak_100: { name: "Century Club", description: "Maintained a 100-day wake streak", icon: "medal" },
                    };
                    const def = achievementDefs[type];
                    await ctx.db.insert("achievements", {
                        user_id: user._id,
                        achievement_type: type,
                        achievement_name: def.name,
                        description: def.description,
                        icon: def.icon,
                        earned_at: Date.now(),
                        metadata: { streak_count: newStreak },
                    });
                    awardedAchievements.push({ type, name: def.name });
                }
            }
        }

        // Check wakeup count achievements
        const allStreaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();
        const totalWakeups = allStreaks.reduce((sum, s) => sum + s.count, 0);

        const wakeupThresholds = [
            { type: "wakeup_1", threshold: 1 },
            { type: "wakeup_10", threshold: 10 },
            { type: "wakeup_50", threshold: 50 },
            { type: "wakeup_100", threshold: 100 },
        ];

        for (const { type, threshold } of wakeupThresholds) {
            if (totalWakeups >= threshold) {
                const existing = await ctx.db
                    .query("achievements")
                    .withIndex("by_user_type", (q) =>
                        q.eq("user_id", user._id).eq("achievement_type", type)
                    )
                    .first();

                if (!existing) {
                    const achievementDefs = {
                        wakeup_1: { name: "First Wakeup", description: "Completed your first wakeup", icon: "sunny-outline" },
                        wakeup_10: { name: "Early Riser", description: "Completed 10 wakeups", icon: "sunny" },
                        wakeup_50: { name: "Morning Person", description: "Completed 50 wakeups", icon: "star" },
                        wakeup_100: { name: "Wakeup Legend", description: "Completed 100 wakeups", icon: "star" },
                    };
                    const def = achievementDefs[type];
                    await ctx.db.insert("achievements", {
                        user_id: user._id,
                        achievement_type: type,
                        achievement_name: def.name,
                        description: def.description,
                        icon: def.icon,
                        earned_at: Date.now(),
                        metadata: { wakeup_count: totalWakeups },
                    });
                    awardedAchievements.push({ type, name: def.name });
                }
            }
        }

        return {
            status: 'success',
            wakeupCount: 1,
            streak: newStreak,
            maxStreak: newMax,
            points: leaderboardPoints.totalPoints,
            newAchievements: awardedAchievements
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

/**
 * Get recent streaks by user ID (for public profiles)
 */
export const getRecentStreaksById = query({
    args: {
        userId: v.id("users"),
        days: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const numberOfDays = args.days || 90;

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - (numberOfDays - 1));

        const endDateStr = today.toISOString().split('T')[0];
        const startDateStr = startDate.toISOString().split('T')[0];

        const streaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        const filteredStreaks = streaks
            .filter(s => s.date >= startDateStr && s.date <= endDateStr)
            .map(s => ({
                date: s.date,
                count: s.count
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return filteredStreaks;
    }
});

/**
 * Get weekly wakeup stats for bar chart (last 7 days)
 */
export const getWeeklyStats = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        const today = new Date();
        const weekDays = [];
        
        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            weekDays.push({ date: dateStr, dayName, count: 0 });
        }

        // Get streak entries for this week
        const streaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        // Map counts to days
        const streakMap = new Map(streaks.map(s => [s.date, s.count]));
        weekDays.forEach(day => {
            day.count = streakMap.get(day.date) || 0;
        });

        return weekDays;
    }
});

/**
 * Get monthly wakeup stats for the last 6 months (for bar chart)
 */
export const getMonthlyStats = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return [];

        const today = new Date();
        const months = [];
        
        // Generate last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            months.push({ month: monthKey, monthName, wakeups: 0 });
        }

        // Get all streak entries
        const streaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        // Aggregate by month
        streaks.forEach(s => {
            const monthKey = s.date.substring(0, 7); // YYYY-MM
            const monthEntry = months.find(m => m.month === monthKey);
            if (monthEntry) {
                monthEntry.wakeups += s.count;
            }
        });

        return months;
    }
});

/**
 * Get profile stats summary
 */
export const getProfileStats = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return null;

        // Get all streaks
        const allStreaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        const totalWakeups = allStreaks.reduce((sum, s) => sum + s.count, 0);
        const totalDaysActive = allStreaks.length;

        // Calculate average wakeups per active day
        const avgWakeups = totalDaysActive > 0 
            ? (totalWakeups / totalDaysActive).toFixed(1) 
            : "0.0";

        // Get leaderboard entry for rank
        const leaderboardEntry = await ctx.db
            .query("leaderboard")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .unique();

        return {
            totalWakeups,
            totalDaysActive,
            avgWakeups,
            currentStreak: user.streak || 0,
            maxStreak: user.maxStreak || 0,
            rank: leaderboardEntry?.rank || '-',
            points: leaderboardEntry?.total_points || 0,
        };
    }
});

/**
 * Get chart data for different time periods (day, week, month, year)
 */
export const getChartData = query({
    args: {
        userEmail: v.string(),
        period: v.string(), // 'day', 'week', 'month', 'year'
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .unique();

        if (!user) return { labels: [], data: [], total: 0 };

        const allStreaks = await ctx.db
            .query("streaks")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        const streakMap = new Map(allStreaks.map(s => [s.date, s.count]));
        const today = new Date();
        let labels = [];
        let data = [];

        if (args.period === 'day') {
            // Last 24 hours - show hourly (we'll use daily data as proxy)
            // Since we don't track hourly, show last 7 days hourly view
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                labels.push(dayName);
                data.push(streakMap.get(dateStr) || 0);
            }
        } else if (args.period === 'week') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                labels.push(dayName);
                data.push(streakMap.get(dateStr) || 0);
            }
        } else if (args.period === 'month') {
            // Last 30 days - grouped by week
            for (let week = 3; week >= 0; week--) {
                let weekTotal = 0;
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - (week * 7 + 6));
                
                for (let day = 0; day < 7; day++) {
                    const date = new Date(weekStart);
                    date.setDate(weekStart.getDate() + day);
                    const dateStr = date.toISOString().split('T')[0];
                    weekTotal += streakMap.get(dateStr) || 0;
                }
                
                const weekLabel = `W${4 - week}`;
                labels.push(weekLabel);
                data.push(weekTotal);
            }
        } else if (args.period === 'year') {
            // Last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                
                let monthTotal = 0;
                allStreaks.forEach(s => {
                    if (s.date.startsWith(monthKey)) {
                        monthTotal += s.count;
                    }
                });
                
                labels.push(monthName);
                data.push(monthTotal);
            }
        }

        const total = data.reduce((sum, val) => sum + val, 0);
        return { labels, data, total };
    }
});

