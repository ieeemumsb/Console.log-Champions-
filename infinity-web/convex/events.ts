import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

// Get all events for the currently logged-in user
export const getAllUserEvents = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the currently logged-in user
    const user = await getUser(ctx);
    let dateStr = args.date;
    if(!dateStr){
      // Get today's date in "YYYY-MM-DD" format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      dateStr = `${year}-${month}-${day}`;
    }
   
    // return all events for the user for the specified date
    return await ctx.db
      .query("events")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((event) => event.eq(event.field("date"), dateStr))
      .collect();
  },
});

export const addEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.string(),
    location: v.string(),
    time: v.string(),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx);
    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      date: args.date,
      location: args.location,
      time: args.time,
      userId: user._id,
      priority: args.priority,
      
    });
  },
});

export const getEvent = query({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
   await getUser(ctx);
    return await ctx.db.get(args.id);
  },
});

export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
     await getUser(ctx);
    return await ctx.db.delete(args.id);
  },
});

export const clearEvent = mutation({
  args: {
    id: v.id("events"),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("ignored")
    ),
  },
  handler: async (ctx, args) => {
   await getUser(ctx);
    return await ctx.db.patch(args.id, {
      isCleared: args.status,
    });
  },
})

export const getHistory = query({
  handler: async (ctx) => {
   const user = await getUser(ctx);
    return await ctx.db
      .query("events")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter(q => q.neq("isCleared", null))
      .collect();
  },
});
