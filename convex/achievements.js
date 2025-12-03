import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
    // Streak achievements
    streak_3: {
        name: "Getting Started",
        description: "Maintained a 3-day wake streak",
        icon: "flame-outline",
        threshold: 3,
        category: "streak"
    },
    streak_7: {
        name: "7 Day Streak",
        description: "Maintained a 7-day wake streak",
        icon: "flame",
        threshold: 7,
        category: "streak"
    },
    streak_14: {
        name: "Two Week Warrior",
        description: "Maintained a 14-day wake streak",
        icon: "flame",
        threshold: 14,
        category: "streak"
    },
    streak_30: {
        name: "Monthly Master",
        description: "Maintained a 30-day wake streak",
        icon: "trophy",
        threshold: 30,
        category: "streak"
    },
    streak_100: {
        name: "Century Club",
        description: "Maintained a 100-day wake streak",
        icon: "medal",
        threshold: 100,
        category: "streak"
    },

    // Wakeup count achievements
    wakeup_1: {
        name: "First Wakeup",
        description: "Completed your first wakeup",
        icon: "sunny-outline",
        threshold: 1,
        category: "wakeup"
    },
    wakeup_10: {
        name: "Early Riser",
        description: "Completed 10 wakeups",
        icon: "sunny",
        threshold: 10,
        category: "wakeup"
    },
    wakeup_50: {
        name: "Morning Person",
        description: "Completed 50 wakeups",
        icon: "star",
        threshold: 50,
        category: "wakeup"
    },
    wakeup_100: {
        name: "Wakeup Legend",
        description: "Completed 100 wakeups",
        icon: "star",
        threshold: 100,
        category: "wakeup"
    },

    // Early bird achievements (waking up before alarm)
    early_bird: {
        name: "Early Bird",
        description: "Woke up before your alarm time",
        icon: "alarm",
        category: "early"
    },
    early_bird_5: {
        name: "Super Early Bird",
        description: "Woke up early 5 times",
        icon: "alarm",
        threshold: 5,
        category: "early"
    },

    // Buddy achievements
    first_buddy: {
        name: "First Buddy",
        description: "Connected with your first wake buddy",
        icon: "people-outline",
        threshold: 1,
        category: "buddy"
    },
    buddy_5: {
        name: "Social Butterfly",
        description: "Connected with 5 wake buddies",
        icon: "people",
        threshold: 5,
        category: "buddy"
    },
    buddy_helper: {
        name: "Buddy Helper",
        description: "Helped a buddy wake up on time",
        icon: "hand-left",
        category: "buddy"
    },

    // Special achievements
    weekend_warrior: {
        name: "Weekend Warrior",
        description: "Woke up early on both Saturday and Sunday",
        icon: "calendar",
        category: "special"
    },
    night_owl_reformed: {
        name: "Night Owl Reformed",
        description: "Changed from late wakeups to early wakeups",
        icon: "moon",
        category: "special"
    },
    consistent_week: {
        name: "Consistent Week",
        description: "Woke up at the same time for 7 days",
        icon: "time",
        category: "special"
    },
};

/**
 * Get all achievements for a user
 */
export const getUserAchievements = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        // Sort by earned_at descending (most recent first)
        return achievements.sort((a, b) => b.earned_at - a.earned_at);
    },
});

/**
 * Get achievements by user email
 */
export const getAchievementsByEmail = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return [];

        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("user_id", user._id))
            .collect();

        return achievements.sort((a, b) => b.earned_at - a.earned_at);
    },
});

/**
 * Get achievement count for a user
 */
export const getAchievementCount = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const achievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        return {
            earned: achievements.length,
            total: Object.keys(ACHIEVEMENT_DEFINITIONS).length,
        };
    },
});

/**
 * Check if user has a specific achievement
 */
