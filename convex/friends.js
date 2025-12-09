import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Send a friend request to another user
 */
export const sendFriendRequest = mutation({
    args: {
        senderEmail: v.string(),
        receiverId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Get sender by email
        const sender = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.senderEmail))
            .first();

        if (!sender) {
            throw new Error("Sender not found");
        }

        // Can't send friend request to yourself
        if (sender._id === args.receiverId) {
            throw new Error("Cannot send friend request to yourself");
        }

        // Get receiver
        const receiver = await ctx.db.get(args.receiverId);
        if (!receiver) {
            throw new Error("Receiver not found");
        }

        // Check if friendship already exists (in either direction)
        const allFriends = await ctx.db.query("friends").collect();
        const existingFriendship = allFriends.find(f =>
            (f.users[0] === sender._id && f.users[1] === args.receiverId) ||
            (f.users[0] === args.receiverId && f.users[1] === sender._id)
        );

        if (existingFriendship) {
            if (existingFriendship.status === 0) {
                throw new Error("Friend request already pending");
            } else if (existingFriendship.status === 1) {
                throw new Error("Already friends");
            } else if (existingFriendship.status === -1) {
                // If previously rejected, allow sending again - update the existing record
                await ctx.db.patch(existingFriendship._id, {
                    users: [sender._id, args.receiverId],
                    status: 0,
                    created_at: Date.now(),
                    friends_since: undefined,
                });
                return { status: "request_resent", friendshipId: existingFriendship._id };
            }
        }

        // Create new friend request
        const friendshipId = await ctx.db.insert("friends", {
            users: [sender._id, args.receiverId],
            status: 0, // pending
            created_at: Date.now(),
        });

        return { status: "request_sent", friendshipId };
    },
});

/**
 * Accept a friend request
 */
export const acceptFriendRequest = mutation({
    args: {
        friendshipId: v.id("friends"),
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const friendship = await ctx.db.get(args.friendshipId);
        if (!friendship) {
            throw new Error("Friend request not found");
        }

        // Only the receiver can accept
        if (friendship.users[1] !== user._id) {
            throw new Error("Not authorized to accept this request");
        }

        if (friendship.status !== 0) {
            throw new Error("Request is not pending");
        }

        await ctx.db.patch(args.friendshipId, {
            status: 1,
            friends_since: Date.now(),
        });

        // Award buddy achievements for both users
        const senderId = friendship.users[0];
        const receiverId = friendship.users[1];

        // Count friends for both users and award achievements
        for (const userId of [senderId, receiverId]) {
            const allFriends = await ctx.db.query("friends").collect();
            const friendCount = allFriends.filter(f =>
                f.status === 1 && f.users.includes(userId)
            ).length;

            const buddyThresholds = [
                { type: "first_buddy", threshold: 1, name: "First Buddy", description: "Connected with your first wake buddy", icon: "people-outline" },
                { type: "buddy_5", threshold: 5, name: "Social Butterfly", description: "Connected with 5 wake buddies", icon: "people" },
            ];

            for (const { type, threshold, name, description, icon } of buddyThresholds) {
                if (friendCount >= threshold) {
                    const existing = await ctx.db
                        .query("achievements")
                        .withIndex("by_user_type", (q) =>
                            q.eq("user_id", userId).eq("achievement_type", type)
                        )
                        .first();

                    if (!existing) {
                        await ctx.db.insert("achievements", {
                            user_id: userId,
                            achievement_type: type,
                            achievement_name: name,
                            description: description,
                            icon: icon,
                            earned_at: Date.now(),
                            metadata: { buddy_count: friendCount },
                        });
                    }
                }
            }
        }

        return { status: "accepted" };
    },
});

/**
 * Reject a friend request
 */
export const rejectFriendRequest = mutation({
    args: {
        friendshipId: v.id("friends"),
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const friendship = await ctx.db.get(args.friendshipId);
        if (!friendship) {
            throw new Error("Friend request not found");
        }

        // Only the receiver can reject
        if (friendship.users[1] !== user._id) {
            throw new Error("Not authorized to reject this request");
        }

        if (friendship.status !== 0) {
            throw new Error("Request is not pending");
        }

        await ctx.db.patch(args.friendshipId, {
            status: -1,
        });

        return { status: "rejected" };
    },
});

/**
 * Remove a friend (unfriend)
 */
export const removeFriend = mutation({
    args: {
        friendshipId: v.id("friends"),
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        const friendship = await ctx.db.get(args.friendshipId);
        if (!friendship) {
            throw new Error("Friendship not found");
        }

        // Either user can unfriend
        if (!friendship.users.includes(user._id)) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.friendshipId);

        return { status: "removed" };
    },
});

/**
 * Get all friends for a user
 */
