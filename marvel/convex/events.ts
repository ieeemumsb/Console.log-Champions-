import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

// Get all events for the currently logged-in user
export const getAllUsersEvents = () =>
  query({
    args: {},
    handler: async (ctx) => {
      // Get the currently logged-in user
      const user = await getUser(ctx);
      // return all events for the user
      return await ctx.db
        .query("events")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .collect();
    },
  });

export const addEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      location: args.location,
      userId: user._id,
    });
  },
});
