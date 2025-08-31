import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCall = mutation({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, { roomId}) => {
    const activeCall = await ctx.db.query("call").first();
    if (activeCall) return activeCall;

    
    const call = await ctx.db.insert("call", { roomId });
    return call;
  },
});


export const deleteCall = mutation({
  args: {
    roomId: v.string(),
  },
  handler: async (ctx, { roomId }) => {
    const call = await ctx.db.query("call").filter(q=>q.eq(q.field("roomId"), roomId)).first();
    if(!call) return;
    await ctx.db.delete(call?._id);
  },
});


export const activeCall = query({
  handler: async (ctx) => {
    const call = await ctx.db.query("call").first()
    if(!call) return null;
    return call;
  },
})