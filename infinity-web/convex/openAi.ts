import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export const chat = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const blob = await ctx.storage.getUrl(storageId);
    if (!blob) throw new Error("File not found");

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Summarize this document in a concise way. With Emphasis on Step by Step way to make a spell",
        },
        { role: "user", content: blob },
      ],
    });

    return res.choices[0].message?.content;
  },
});
