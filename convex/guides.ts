import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { OpenRouter } from "@openrouter/sdk";

// Public Query: Get the user's current active guide
export const getActiveGuide = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("guide_progress")
      .withIndex("by_user_lastAccessed", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!progress) return null;

    const guide = await ctx.db.get(progress.guideId);
    if (!guide) return null;

    return {
      ...guide,
      progress: progress.progress,
      completed: progress.completed,
    };
  },
});

export const startGuide = mutation({
  args: { guideId: v.id("guides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("guide_progress")
      .withIndex("by_user_guide", (q) => q.eq("userId", userId).eq("guideId", args.guideId))
      .first();

    if (!existing) {
      await ctx.db.insert("guide_progress", {
        userId,
        guideId: args.guideId,
        progress: 0,
        lastAccessed: Date.now(),
        completed: false,
      });
    } else {
      await ctx.db.patch(existing._id, {
        lastAccessed: Date.now(),
      });
    }
  },
});

export const completeGuide = mutation({
  args: { guideId: v.id("guides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("guide_progress")
      .withIndex("by_user_guide", (q) => q.eq("userId", userId).eq("guideId", args.guideId))
      .first();

    if (existing) {
      if (!existing.completed) {
        await ctx.db.patch(existing._id, {
          completed: true,
          progress: 100,
          lastAccessed: Date.now(),
        });

        // Award XP
        await ctx.runMutation(internal.activity.logActivityInternal, {
          userId,
          type: "Guide Completion",
          xp: 150, // Big reward for finishing a guide
        });

        // UPDATE CAMPAIGN PROGRESS
        // Find if this guide is part of a campaign node
        const guide = await ctx.db.get(args.guideId);
        if (guide) {
          // We need to find the node that has data.guideId === guide.slug
          // Since data is an object, we can't index efficiently without schema changes.
          // We'll scan (small table).
          const allNodes = await ctx.db.query("campaign_nodes").collect();
          const node = allNodes.find(n => n.data?.guideId === guide.slug);

          if (node) {
            await ctx.runMutation(internal.campaign.internalCompleteNode, {
              userId,
              nodeSlug: node.slug
            });
          }
        }
      }
    }
  },
});

// Public Query: Check if guide exists (fast read)
export const getGuide = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guides")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getGuideProgress = query({
  args: { guideId: v.id("guides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("guide_progress")
      .withIndex("by_user_guide", (q) => q.eq("userId", userId).eq("guideId", args.guideId))
      .first();
  },
});

// Action: The Brains (Fetch or Generate)
export const getOrGenerateGuide = action({
  args: {
    slug: v.string(),
    title: v.string(),    // Context for AI if missing
    category: v.string(), // Context for AI if missing
  },
  handler: async (ctx, args): Promise<{
    _id: Id<"guides">;
    slug: string;
    title: string;
    category: string;
    content: string;
    duration: string;
  } | null> => {
    // 1. Check DB first
    const existing = await ctx.runQuery(internal.internalGuides.getGuideInternal, { slug: args.slug });
    if (existing) {
      return existing;
    }

    // 2. Create Placeholder immediately
    const guideId = await ctx.runMutation(internal.internalGuides.saveGuide, {
        slug: args.slug,
        title: args.title,
        category: args.category,
        content: "",
        duration: "Calculating...",
    });

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("No AI API Key configured (OPENROUTER_API_KEY)");
    }

    const client = new OpenRouter({
      apiKey: apiKey,
      serverURL: process.env.OPENROUTER_API_URL,
    });

    const prompt = `
      Write a comprehensive, engaging coding tutorial in Markdown format.
      Topic: "${args.title}"
      Language/Category: "${args.category}"
      Target Audience: Developer bootcamp students.

      Structure Requirements:
      1. H1 Title
      2. Introduction (Why this matters)
      3. Core Concepts (H2)
      4. Code Examples (Use markdown code blocks with language tags)
      5. "Pro Tip" blockquote
      6. Conclusion

      Tone: High-energy, professional, clear.
      Length: ~500 words.
    `;

    try {
      const stream = await client.chat.send({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: "You are an expert technical writer." },
          { role: "user", content: prompt }
        ],
        stream: true,
      });

      let fullContent = "";
      let chunkCount = 0;
      let lastUpdate = Date.now();

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        fullContent += text;
        chunkCount++;

        // Update DB frequency: Every 20 chunks OR every 1 second, whichever comes first
        // This prevents "Conflict" errors from spamming mutations
        const now = Date.now();
        if (chunkCount % 20 === 0 || (now - lastUpdate > 1000)) {
            try {
                await ctx.runMutation(internal.internalGuides.updateGuide, {
                    id: guideId,
                    content: fullContent
                });
                lastUpdate = now;
            } catch (err) {
                // Ignore transient update errors during streaming
                console.error("Stream update failed (ignoring):", err);
            }
        }
      }

      const duration = Math.ceil(fullContent.split(' ').length / 200) + " min read";

      // Final update
      await ctx.runMutation(internal.internalGuides.updateGuide, {
        id: guideId,
        content: fullContent,
        duration: duration
      });

      return {
        _id: guideId,
        slug: args.slug,
        title: args.title,
        category: args.category,
        content: fullContent,
        duration: duration
      };

    } catch (e) {
      console.error("Guide Gen Error", e);
      // Even if failed, we return what we have or null
      return null;
    }
  },
});