export const hasAchievement = query({
    args: {
        userId: v.id("users"),
        achievementType: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("achievements")
            .withIndex("by_user_type", (q) =>
                q.eq("user_id", args.userId).eq("achievement_type", args.achievementType)
            )
            .first();

        return existing !== null;
    },
});

/**
 * Award an achievement to a user (internal use)
 */
export const awardAchievement = mutation({
    args: {
        userId: v.id("users"),
        achievementType: v.string(),
        metadata: v.optional(v.object({
            streak_count: v.optional(v.number()),
            wakeup_count: v.optional(v.number()),
            buddy_count: v.optional(v.number()),
            early_minutes: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        // Check if achievement already exists
        const existing = await ctx.db
            .query("achievements")
            .withIndex("by_user_type", (q) =>
                q.eq("user_id", args.userId).eq("achievement_type", args.achievementType)
            )
            .first();

        if (existing) {
            return { status: "already_earned", achievement: existing };
        }

        // Get achievement definition
        const definition = ACHIEVEMENT_DEFINITIONS[args.achievementType];
        if (!definition) {
            throw new Error(`Unknown achievement type: ${args.achievementType}`);
        }

        // Create the achievement
        const achievementId = await ctx.db.insert("achievements", {
            user_id: args.userId,
            achievement_type: args.achievementType,
            achievement_name: definition.name,
            description: definition.description,
            icon: definition.icon,
            earned_at: Date.now(),
            metadata: args.metadata,
        });

        return {
            status: "awarded",
            achievementId,
            achievement: {
                type: args.achievementType,
                name: definition.name,
                description: definition.description,
                icon: definition.icon,
            }
        };
    },
});

/**
 * Check and award streak achievements
 */
export const checkStreakAchievements = mutation({
    args: {
        userId: v.id("users"),
        currentStreak: v.number(),
    },
    handler: async (ctx, args) => {
        const awarded = [];

        // Check each streak threshold
        const streakThresholds = [
            { type: "streak_3", threshold: 3 },
            { type: "streak_7", threshold: 7 },
            { type: "streak_14", threshold: 14 },
            { type: "streak_30", threshold: 30 },
            { type: "streak_100", threshold: 100 },
        ];

        for (const { type, threshold } of streakThresholds) {
            if (args.currentStreak >= threshold) {
                // Check if already earned
                const existing = await ctx.db
                    .query("achievements")
                    .withIndex("by_user_type", (q) =>
                        q.eq("user_id", args.userId).eq("achievement_type", type)
                    )
                    .first();

                if (!existing) {
                    const definition = ACHIEVEMENT_DEFINITIONS[type];
                    await ctx.db.insert("achievements", {
                        user_id: args.userId,
                        achievement_type: type,
                        achievement_name: definition.name,
                        description: definition.description,
                        icon: definition.icon,
                        earned_at: Date.now(),
                        metadata: { streak_count: args.currentStreak },
                    });
                    awarded.push({ type, name: definition.name });
                }
            }
        }

        return awarded;
    },
});

/**
 * Check and award wakeup count achievements
 */
export const checkWakeupAchievements = mutation({
    args: {
        userId: v.id("users"),
        totalWakeups: v.number(),
    },
    handler: async (ctx, args) => {
        const awarded = [];

        const wakeupThresholds = [
            { type: "wakeup_1", threshold: 1 },
            { type: "wakeup_10", threshold: 10 },
            { type: "wakeup_50", threshold: 50 },
            { type: "wakeup_100", threshold: 100 },
        ];

        for (const { type, threshold } of wakeupThresholds) {
            if (args.totalWakeups >= threshold) {
                const existing = await ctx.db
                    .query("achievements")
                    .withIndex("by_user_type", (q) =>
                        q.eq("user_id", args.userId).eq("achievement_type", type)
                    )
                    .first();

                if (!existing) {
                    const definition = ACHIEVEMENT_DEFINITIONS[type];
                    await ctx.db.insert("achievements", {
                        user_id: args.userId,
                        achievement_type: type,
                        achievement_name: definition.name,
                        description: definition.description,
                        icon: definition.icon,
                        earned_at: Date.now(),
                        metadata: { wakeup_count: args.totalWakeups },
                    });
                    awarded.push({ type, name: definition.name });
                }
            }
        }

        return awarded;
    },
});

/**
 * Check and award buddy achievements
 */
export const checkBuddyAchievements = mutation({
    args: {
        userId: v.id("users"),
        buddyCount: v.number(),
    },
    handler: async (ctx, args) => {
        const awarded = [];

        const buddyThresholds = [
            { type: "first_buddy", threshold: 1 },
            { type: "buddy_5", threshold: 5 },
        ];

        for (const { type, threshold } of buddyThresholds) {
            if (args.buddyCount >= threshold) {
                const existing = await ctx.db
                    .query("achievements")
                    .withIndex("by_user_type", (q) =>
                        q.eq("user_id", args.userId).eq("achievement_type", type)
                    )
                    .first();

                if (!existing) {
                    const definition = ACHIEVEMENT_DEFINITIONS[type];
                    await ctx.db.insert("achievements", {
                        user_id: args.userId,
                        achievement_type: type,
                        achievement_name: definition.name,
                        description: definition.description,
                        icon: definition.icon,
                        earned_at: Date.now(),
                        metadata: { buddy_count: args.buddyCount },
                    });
                    awarded.push({ type, name: definition.name });
                }
            }
        }

        return awarded;
    },
});

/**
 * Award early bird achievement
 */
export const awardEarlyBird = mutation({
    args: {
        userId: v.id("users"),
        minutesEarly: v.number(),
    },
    handler: async (ctx, args) => {
        // Check if already earned basic early bird
        const existingBasic = await ctx.db
            .query("achievements")
            .withIndex("by_user_type", (q) =>
                q.eq("user_id", args.userId).eq("achievement_type", "early_bird")
            )
            .first();

        const awarded = [];

        if (!existingBasic) {
            const definition = ACHIEVEMENT_DEFINITIONS["early_bird"];
            await ctx.db.insert("achievements", {
                user_id: args.userId,
                achievement_type: "early_bird",
                achievement_name: definition.name,
                description: definition.description,
                icon: definition.icon,
                earned_at: Date.now(),
                metadata: { early_minutes: args.minutesEarly },
            });
            awarded.push({ type: "early_bird", name: definition.name });
        }

        // Count early bird instances to check for super early bird
        const earlyBirdCount = await ctx.db
            .query("achievements")
            .withIndex("by_user_type", (q) =>
                q.eq("user_id", args.userId).eq("achievement_type", "early_bird")
            )
            .collect();

        // This is a simplified check - in production, you'd track early wakeups separately
        // For now, we'll award super early bird based on a trigger

        return awarded;
    },
});

/**
 * Get all available achievements (for display purposes)
 */
export const getAllAchievementDefinitions = query({
    args: {},
    handler: async () => {
        return Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, value]) => ({
            type: key,
            ...value,
        }));
    },
});

/**
 * Get user achievements with unlocked status
 */
export const getUserAchievementsWithStatus = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userAchievements = await ctx.db
            .query("achievements")
            .withIndex("by_user", (q) => q.eq("user_id", args.userId))
            .collect();

        const earnedTypes = new Set(userAchievements.map(a => a.achievement_type));

        // Map all achievements with earned status
        const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, value]) => {
            const earned = userAchievements.find(a => a.achievement_type === key);
            return {
                type: key,
                name: value.name,
                description: value.description,
                icon: value.icon,
                category: value.category,
                threshold: value.threshold,
                earned: !!earned,
                earnedAt: earned?.earned_at || null,
                metadata: earned?.metadata || null,
            };
        });

        // Sort: earned first, then by category
        return allAchievements.sort((a, b) => {
            if (a.earned && !b.earned) return -1;
            if (!a.earned && b.earned) return 1;
            return 0;
        });
    },
});
