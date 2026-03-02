"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Daytona } from "@daytonaio/sdk";
import { getAuthUserId } from "@convex-dev/auth/server";

const getDaytona = () => {
  const apiKey = process.env.DAYTONA_API_KEY;
  if (!apiKey) throw new Error("DAYTONA_API_KEY not configured");
  return new Daytona({ apiKey });
};

export const create = action({
  args: { language: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const daytona = getDaytona();

    // Verify language is supported by SDK
    // The SDK supports: python, typescript, javascript
    const supportedLanguages = ['python', 'typescript', 'javascript'];
    const lang = args.language.toLowerCase();
    
    if (!supportedLanguages.includes(lang)) {
        throw new Error(`Unsupported language: ${args.language}`);
    }

    const sandbox = await daytona.create({ language: lang });
    
    return { sandboxId: sandbox.id };
  },
});

export const run = action({
  args: { sandboxId: v.string(), code: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const daytona = getDaytona();
    let sandbox;
    try {
        sandbox = await daytona.get(args.sandboxId);
    } catch (e) {
        console.error("Failed to get sandbox:", e);
        throw new Error("Could not restore sandbox session. Please refresh.");
    }

    try {
        if (typeof sandbox.start === 'function') {
            await sandbox.start();
        }
        if (typeof sandbox.waitUntilStarted === 'function') {
            await sandbox.waitUntilStarted();
        }
    } catch (err) {
        console.warn("Sandbox start/ready check failed:", err);
    }

    const response = await sandbox.process.codeRun(args.code);
    return response.result;
  },
});
