import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createSessionRecord = mutation({
  args: {
    sandboxId: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    // Close existing active sessions for this user?
    const existing = await ctx.db
        .query("boss_sessions")
        .withIndex("by_user_status", q => q.eq("userId", userId).eq("status", "active"))
        .collect();
        
    for (const session of existing) {
        await ctx.db.patch(session._id, { status: "closed" });
    }

    return await ctx.db.insert("boss_sessions", {
      userId,
      sandboxId: args.sandboxId,
      language: args.language,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const getActiveSession = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("boss_sessions")
      .withIndex("by_user_status", (q) => 
        q.eq("userId", userId).eq("status", "active")
      )
      .first();
  },
});
