import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Helper for the action to read DB
export const getGuideInternal = internalQuery({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("guides")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
    },
});

// Internal Mutation: Save the generated guide
export const saveGuide = internalMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.string(),
    duration: v.string(),
  },
  handler: async (ctx, args) => {
    // Check exist again to prevent race conditions
    const existing = await ctx.db
        .query("guides")
        .withIndex("by_slug", (q) => q.eq("slug", args.slug))
        .first();
    
    if (!existing) {
        return await ctx.db.insert("guides", args);
    }
    return existing._id;
  },
});

export const updateGuide = internalMutation({
  args: {
    id: v.id("guides"),
    content: v.string(),
    duration: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const patch: any = { content: args.content };
    if (args.duration) patch.duration = args.duration;
    await ctx.db.patch(args.id, patch);
  },
});