export const getFriends = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return [];

        const allFriends = await ctx.db.query("friends").collect();

        // Find all approved friendships involving this user
        const friendships = allFriends.filter(f =>
            f.status === 1 && f.users.includes(user._id)
        );

        // Get friend details
        const friendsWithDetails = await Promise.all(
            friendships.map(async (f) => {
                const friendId = f.users[0] === user._id ? f.users[1] : f.users[0];
                const friend = await ctx.db.get(friendId);
                return {
                    friendshipId: f._id,
                    friendsSince: f.friends_since,
                    friend: friend ? {
                        _id: friend._id,
                        name: friend.name,
                        email: friend.email,
                        username: friend.username,
                        bio: friend.bio || "",
                        streak: friend.streak || 0,
                        maxStreak: friend.maxStreak || 0,
                        profile_code: friend.profile_code || friend.email,
                    } : null,
                };
            })
        );

        return friendsWithDetails.filter(f => f.friend !== null);
    },
});

/**
 * Get pending friend requests received by the user
 */
export const getPendingRequests = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return [];

        const allFriends = await ctx.db.query("friends").collect();

        // Find pending requests where user is the receiver
        const pendingRequests = allFriends.filter(f =>
            f.status === 0 && f.users[1] === user._id
        );

        // Get sender details
        const requestsWithDetails = await Promise.all(
            pendingRequests.map(async (f) => {
                const sender = await ctx.db.get(f.users[0]);
                return {
                    friendshipId: f._id,
                    createdAt: f.created_at,
                    sender: sender ? {
                        _id: sender._id,
                        name: sender.name,
                        email: sender.email,
                        username: sender.username,
                        bio: sender.bio || "",
                        streak: sender.streak || 0,
                        profile_code: sender.profile_code || sender.email,
                    } : null,
                };
            })
        );

        return requestsWithDetails.filter(r => r.sender !== null);
    },
});

/**
 * Get sent friend requests (pending)
 */
export const getSentRequests = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return [];

        const allFriends = await ctx.db.query("friends").collect();

        // Find pending requests where user is the sender
        const sentRequests = allFriends.filter(f =>
            f.status === 0 && f.users[0] === user._id
        );

        // Get receiver details
        const requestsWithDetails = await Promise.all(
            sentRequests.map(async (f) => {
                const receiver = await ctx.db.get(f.users[1]);
                return {
                    friendshipId: f._id,
                    createdAt: f.created_at,
                    receiver: receiver ? {
                        _id: receiver._id,
                        name: receiver.name,
                        email: receiver.email,
                        username: receiver.username,
                        bio: receiver.bio || "",
                        profile_code: receiver.profile_code || receiver.email,
                    } : null,
                };
            })
        );

        return requestsWithDetails.filter(r => r.receiver !== null);
    },
});

/**
 * Get friendship status between two users
 */
export const getFriendshipStatus = query({
    args: {
        userEmail: v.string(),
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return { status: "none" };

        const allFriends = await ctx.db.query("friends").collect();

        const friendship = allFriends.find(f =>
            (f.users[0] === user._id && f.users[1] === args.otherUserId) ||
            (f.users[0] === args.otherUserId && f.users[1] === user._id)
        );

        if (!friendship) {
            return { status: "none" };
        }

        const isSender = friendship.users[0] === user._id;

        if (friendship.status === 0) {
            return {
                status: "pending",
                friendshipId: friendship._id,
                isSender,
            };
        } else if (friendship.status === 1) {
            return {
                status: "friends",
                friendshipId: friendship._id,
                friendsSince: friendship.friends_since,
            };
        } else {
            return {
                status: "rejected",
                friendshipId: friendship._id,
                isSender,
            };
        }
    },
});

/**
 * Get friend count for a user
 */
export const getFriendCount = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return 0;

        const allFriends = await ctx.db.query("friends").collect();

        return allFriends.filter(f =>
            f.status === 1 && f.users.includes(user._id)
        ).length;
    },
});

/**
 * Get all friend requests received by the user (including accepted/rejected for history)
 */
export const getAllReceivedRequests = query({
    args: {
        userEmail: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.userEmail))
            .first();

        if (!user) return [];

        const allFriends = await ctx.db.query("friends").collect();

        // Find ALL requests where user is the receiver (pending, accepted, or rejected)
        const receivedRequests = allFriends.filter(f => f.users[1] === user._id);

        // Get sender details
        const requestsWithDetails = await Promise.all(
            receivedRequests.map(async (f) => {
                const sender = await ctx.db.get(f.users[0]);
                return {
                    friendshipId: f._id,
                    createdAt: f.created_at,
                    status: f.status, // 0 = pending, 1 = accepted, -1 = rejected
                    friendsSince: f.friends_since,
                    sender: sender ? {
                        _id: sender._id,
                        name: sender.name,
                        email: sender.email,
                        username: sender.username,
                        bio: sender.bio || "",
                        streak: sender.streak || 0,
                        profile_code: sender.profile_code || sender.email,
                    } : null,
                };
            })
        );

        return requestsWithDetails.filter(r => r.sender !== null);
    },
});
