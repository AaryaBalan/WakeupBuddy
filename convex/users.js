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

        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            password: args.password,
            phone: args.phone,
            username: args.email.split("@")[0], // Default username from email
            bio: args.bio || "",
        });

        return userId;
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
