import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        phone: v.string(),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            // You might want to return the existing user or throw an error
            // For now, let's return null to indicate it exists, or throw
            throw new Error("User already exists");
        }

        // Hash the password before storing (using sync method for Convex compatibility)
        const hashedPassword = bcrypt.hashSync(args.password, 10);

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            password: hashedPassword,
            phone: args.phone,
            username: args.email.split("@")[0], // Default username from email
            bio: args.bio || "",
        });

        return userId;
    },
});

export const loginUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            return {
                success: false,
                error: "User not found"
            };
        }

        // Compare password with hashed password (using sync method for Convex compatibility)
        const isPasswordValid = bcrypt.compareSync(args.password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                error: "Incorrect password"
            };
        }

        // Return user without password
        return {
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio || "",
                streak: user.streak || 0,
                maxStreak: user.maxStreak || 0,
                profile_code: user.profile_code || user.email,
                phone: user.phone,
            }
        };
    },
});

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        return user;
    },
});

/**
 * Get user by ID
 */
export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        // Return user without password
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio || "",
            streak: user.streak || 0,
            maxStreak: user.maxStreak || 0,
            profile_code: user.profile_code || user.email,
            phone: user.phone,
        };
    },
});

export const updateUser = mutation({
    args: {
        id: v.id("users"),
        name: v.optional(v.string()),
        bio: v.optional(v.string()),
        phone: v.optional(v.string()),
        profileImage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return await ctx.db.get(id);
    },
});

export const changePassword = mutation({
    args: {
        userId: v.id("users"),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return {
                success: false,
                error: "User not found"
            };
        }

        // Verify current password
        const isCurrentPasswordValid = bcrypt.compareSync(args.currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return {
                success: false,
                error: "Current password is incorrect"
            };
        }

        // Hash new password
        const hashedNewPassword = bcrypt.hashSync(args.newPassword, 10);

        // Update password
        await ctx.db.patch(args.userId, {
            password: hashedNewPassword
        });

        return {
            success: true,
            message: "Password changed successfully"
        };
    },
});

/**
 * Get all users for the explore screen
 * Excludes the current user and returns basic profile info
 */
export const getAllUsers = query({
    args: {
        excludeEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const users = await ctx.db.query("users").collect();

        // Filter out the current user if email provided
        const filteredUsers = args.excludeEmail
            ? users.filter(user => user.email !== args.excludeEmail)
            : users;

        // Return users with safe fields (exclude password)
        return filteredUsers.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio || "",
            streak: user.streak || 0,
            maxStreak: user.maxStreak || 0,
            profile_code: user.profile_code || user.email, // Use profile_code or default to email
        }));
    },
});

/**
 * Update user's profile_code (avatar seed)
 */
export const updateProfileCode = mutation({
    args: {
        id: v.id("users"),
        profile_code: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { profile_code: args.profile_code });
        return await ctx.db.get(args.id);
    },
});

/**
 * Report a user
 */
export const reportUser = mutation({
    args: {
        reporterEmail: v.string(),
        reportedUserId: v.id("users"),
        reason: v.string(),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Get reporter user
        const reporter = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.reporterEmail))
            .first();

        if (!reporter) {
            throw new Error("Reporter not found");
        }

        // Get reported user
        const reportedUser = await ctx.db.get(args.reportedUserId);
        if (!reportedUser) {
            throw new Error("User to report not found");
        }

        // Prevent self-reporting
        if (reporter._id === args.reportedUserId) {
            throw new Error("Cannot report yourself");
        }

        // Check if user already reported this person (optional: prevent spam reports)
        const existingReport = await ctx.db
            .query("reports")
            .withIndex("by_reporter", (q) => q.eq("reporterId", reporter._id))
            .filter((q) => q.eq(q.field("reportedUserId"), args.reportedUserId))
            .first();

        if (existingReport) {
            throw new Error("You have already reported this user");
        }

        // Create the report
        await ctx.db.insert("reports", {
            reporterId: reporter._id,
            reportedUserId: args.reportedUserId,
            reason: args.reason,
            description: args.description,
            createdAt: Date.now(),
            status: "pending",
        });

        // Increment report count on user
        const currentReportCount = reportedUser.reportCount || 0;
        await ctx.db.patch(args.reportedUserId, {
            reportCount: currentReportCount + 1,
        });

        return { success: true, message: "Report submitted successfully" };
    },
});

/**
 * Check if current user has reported another user
 */
export const hasReportedUser = query({
    args: {
        reporterEmail: v.string(),
        reportedUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const reporter = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.reporterEmail))
            .first();

        if (!reporter) return false;

        const existingReport = await ctx.db
            .query("reports")
            .withIndex("by_reporter", (q) => q.eq("reporterId", reporter._id))
            .filter((q) => q.eq(q.field("reportedUserId"), args.reportedUserId))
            .first();

        return !!existingReport;
    },
});
