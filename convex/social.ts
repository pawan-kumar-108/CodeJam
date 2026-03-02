import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to enforce non-anonymous access
async function checkNotAnonymous(ctx: any, userId: any) {
    const user = await ctx.db.get(userId);
    if (!user || user.isAnonymous) {
        return false;
    }
    return true;
}

// --- FRIENDS ---


export const sendFriendRequest = mutation({
  args: { targetId: v.optional(v.id("users")), targetEmail: v.optional(v.string()) }, 
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allowed = await checkNotAnonymous(ctx, userId);
    if (!allowed) {
        return { error: "Guest users cannot access social features. Please sign up." };
    }

    let targetUser = null;

    if (args.targetId) {
        targetUser = await ctx.db.get(args.targetId);
    } else if (args.targetEmail) {
        targetUser = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", args.targetEmail!))
          .first();
    }

    if (!targetUser) return { error: "User not found" };
    if (targetUser._id === userId) return { error: "Cannot add yourself" };

    // Check if relation exists (check both directions)
    const existing1 = await ctx.db
      .query("friends")
      .withIndex("by_pair", (q) => q.eq("user1", userId).eq("user2", targetUser._id))
      .first();
    
    const existing2 = await ctx.db
      .query("friends")
      .withIndex("by_pair", (q) => q.eq("user1", targetUser._id).eq("user2", userId))
      .first();

    if (existing1 || existing2) return { error: "Request already sent or friends" };

    await ctx.db.insert("friends", {
      user1: userId,
      user2: targetUser._id,
      status: "pending",
      initiatedBy: userId,
    });
    
    return { success: true };
  },
});


export const acceptFriendRequest = mutation({
  args: { friendshipId: v.id("friends") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allowed = await checkNotAnonymous(ctx, userId);
    if (!allowed) return { error: "Guest users cannot access social features. Please sign up." };

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) return { error: "Friendship not found" };
    if (friendship.user2 !== userId) return { error: "Not authorized to accept" };

    await ctx.db.patch(args.friendshipId, { status: "active" });
    return { success: true };
  },
});

export const rejectFriendRequest = mutation({
  args: { friendshipId: v.id("friends") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allowed = await checkNotAnonymous(ctx, userId);
    if (!allowed) return { error: "Guest users cannot access social features. Please sign up." };

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) return { error: "Not found" };
    
    if (friendship.user1 !== userId && friendship.user2 !== userId) {
        return { error: "Unauthorized" };
    }

    await ctx.db.delete(args.friendshipId);
    return { success: true };
  },
});

export const getFriendsActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 1. Get all active friend IDs
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const friendIds = [
        ...friends1.map(f => f.user2),
        ...friends2.map(f => f.user1)
    ];

    if (friendIds.length === 0) return [];

    // 2. Fetch latest activity for each friend
    const activities = await Promise.all(
        friendIds.map(async (fid) => {
            const logs = await ctx.db
                .query("activity_logs")
                .withIndex("by_user", (q) => q.eq("userId", fid))
                .order("desc")
                .take(1);
            
            if (logs.length === 0) return null;
            
            const user = await ctx.db.get(fid);
            return {
                ...logs[0],
                userName: user?.name || "Unknown",
                userImage: user?.customAvatar || user?.image,
            };
        })
    );

    return activities
        .filter((a): a is NonNullable<typeof a> => a !== null)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
  }
});

export const getFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Fetch relations where user is user1 or user2
    const friends1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", userId))
      .collect();

    const friends2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", userId))
      .collect();

    const allFriendships = [...friends1, ...friends2];
    
    // Resolve user details
    const friendsWithDetails = await Promise.all(
      allFriendships.map(async (f) => {
        const otherUserId = f.user1 === userId ? f.user2 : f.user1;
        const user = await ctx.db.get(otherUserId);
        
        return {
          _id: f._id,
          friendId: otherUserId,
          name: user?.name || "Anonymous",
          image: user?.customAvatar || user?.image,
          status: f.status,
          lastSeen: user?.lastSeen,
          initiatedByMe: f.initiatedBy === userId
        };
      })
    );

    return friendsWithDetails;
  },
});

// --- BATTLES & GHOSTS ---

export const getGhostScore = query({
  args: { userId: v.id("users"), gameId: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("game_stats")
      .withIndex("by_user_game", (q) => q.eq("userId", args.userId).eq("gameId", args.gameId))
      .first();
    
    return stats ? stats.bestScore : 0;
  },
});

