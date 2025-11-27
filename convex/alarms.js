import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAlarm = mutation({
    args: {
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id("users"),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null()),
        wake_method: v.optional(v.string()), // App sends this but schema didn't have it. I'll add it to args but it won't be stored if not in schema. Wait, I should add it to schema if needed.
        // The user didn't explicitly ask for wake_method in schema, but the app sends it.
        // I'll ignore it for storage if not in schema, or I should update schema.
        // The user said "required schema details" and listed specific columns. wake_method was NOT in the list.
        // So I will NOT store wake_method in the table, but I might accept it in args and ignore it, or just not include it in args.
        // I'll exclude it from args to be safe and strict.
    },
    handler: async (ctx, args) => {
        const alarmId = await ctx.db.insert("alarms", {
            time: args.time,
            ampm: args.ampm,
            label: args.label,
            enabled: args.enabled,
            days: args.days,
            user_id: args.user_id,
            solo_mode: args.solo_mode,
            buddy: args.buddy,
        });
        return alarmId;
    },
});

export const getAlarmsByUser = query({
    args: { user_id: v.id("users") },
    handler: async (ctx, args) => {
        const alarms = await ctx.db
            .query("alarms")
            .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
            .collect();
        return alarms;
    },
});

export const updateAlarm = mutation({
    args: {
        id: v.id("alarms"),
        time: v.string(),
        ampm: v.string(),
        label: v.string(),
        enabled: v.boolean(),
        days: v.array(v.number()),
        user_id: v.id("users"),
        solo_mode: v.boolean(),
        buddy: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        const { id, ...fields } = args;
        await ctx.db.patch(id, fields);
    },
});

export const deleteAlarm = mutation({
    args: { id: v.id("alarms") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const toggleAlarm = mutation({
    args: { id: v.id("alarms"), enabled: v.boolean() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { enabled: args.enabled });
    },
});
