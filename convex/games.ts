import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGameStats = query({
  args: {},
  handler: async (ctx) => {
    // Collect all game stats to aggregate player counts
    // In a production app with millions of records, you'd maintain a separate counter
    // or use a scheduled job to aggregate this.
    const stats = await ctx.db.query("game_stats").collect();
    
    const playerCounts: Record<string, number> = {};
    
    for (const stat of stats) {
      if (!playerCounts[stat.gameId]) {
        playerCounts[stat.gameId] = 0;
      }
      playerCounts[stat.gameId]++;
    }
    
    return playerCounts;
  },
});

export const getGameMetadata = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    // In a real app, fetch from 'games' table.
    // For now, we serve the "Truth" from backend to ensure security and consistency.
    
    const GAME_DEFINITIONS: Record<string, any> = {
      'function-fury': {
        title: 'Function Fury',
        language: 'JavaScript',
        difficulty: 'Intermediate',
        description: 'Master higher-order functions and stubborn closures.',
        objectives: [
           { id: 'syntax', label: 'Fix Syntax Errors', type: 'collection', target: 1 },
           { id: 'streak', label: 'Maintain 3x Streak', type: 'streak', target: 3 },
           { id: 'speed', label: 'Complete under 60s', type: 'time', target: 60 }
        ],
        baseXp: 150
      },
      'syntax-smasher': {
        title: 'Syntax Smasher',
        language: 'JavaScript',
        difficulty: 'Beginner',
        description: 'Race against time to fix broken syntax errors.',
        objectives: [
           { id: 'syntax', label: 'Survive 5 Rounds', type: 'collection', target: 5 },
           { id: 'streak', label: 'Maintain 5x Streak', type: 'streak', target: 5 },
           { id: 'clean', label: 'No Compilation Errors', type: 'bool', target: 1 }
        ],
        baseXp: 100
      },
      'css-combat': {
        title: 'CSS Combat',
        language: 'CSS',
        difficulty: 'Advanced',
        description: 'Master flexbox and grid in a battle arena.',
        objectives: [
            { id: 'layout', label: 'Match Layout', type: 'bool', target: 1 },
            { id: 'streak', label: 'Perfect Alignment', type: 'streak', target: 1 },
        ],
        baseXp: 200
      },
      'logic-labyrinth': {
        title: 'Logic Labyrinth',
        language: 'Python',
        difficulty: 'Intermediate',
        description: 'Navigate the maze using boolean logic gates.',
        objectives: [
            { id: 'solve', label: 'Solve Maze', type: 'bool', target: 1 },
            { id: 'optimize', label: 'Optimize Path', type: 'bool', target: 1 }
        ],
        baseXp: 175
      },
      'algo-arena': {
        title: 'Algo Arena',
        language: 'C++',
        difficulty: 'Expert',
        description: 'Optimize memory usage in high-stakes sorting battles.',
        objectives: [
             { id: 'pass', label: 'Pass Unit Tests', type: 'bool', target: 1 },
             { id: 'memory', label: 'O(n) Memory', type: 'bool', target: 1 }
        ],
        baseXp: 300
      }
    };

    return GAME_DEFINITIONS[args.gameId] || {
        title: 'Unknown Module',
        language: 'Plain Text',
        difficulty: 'Unknown',
        objectives: [],
        baseXp: 0
    };
  }
});
