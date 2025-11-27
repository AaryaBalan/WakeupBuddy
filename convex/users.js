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
