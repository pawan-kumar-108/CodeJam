import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Static Badge Definitions
const BADGES_META: Record<string, { title: string; icon: string }> = {
  'hello-world': { title: '"Hello World" Master', icon: 'BookOpen' },
  'streak-5': { title: '5 Day Streak', icon: 'Flame' },
  'bug-hunter': { title: 'Bug Hunter', icon: 'Bug' },
  'algo-architect': { title: 'Algo Architect', icon: 'Cpu' },
  'css-wizard': { title: 'CSS Wizard', icon: 'Palette' },
};

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    await ctx.db.patch(userId, { lastSeen: Date.now() });
  },
});

export const updateImage = mutation({
  args: { image: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    await ctx.db.patch(userId, { customAvatar: args.image });
  },
});

export const updatePreferredLanguage = mutation({
  args: { language: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { preferredLanguage: args.language });
  },
});


export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { name: args.name });
  },
});

export const getRank = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return 0;

        const user = await ctx.db.get(userId);
        if (!user || user.xp === undefined) return 0;

        const betterUsers = await ctx.db
            .query("users")
            .withIndex("by_xp", q => q.gt("xp", user.xp!))
            .filter(q => q.neq(q.field("isAnonymous"), true))
            .collect();
        
        return betterUsers.length + 1;
    }
});

export const getTopUsers = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 50;
        const users = await ctx.db
            .query("users")
            .withIndex("by_xp")
            .order("desc")
            .filter(q => q.neq(q.field("isAnonymous"), true))
            .take(limit);

        return users.map(u => ({
            _id: u._id,
            name: u.name,
            image: u.image,
            customAvatar: u.customAvatar,
            xp: u.xp || 0,
            level: u.level || 1,
        }));
    }
});

// Search for users by name/username
export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        
        if (!args.query || args.query.length < 2) return [];

        // In a real app with large data, use ctx.db.query("users").withSearchIndex(...)
        // For now, simple client-side logic on limited set or full scan if small
        // But better: use a table scan but filter.
        
        // Since Convex filter() is powerful but scan is expensive, let's limit to 20 for now 
        // OR better, we just scan "top users" or similar?
        // Let's do a table scan (okay for Hackathon scale)
        const users = await ctx.db
            .query("users")
            .filter(q => q.neq(q.field("isAnonymous"), true))
            .collect();

        // JS Filter for fuzzy match on name or email
        return users.filter(u => 
            (u.name?.toLowerCase().includes(args.query.toLowerCase()) || 
             u.email?.toLowerCase().includes(args.query.toLowerCase())) &&
             u._id !== userId // Exclude self
        ).slice(0, 5).map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email, // Needed for friend request identification? Or just use ID?
            // Privacy: maybe don't return email if ID suffices for request.
            // But sendRequest currently might expect email. Let's send ID too.
            image: u.image,
            customAvatar: u.customAvatar,
            level: u.level
        }));
    }
});

export const getRecentBadges = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const userBadges = await ctx.db
            .query("user_badges")
            .withIndex("by_user", q => q.eq("userId", userId))
            .order("desc") 
            .take(3);

        return userBadges.map(b => ({
            ...b,
            meta: BADGES_META[b.badgeId] || { title: 'Unknown Badge', icon: 'Lock' }
        }));
    }
});

export const awardBadge = mutation({
    args: { badgeId: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return;

        const existing = await ctx.db
            .query("user_badges")
            .withIndex("by_user", q => q.eq("userId", userId))
            .filter(q => q.eq(q.field("badgeId"), args.badgeId))
            .first();
        
        if (!existing) {
            await ctx.db.insert("user_badges", {
                userId,
                badgeId: args.badgeId,
                unlockedAt: Date.now()
            });
        }
    }
});
