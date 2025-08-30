// Convex schema definition for StarkLedger Financial Analytics Dashboard
// This file defines all the database tables and their fields,
// as well as indexes for efficient querying.

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { de } from "date-fns/locale";

export default defineSchema({
  // Users table: stores information about registered users
  users: defineTable({
    name: v.string(),
    emailAddress: v.string(),
    imageUrl: v.string(),
    // External ID: Clerk's unique user identifier
    externalId: v.string(),
    // User role and department access
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("analyst"),
        v.literal("viewer")
      )
    ),
    departmentId: v.optional(v.id("departments")),
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
    isCleared: v.optional(
      v.union(v.literal("success"), v.literal("failed"), v.literal("ignored"))
    ),
  }).index("byUserId", ["userId"]),

  call: defineTable({
    roomId: v.string(),
  }),
});
