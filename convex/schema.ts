import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
    customAvatar: v.optional(v.string()),
    plan: v.optional(v.union(v.literal("FREE"), v.literal("PRO"), v.literal("ENTERPRISE"))),
    xp: v.optional(v.number()),
    level: v.optional(v.number()),
    questsCompleted: v.optional(v.number()),
    streak: v.optional(v.number()),
    lastActiveDay: v.optional(v.string()), // YYYY-MM-DD
    lastSeen: v.optional(v.number()), // Timestamp for presence
    preferredLanguage: v.optional(v.string()),
  }).index("email", ["email"]).index("by_xp", ["xp"]), 
  
  activity_logs: defineTable({
    userId: v.id("users"),
    type: v.string(), 
    xp: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  guides: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    content: v.string(), // Markdown
    duration: v.string(),
  }).index("by_slug", ["slug"]),

  user_badges: defineTable({
    userId: v.id("users"),
    badgeId: v.string(),
    unlockedAt: v.number(),
  }).index("by_user", ["userId"]),

  guide_progress: defineTable({
    userId: v.id("users"),
    guideId: v.id("guides"),
    progress: v.number(), // 0-100
    lastAccessed: v.number(),
    completed: v.boolean(),
  }).index("by_user", ["userId"]).index("by_user_guide", ["userId", "guideId"]).index("by_user_lastAccessed", ["userId", "lastAccessed"]),

  // SOCIAL & BATTLE SYSTEM
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("active")),
    initiatedBy: v.id("users"),
  })
  .index("by_user1", ["user1"])
  .index("by_user2", ["user2"])
  .index("by_status", ["status"])
  .index("by_pair", ["user1", "user2"]), // Check if relation exists

  game_stats: defineTable({
    userId: v.id("users"),
    gameId: v.string(), // 'syntax-smasher', etc.
    bestScore: v.number(),
    gamesPlayed: v.number(),
    lastPlayed: v.number(),
  }).index("by_user_game", ["userId", "gameId"]).index("by_game", ["gameId"]),

  battles: defineTable({
    challengerId: v.id("users"),
    opponentId: v.id("users"),
    gameId: v.string(),
    mode: v.union(v.literal("live"), v.literal("ghost")),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed"), v.literal("rejected")),
    challengerScore: v.optional(v.number()),
    opponentScore: v.optional(v.number()), // Ghost score or live opponent score
    winnerId: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_user_status", ["challengerId", "status"]).index("by_opponent_status", ["opponentId", "status"]),

  notifications: defineTable({
    userId: v.id("users"), // The recipient
    type: v.union(v.literal("revenge"), v.literal("friend_request"), v.literal("battle_invite")),
    data: v.object({
        senderId: v.optional(v.id("users")),
        gameId: v.optional(v.string()),
        message: v.optional(v.string()),
        battleId: v.optional(v.id("battles")),
        amount: v.optional(v.number()), // e.g., XP gap or time difference
    }),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user_read", ["userId", "read"]).index("by_user", ["userId"]),

  boss_sessions: defineTable({
    userId: v.id("users"),
    sandboxId: v.string(),
    language: v.string(),
    status: v.union(v.literal("active"), v.literal("closed")),
    createdAt: v.number(),
  }).index("by_user_status", ["userId", "status"]),

  campaign_nodes: defineTable({
    slug: v.string(), // e.g. "node-1-html"
    title: v.string(),
    type: v.union(v.literal("briefing"), v.literal("challenge"), v.literal("boss")),
    tier: v.string(), // "html", "css", "js"
    requires: v.optional(v.array(v.string())), // slugs of parent nodes
    position: v.object({ x: v.number(), y: v.number() }), // For visual layout
    data: v.object({
        description: v.optional(v.string()),
        guideId: v.optional(v.string()), // For briefing
        gameId: v.optional(v.string()), // For challenge/boss
        bossScenario: v.optional(v.string()), // For boss (e.g. "memory-leak")
    }),
  }).index("by_tier", ["tier"]).index("by_slug", ["slug"]),

  user_campaign_progress: defineTable({
    userId: v.id("users"),
    unlockedNodes: v.array(v.string()), // slugs
    completedNodes: v.array(v.string()), // slugs
    currentTier: v.string(),
    bossKeys: v.array(v.string()), // keys earned
  }).index("by_user", ["userId"]),
});
