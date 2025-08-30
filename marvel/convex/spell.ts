import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

import { getUser } from "./users";



export const getSpells = query({
  handler: async (ctx) => {
    return await ctx.db.query("spells").collect();
  },
});


export const getSpell = query({
  args: {
    id: v.id("spells"),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});



export const saveSummary = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    spellLevel: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
     const searchText = `${args.name} ${args.summary} level:${args.spellLevel}`;
    const user = await getUser(ctx);
    await ctx.db.insert("spells", {
      name: args.name,
      authorId: user._id,
      storageId: args.storageId,
      spellLevel: args.spellLevel,
      summary: args.summary,
      searchText,
      level: args.spellLevel,
    });
  },
});
