import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getWeeklyXP = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get logs for this user
    const logs = await ctx.db
      .query("activity_logs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100); 

    const dailyXP = new Map<string, number>();
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyXP.set(key, 0);
    }

    logs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        if (dailyXP.has(date)) {
            dailyXP.set(date, (dailyXP.get(date) || 0) + log.xp);
        }
    });

    return Array.from(dailyXP.values());
  },
});

// Internal helper for other mutations
export const logActivityInternal = internalMutation({
    args: {
        userId: v.id("users"),
        type: v.string(),
        xp: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("activity_logs", {
            userId: args.userId,
            type: args.type,
            xp: args.xp,
            timestamp: Date.now(),
        });

        const user = await ctx.db.get(args.userId);
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = yesterdayDate.toISOString().split('T')[0];

            let newStreak = user.streak || 0;

            if (user.lastActiveDay === yesterday) {
                newStreak += 1;
            } else if (user.lastActiveDay !== today) {
                newStreak = 1; // Reset or Start new
            }

            await ctx.db.patch(args.userId, {
                xp: (user.xp || 0) + args.xp,
                questsCompleted: (user.questsCompleted || 0) + 1,
                level: Math.floor(((user.xp || 0) + args.xp) / 1000) + 1,
                streak: newStreak,
                lastActiveDay: today
            });
        }
    }
});

export const logActivity = mutation({
    args: {
        type: v.string(),
        xp: v.number(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthorized");
        
        // Reuse the internal logic (optional, but cleaner to just copy for now to avoid complexity or use runMutation)
        // Since we are in the same file, we can't easily call internalMutation from mutation without circular types sometimes.
        // Let's just duplicate the logic for safety and speed, or better:
        
        await ctx.db.insert("activity_logs", {
            userId,
            type: args.type,
            xp: args.xp,
            timestamp: Date.now(),
        });

        const user = await ctx.db.get(userId);
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = yesterdayDate.toISOString().split('T')[0];

            let newStreak = user.streak || 0;

            if (user.lastActiveDay === yesterday) {
                newStreak += 1;
            } else if (user.lastActiveDay !== today) {
                newStreak = 1; // Reset or Start new
            }

            await ctx.db.patch(userId, {
                xp: (user.xp || 0) + args.xp,
                questsCompleted: (user.questsCompleted || 0) + 1,
                level: Math.floor(((user.xp || 0) + args.xp) / 1000) + 1,
                streak: newStreak,
                lastActiveDay: today
            });
        }
    }
});

export const getSidebarFeed = query({
  args: {},
  handler: async (ctx) => {
    // 1. Get Real Recent Activity (Global Pulse)
    const recentActivity = await ctx.db
      .query("activity_logs")
      .order("desc")
      .take(1);
    
    let activityItem = null;
    if (recentActivity.length > 0) {
       const act = recentActivity[0];
       const user = await ctx.db.get(act.userId);
       if (user) {
          activityItem = {
             type: "event",
             badge: "Live",
             badgeColor: "bg-nav-orange",
             title: user.name || "Anonymous",
             subtitle: `${act.type} • +${act.xp} XP`
          };
       }
    }

    // 2. Get Real Content Update (Newest Guide/Node)
    const node = await ctx.db.query("campaign_nodes").first();
    const featuredNode = node || { title: "System Ready", data: { description: "Begin your journey." } };

    return [
        {
             type: "new",
             badge: "New",
             badgeColor: "bg-nav-blue",
             title: featuredNode.title,
             subtitle: featuredNode.data?.description?.substring(0, 30) + "..." || "Module available."
        },
        activityItem || {
             type: "event",
             badge: "Event",
             badgeColor: "bg-nav-lime",
             title: "Code Rush",
             subtitle: "Double XP active."
        }
    ];
  },
});
