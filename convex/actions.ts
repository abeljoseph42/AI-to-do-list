import OpenAI from "openai";
import { v } from "convex/values";
import { internal } from "./_generated/api"
import { action } from "./_generated/server";
import { requireUser } from "./helpers";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
})

export const generateTodos = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const response = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Generate 3 to-dos based on the given prompt. Please include a title and a description. Please return a JSON object in the following format: { todos: [{ title: string, description: string }] }"
                },
                {
                    role: "user",
                    content: `Prompt ${args.prompt}`
                }
            ],
            response_format: {type: "json_object"}
        });
        const content = JSON.parse(response.choices[0].message.content!) as {
            todos: { title: string, description: string }[]
        };

        await ctx.runMutation(internal.functions.createManyTodos, {
            todos: content.todos,
            userID: user.tokenIdentifier,
        });

        return content.todos;
    }
})