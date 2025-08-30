// convex/queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchSpells = query({
  args: { query: v.string(), level: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const q = args.query.trim();
    if (!q) return [];

    // Build the search filter expression; if level is provided, add eq() filter
    const results = await (
      args.level
        ? ctx.db
            .query("spells")
            .withSearchIndex("search_spells", (s) =>
              s.search("searchText", q).eq("level", args.level!)
            )
        : ctx.db
            .query("spells")
            .withSearchIndex("search_spells", (s) => s.search("searchText", q))
    ).take(50); // adjust page size as needed

    return results;
  },
});
