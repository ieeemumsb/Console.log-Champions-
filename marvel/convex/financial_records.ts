import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new financial record
export const createFinancialRecord = mutation({
  args: {
    transactionId: v.string(),
    date: v.string(),
    departmentId: v.id("departments"),
    type: v.union(v.literal("income"), v.literal("expense"), v.literal("transfer")),
    category: v.string(),
    subcategory: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    description: v.string(),
    reference: v.optional(v.string()),
    vendor: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if transaction ID already exists
    const existingRecord = await ctx.db
      .query("financial_records")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .first();

    if (existingRecord) {
      throw new Error(`Transaction with ID "${args.transactionId}" already exists`);
    }

    const recordId = await ctx.db.insert("financial_records", {
      ...args,
      currency: args.currency || "USD",
      status: "pending",
    });

    return recordId;
  },
});

// Get financial records by department with pagination
export const getFinancialRecordsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const records = await ctx.db
      .query("financial_records")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .order("desc")
      .take(limit);

    // Get creator details for each record
    const recordsWithCreator = await Promise.all(
      records.map(async (record) => {
        const creator = await ctx.db.get(record.createdBy);
        const approver = record.approvedBy ? await ctx.db.get(record.approvedBy) : null;
        
        return {
          ...record,
          creator: creator ? { name: creator.name, email: creator.emailAddress } : null,
          approver: approver ? { name: approver.name, email: approver.emailAddress } : null,
        };
      })
    );

    return recordsWithCreator;
  },
});

// Get financial records by date range
export const getFinancialRecordsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    departmentId: v.optional(v.id("departments")),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"), v.literal("transfer"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("financial_records");

    if (args.departmentId) {
      query = query.withIndex("byDateDepartment", (q) => 
        q.eq("date", args.startDate).eq("departmentId", args.departmentId)
      );
    }

    let records = await query.collect();

    // Filter by date range and type
    records = records.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      
      const inDateRange = recordDate >= start && recordDate <= end;
      const matchesType = !args.type || record.type === args.type;
      
      return inDateRange && matchesType;
    });

    // Get additional details
    const recordsWithDetails = await Promise.all(
      records.map(async (record) => {
        const department = await ctx.db.get(record.departmentId);
        const creator = await ctx.db.get(record.createdBy);
        const approver = record.approvedBy ? await ctx.db.get(record.approvedBy) : null;
        
        return {
          ...record,
          department: department ? { name: department.name, code: department.code } : null,
          creator: creator ? { name: creator.name, email: creator.emailAddress } : null,
          approver: approver ? { name: approver.name, email: approver.emailAddress } : null,
        };
      })
    );

    return recordsWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});

// Update financial record
export const updateFinancialRecord = mutation({
  args: {
    recordId: v.id("financial_records"),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"), v.literal("transfer"))),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    reference: v.optional(v.string()),
    vendor: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { recordId, ...updates } = args;
    
    const record = await ctx.db.get(recordId);
    if (!record) {
      throw new Error("Financial record not found");
    }

    await ctx.db.patch(recordId, updates);
    return recordId;
  },
});

// Approve financial record
export const approveFinancialRecord = mutation({
  args: {
    recordId: v.id("financial_records"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) {
      throw new Error("Financial record not found");
    }

    await ctx.db.patch(args.recordId, {
      status: "approved",
      approvedBy: args.approvedBy,
    });

    return args.recordId;
  },
});

// Complete financial record
export const completeFinancialRecord = mutation({
  args: { recordId: v.id("financial_records") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) {
      throw new Error("Financial record not found");
    }

    if (record.status !== "approved") {
      throw new Error("Financial record must be approved before completion");
    }

    await ctx.db.patch(args.recordId, { status: "completed" });
    return args.recordId;
  },
});

// Cancel financial record
export const cancelFinancialRecord = mutation({
  args: { recordId: v.id("financial_records") },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.recordId);
    if (!record) {
      throw new Error("Financial record not found");
    }

    await ctx.db.patch(args.recordId, { status: "cancelled" });
    return args.recordId;
  },
});

// Get financial summary by department
export const getFinancialSummaryByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("financial_records")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range
    const filteredRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(args.startDate);
      const end = new Date(args.endDate);
      return recordDate >= start && recordDate <= end;
    });

    // Calculate summary
    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalTransfers: 0,
      netAmount: 0,
      recordCount: filteredRecords.length,
      categories: {} as Record<string, { income: number; expense: number; count: number }>,
    };

    filteredRecords.forEach((record) => {
      if (record.type === "income") {
        summary.totalIncome += record.amount;
      } else if (record.type === "expense") {
        summary.totalExpenses += record.amount;
      } else if (record.type === "transfer") {
        summary.totalTransfers += record.amount;
      }

      // Category breakdown
      if (!summary.categories[record.category]) {
        summary.categories[record.category] = { income: 0, expense: 0, count: 0 };
      }
      
      if (record.type === "income") {
        summary.categories[record.category].income += record.amount;
      } else if (record.type === "expense") {
        summary.categories[record.category].expense += record.amount;
      }
      summary.categories[record.category].count += 1;
    });

    summary.netAmount = summary.totalIncome - summary.totalExpenses;

    return summary;
  },
});

// Get recent financial records
export const getRecentFinancialRecords = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const records = await ctx.db
      .query("financial_records")
      .order("desc")
      .take(limit);

    const recordsWithDetails = await Promise.all(
      records.map(async (record) => {
        const department = await ctx.db.get(record.departmentId);
        const creator = await ctx.db.get(record.createdBy);
        
        return {
          ...record,
          department: department ? { name: department.name, code: department.code } : null,
          creator: creator ? { name: creator.name } : null,
        };
      })
    );

    return recordsWithDetails;
  },
});

// Search financial records
export const searchFinancialRecords = query({
  args: {
    searchTerm: v.string(),
    departmentId: v.optional(v.id("departments")),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"), v.literal("transfer"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db.query("financial_records");
    
    if (args.departmentId) {
      query = query.withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId));
    }

    let records = await query.take(limit * 2); // Take more to account for filtering

    // Filter by search term and type
    records = records.filter((record) => {
      const searchLower = args.searchTerm.toLowerCase();
      const matchesSearch = 
        record.description.toLowerCase().includes(searchLower) ||
        record.category.toLowerCase().includes(searchLower) ||
        (record.vendor && record.vendor.toLowerCase().includes(searchLower)) ||
        (record.reference && record.reference.toLowerCase().includes(searchLower)) ||
        record.transactionId.toLowerCase().includes(searchLower);
      
      const matchesType = !args.type || record.type === args.type;
      
      return matchesSearch && matchesType;
    }).slice(0, limit);

    const recordsWithDetails = await Promise.all(
      records.map(async (record) => {
        const department = await ctx.db.get(record.departmentId);
        
        return {
          ...record,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return recordsWithDetails;
  },
});