export const createBattle = mutation({
  args: { 
    opponentId: v.id("users"), 
    gameId: v.string(),
    mode: v.union(v.literal("live"), v.literal("ghost"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const allowed = await checkNotAnonymous(ctx, userId);
    if (!allowed) return { error: "Guest users cannot access social features. Please sign up." };

    let opponentScore = 0;

    // If Ghost Mode, lock in the opponent's best score immediately
    if (args.mode === "ghost") {
        const stats = await ctx.db
            .query("game_stats")
            .withIndex("by_user_game", (q) => q.eq("userId", args.opponentId).eq("gameId", args.gameId))
            .first();
        // If ghosts have no stats, give them a baseline score so it's not 0 (which is boring)
        opponentScore = stats?.bestScore || 50; 
    }

    const battleId = await ctx.db.insert("battles", {
        challengerId: userId,
        opponentId: args.opponentId,
        gameId: args.gameId,
        mode: args.mode,
        status: args.mode === "ghost" ? "active" : "pending", // Ghosts start immediately
        opponentScore: args.mode === "ghost" ? opponentScore : undefined,
        createdAt: Date.now(),
    });

    return { success: true, battleId };
  },
});

export const updateGameStats = mutation({
    args: { gameId: v.string(), score: v.number() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("game_stats")
            .withIndex("by_user_game", (q) => q.eq("userId", userId).eq("gameId", args.gameId))
            .first();

        if (!existing) {
            await ctx.db.insert("game_stats", {
                userId,
                gameId: args.gameId,
                bestScore: args.score,
                gamesPlayed: 1,
                lastPlayed: Date.now()
            });
        } else {
            await ctx.db.patch(existing._id, {
                bestScore: Math.max(existing.bestScore, args.score),
                gamesPlayed: existing.gamesPlayed + 1,
                lastPlayed: Date.now()
            });
        }
    }
});

export const finishBattle = mutation({
    args: { battleId: v.id("battles"), score: v.number() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const battle = await ctx.db.get(args.battleId);
        if (!battle) throw new Error("Battle not found");

        if (battle.mode === 'ghost') {
            if (battle.challengerId !== userId) throw new Error("Not your battle");
            
            const isWin = args.score > (battle.opponentScore || 0);

            await ctx.db.patch(args.battleId, {
                challengerScore: args.score,
                status: "completed",
                winnerId: isWin ? userId : battle.opponentId
            });

            // Revenge Notification Logic (Only if you won against a ghost)
            if (isWin) {
                const diff = args.score - (battle.opponentScore || 0);
                
                // Avoid spamming if notification already exists for this battle? 
                // Battle IDs are unique per session, so it's fine.
                
                await ctx.db.insert("notifications", {
                    userId: battle.opponentId, // The Ghost Owner
                    type: "revenge",
                    data: {
                        senderId: userId,
                        gameId: battle.gameId,
                        battleId: battle._id,
                        amount: diff,
                        message: `beat your score by ${diff} points!`
                    },
                    read: false,
                    createdAt: Date.now()
                });
            }
            return { success: true, win: isWin, opponentScore: battle.opponentScore || 0 };
        }
        
        return { success: true };
    }
});

export const getNotifications = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        
        // Fetch unread notifications with sender details
        const notifs = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", false))
            .order("desc")
            .collect();

        // Enhance with sender info
        return await Promise.all(notifs.map(async (n) => {
            let senderName = "System";
            let senderImage = undefined;
            if (n.data.senderId) {
                const sender = await ctx.db.get(n.data.senderId);
                if (sender) {
                    senderName = sender.name || "Anonymous";
                    senderImage = sender.image;
                }
            }
            return { ...n, senderName, senderImage };
        }));
    }
});

export const markRead = mutation({
    args: { notificationId: v.id("notifications") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        
        const n = await ctx.db.get(args.notificationId);
        if (n?.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.notificationId, { read: true });
    }
});

export const getBattle = query({
    args: { battleId: v.optional(v.string()) }, // Allow string and cast inside or undefined
    handler: async (ctx, args) => {
        if (!args.battleId) return null;
        try {
            return await ctx.db.get(args.battleId as Id<"battles">);
        } catch (e) {
            return null;
        }
    }
});
