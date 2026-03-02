import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Seed data for the campaign
// In a real app, this might be a migration or admin tool.
// For now, we'll use a query to return the static structure if DB is empty, or better, 
// just serve it from code if it's static, but we defined a table. 
// Let's assume we use the table.

export const getCampaignTree = query({
  args: {},
  handler: async (ctx) => {
    // Return all nodes
    return await ctx.db.query("campaign_nodes").collect();
  },
});

export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("user_campaign_progress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!progress) {
      // Return default starter state with multiple tracks potentially?
      // For now, HTML is default.
      return {
        unlockedNodes: ["node-1-html-basics"],
        completedNodes: [] as string[],
        currentTier: "html",
        bossKeys: [] as string[],
      };
    }
    return progress;
  },
});

export const setTrack = mutation({
  args: { trackId: v.string() }, // "html", "python", "cpp"
  handler: async (ctx, args) => {
      const userId = await getAuthUserId(ctx);
      if (!userId) throw new Error("Unauthorized");
      
      let progress = await ctx.db
          .query("user_campaign_progress")
          .withIndex("by_user", q => q.eq("userId", userId))
          .unique();
      
      const startNodes: Record<string, string> = {
          "html": "node-1-html-basics",
          "python": "node-1-python-basics",
          "cpp": "node-1-cpp-basics",
          "js": "node-5-js-logic",
          "tailwindcss": "node-1-tailwind-basics"
      };
      
      const newStartNode = startNodes[args.trackId];
      if (!newStartNode) throw new Error("Invalid track");

      // Sync preferredLanguage for better UX in /learn
      const langMap: Record<string, string> = {
          "html": "HTML",
          "python": "Python",
          "cpp": "C++",
          "js": "JavaScript",
          "tailwindcss": "CSS"
      };
      if (langMap[args.trackId]) {
          await ctx.db.patch(userId, { preferredLanguage: langMap[args.trackId] });
      }

      if (!progress) {
           await ctx.db.insert("user_campaign_progress", {
              userId,
              unlockedNodes: [newStartNode],
              completedNodes: [],
              currentTier: args.trackId,
              bossKeys: []
          });
      } else {
          // Add to unlocked nodes if not present
          const newUnlocked = [...progress.unlockedNodes];
          if (!newUnlocked.includes(newStartNode)) {
              newUnlocked.push(newStartNode);
          }
          await ctx.db.patch(progress._id, {
              unlockedNodes: newUnlocked,
              currentTier: args.trackId
          });
      }
  }
});

export const internalCompleteNode = internalMutation({
  args: { nodeSlug: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get current progress
    let progress = await ctx.db
        .query("user_campaign_progress")
        .withIndex("by_user", q => q.eq("userId", args.userId))
        .unique();

    if (!progress) {
        // Initialize if missing (should exist by now usually)
        return;
    }

    if (progress.completedNodes.includes(args.nodeSlug)) {
        return; // Already completed
    }

    // Add to completed
    const newCompleted = [...progress.completedNodes, args.nodeSlug];
    
    // Logic to unlock next nodes
    const allNodes = await ctx.db.query("campaign_nodes").collect();
    
    const newlyUnlocked: string[] = [];
    
    for (const node of allNodes) {
        if (node.requires && node.requires.includes(args.nodeSlug)) {
            const allMet = node.requires.every(req => newCompleted.includes(req));
            if (allMet && !progress.unlockedNodes.includes(node.slug)) {
                newlyUnlocked.push(node.slug);
            }
        }
    }
    
    await ctx.db.patch(progress._id, {
        completedNodes: newCompleted,
        unlockedNodes: [...progress.unlockedNodes, ...newlyUnlocked]
    });
  }
});

export const completeNode = mutation({
  args: { nodeSlug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    await ctx.runMutation(internal.campaign.internalCompleteNode, { nodeSlug: args.nodeSlug, userId });
  }
});

export const seedCampaign = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if empty? We might want to update existing nodes or add new ones.
    // For now, let's delete all and re-seed to ensure consistency during dev.
    // WARNING: In prod, do UPSERT.
    const all = await ctx.db.query("campaign_nodes").collect();
    for (const node of all) {
        await ctx.db.delete(node._id);
    }

    const nodes = [
        // HTML Track
        {
            slug: "node-1-html-basics",
            title: "HTML: The Skeleton",
            type: "briefing",
            tier: "html",
            position: { x: 100, y: 300 },
            data: { 
                description: "Learn the structure of the web.",
                guideId: "html-basics"
            }
        },
        {
            slug: "node-2-function-fury",
            title: "Function Fury",
            type: "challenge",
            tier: "js",
            requires: ["node-1-html-basics"],
            position: { x: 300, y: 300 },
            data: {
                description: "Debug the faulty function.",
                gameId: "function-fury"
            }
        },
        {
            slug: "node-3-css-intro",
            title: "CSS: The Skin",
            type: "briefing",
            tier: "html", // Transition
            requires: ["node-2-function-fury"],
            position: { x: 500, y: 300 },
            data: {
                description: "Style your skeleton.",
                guideId: "css-intro"
            }
        },
        {
            slug: "node-4-boss-html",
            title: "BOSS: DOM Destroyer",
            type: "boss",
            tier: "html",
            requires: ["node-3-css-intro"],
            position: { x: 700, y: 300 },
            data: {
                description: "Fix the memory leak in the layout engine.",
                bossScenario: "memory-leak" 
            }
        },
        // JS Tier (Locked by HTML Boss)
        {
            slug: "node-5-js-logic",
            title: "JS: The Brain",
            type: "briefing",
            tier: "js",
            requires: ["node-4-boss-html"],
            position: { x: 900, y: 300 },
            data: {
                description: "Make it think.",
                guideId: "js-logic"
            }
        },

        // Python Track
        {
            slug: "node-1-python-basics",
            title: "Python: Data Snake",
            type: "briefing",
            tier: "python",
            position: { x: 100, y: 500 },
            data: { 
                description: "Learn Python fundamentals.",
                guideId: "python-basics"
            }
        },
        {
            slug: "node-2-logic-labyrinth",
            title: "Logic Labyrinth",
            type: "challenge",
            tier: "python",
            requires: ["node-1-python-basics"],
            position: { x: 300, y: 500 },
            data: {
                description: "Navigate logic gates.",
                gameId: "logic-labyrinth"
            }
        },

        // C++ Track
        {
            slug: "node-1-cpp-basics",
            title: "C++: The Machine",
            type: "briefing",
            tier: "cpp",
            position: { x: 100, y: 700 },
            data: { 
                description: "Low level power.",
                guideId: "cpp-basics"
            }
        },

        // Tailwind Track
        {
            slug: "node-1-tailwind-basics",
            title: "Tailwind: Utility First",
            type: "briefing",
            tier: "tailwindcss",
            position: { x: 100, y: 900 },
            data: { 
                description: "Style faster.",
                guideId: "tailwind-basics"
            }
        }
    ];

    for (const node of nodes) {
        // @ts-ignore
        await ctx.db.insert("campaign_nodes", node);
    }
  }
});
