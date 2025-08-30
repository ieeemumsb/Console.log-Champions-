// Convex schema definition for the application.
// This file defines all the database tables and their fields,
// as well as indexes for efficient querying.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table: stores information about registered users
  users: defineTable({
    name: v.string(),
    emailAddress: v.string(),
    imageUrl: v.string(),
    // External ID: Clerk's unique user identifier

    externalId: v.string(),
  })
    // Index to quickly look up users by their external Clerk ID
    .index("byExternalId", ["externalId"]),
  // Events table: stores event information
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.string(), 
    location: v.string(),
    priority: v.union(v.literal("High"), v.literal("Medium"), v.literal("Low")), // new required field
    userId: v.id("users"),
  }).index("byUserId", ["userId"]),
});
