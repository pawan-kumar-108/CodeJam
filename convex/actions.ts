import { action } from "./_generated/server";
import { v } from "convex/values";
import { OpenRouter } from '@openrouter/sdk';

export const generateGameLevel = action({
    args: {
        language: v.string(),
        difficulty: v.string(),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        // console.log(`[AI-GEN] Request for ${args.language} - ${args.type}`);

        // Fallback to Gemini Key if OpenRouter is missing (for backward compat during dev)
        const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.warn("[AI-GEN] No API Key found. Using mock data.");
            return getMockData(args.language, args.type);
        }

        const client = new OpenRouter({
            apiKey: apiKey,
            serverURL: process.env.OPENROUTER_API_URL,
        });

        // Define the prompt based on game type to force variety
        let mechanicInstruction = "";
        if (args.type === 'css-combat') {
            mechanicInstruction = `Create a MULTIPLE CHOICE question about a CSS property that solves a specific layout or visual problem. 
        Output format: {"mode": "multiple-choice", "question": "The text is aligned to the left. Which property centers it?", "options": ["text-align: center", "align-items: center", "justify-content: center", "margin: auto"], "correctOption": 0, "code": ["div {", "  width: 100%;", "  ___: ___;", "}"]}`;
        } else {
             // UNIFIED: Fill in the blank for ALL difficulties/types as requested
             // We scale the complexity of the code snippet based on difficulty, but keeping the format consistent.
             const difficultyScale = args.difficulty === 'Beginner' ? 'simple' : args.difficulty === 'Intermediate' ? 'moderate' : 'complex';
             
             mechanicInstruction = `Create a FILL-IN-THE-BLANK challenge (${difficultyScale} complexity). 
             Create a valid, self-contained code snippet. 
             CRITICAL: All variables used MUST be defined. Code must be runnable.
             Replace ONE key keyword/function/operator with "__BLANK__".
             DO NOT replace generic variable names or braces. Replace meaningful logic operators or methods.
             Output format: {
                "mode": "fill-in-the-blank",
                "title": "Complete the Code",
                "description": "Drag the correct block to complete the logic.",
                "code": ["const x = 10;", "if (x __BLANK__ 5) {", "  console.log('Big');", "}"],
                "blanks": [
                    { "index": 0, "correct": ">", "options": [">", "<", "=", "++"] }
                ]
             }`;
        }

        // Inject randomness to prevent repetitive challenges
        const topics = ["space exploration", "e-commerce", "social media", "video game engine", "weather app", "robotics", "finance dashboard", "cybersecurity log", "music player"];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const seed = Math.random().toString(36).substring(7);

        const prompt = `
      Create a unique coding challenge.
      Game: "${args.type}" (${args.language}, ${args.difficulty}).
      Topic: ${randomTopic} (Use this context for variable names/logic).
      RandomSeed: ${seed}
      
      ${mechanicInstruction}

      Common fields for all: "title", "description", "hint", "mode" (string).
      Ensure the response is valid JSON. ONLY return the JSON object, no markdown.
    `;

        try {
            // console.log("[AI-GEN] Sending prompt to OpenRouter...");

            const completion = await client.chat.send({
                model: "google/gemini-2.0-flash-001", // Using Gemini via OpenRouter
                messages: [
                    { role: "system", content: "You are a coding game engine. Output strictly valid JSON." },
                    { role: "user", content: prompt }
                ],
                responseFormat: { type: "json_object" }
            });

            const messageContent = completion.choices[0].message.content;
            if (!messageContent) throw new Error("No content");

            const text =
                typeof messageContent === "string"
                    ? messageContent
                    : messageContent
                        .filter((c) => c.type === "text")
                        .map((c) => c.text)
                        .join("");

            console.log("Success!");
            return JSON.parse(text);
        } catch (e) {
            console.error("[AI-GEN] AI Generation failed:", e);
            return getMockData(args.language, args.type);
        }
    },
});

function getMockData(language: string, type: string) {
    if (type === 'css-combat') {
        return {
            mode: 'multiple-choice',
            title: 'Centering a Div',
            description: 'Which property aligns items vertically?',
            code: ['.container {', '  display: flex;', '  ___: center;', '}'],
            options: ['justify-content', 'align-items', 'text-align', 'float'],
            correctOption: 1,
            hint: 'It works on the cross axis.'
        };
    }
    if (type === 'tag-titan') {
        return {
            mode: 'reorder',
            title: 'Basic Structure',
            description: 'Arrage the tags in correct nesting order.',
            scrambledLines: ['</h1>', '<body>', '<h1>Hello', '</body>'],
            correctOrderIndices: [1, 2, 0, 3],
            hint: 'Body wraps content.',
            code: []
        };
    }
    return {
        mode: 'fix-code',
        title: `${language} Debug`,
        description: "Fix the error.",
        code: [`function hello() {`, `  console.log("Hi"`, `}`],
        bugLine: 1,
        correctCode: `  console.log("Hi");`,
        hint: "Missing paren."
    };
}
