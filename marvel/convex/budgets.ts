import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new budget
export const createBudget = mutation({
  args: {
    departmentId: v.id("departments"),
    fiscalYear: v.number(),
    fiscalPeriod: v.string(),
    totalBudget: v.number(),
    categoryBreakdown: v.optional(v.array(v.object({
      category: v.string(),
      budgeted: v.number(),
      spent: v.number(),
      remaining: v.number(),
    }))),
    createdBy: v.id("users"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if budget already exists for this department, year, and period
    const existingBudget = await ctx.db
      .query("budgets")
      .withIndex("byDepartmentYear", (q) => 
        q.eq("departmentId", args.departmentId).eq("fiscalYear", args.fiscalYear)
      )
      .filter((q) => q.eq(q.field("fiscalPeriod"), args.fiscalPeriod))
      .first();

    if (existingBudget) {
      throw new Error(`Budget already exists for ${args.fiscalPeriod} ${args.fiscalYear}`);
    }

    const budgetId = await ctx.db.insert("budgets", {
      ...args,
      allocatedAmount: 0,
      spentAmount: 0,
      remainingAmount: args.totalBudget,
      status: "draft",
      lastUpdated: new Date().toISOString(),
      budgetVariance: 0,
    });

    return budgetId;
  },
});

// Get budgets by department
export const getBudgetsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    fiscalYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("budgets")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId));

    let budgets = await query.collect();

    // Filter by fiscal year if provided
    if (args.fiscalYear) {
      budgets = budgets.filter(budget => budget.fiscalYear === args.fiscalYear);
    }

    // Get creator details
    const budgetsWithDetails = await Promise.all(
      budgets.map(async (budget) => {
        const creator = await ctx.db.get(budget.createdBy);
        const approver = budget.approvedBy ? await ctx.db.get(budget.approvedBy) : null;
        const department = await ctx.db.get(budget.departmentId);
        
        return {
          ...budget,
          creator: creator ? { name: creator.name, email: creator.emailAddress } : null,
          approver: approver ? { name: approver.name, email: approver.emailAddress } : null,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return budgetsWithDetails.sort((a, b) => b.fiscalYear - a.fiscalYear);
  },
});

// Get current active budgets
export const getActiveBudgets = query({
  args: {
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("budgets")
      .withIndex("byStatus", (q) => q.eq("status", "active"));

    let budgets = await query.collect();

    if (args.departmentId) {
      budgets = budgets.filter(budget => budget.departmentId === args.departmentId);
    }

    const budgetsWithDetails = await Promise.all(
      budgets.map(async (budget) => {
        const department = await ctx.db.get(budget.departmentId);
        
        return {
          ...budget,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return budgetsWithDetails;
  },
});

// Update budget
export const updateBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
    totalBudget: v.optional(v.number()),
    categoryBreakdown: v.optional(v.array(v.object({
      category: v.string(),
      budgeted: v.number(),
      spent: v.number(),
      remaining: v.number(),
    }))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { budgetId, ...updates } = args;
    
    const budget = await ctx.db.get(budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    // Recalculate remaining amount if total budget is updated
    let remainingAmount = budget.remainingAmount;
    if (updates.totalBudget) {
      remainingAmount = updates.totalBudget - budget.spentAmount;
    }

    await ctx.db.patch(budgetId, {
      ...updates,
      remainingAmount,
      lastUpdated: new Date().toISOString(),
    });

    return budgetId;
  },
});

// Update budget spending (called when financial records are processed)
export const updateBudgetSpending = mutation({
  args: {
    departmentId: v.id("departments"),
    fiscalYear: v.number(),
    fiscalPeriod: v.string(),
    amount: v.number(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db
      .query("budgets")
      .withIndex("byDepartmentYear", (q) => 
        q.eq("departmentId", args.departmentId).eq("fiscalYear", args.fiscalYear)
      )
      .filter((q) => q.eq(q.field("fiscalPeriod"), args.fiscalPeriod))
      .first();

    if (!budget) {
      throw new Error("Budget not found for the specified period");
    }

    const newSpentAmount = budget.spentAmount + args.amount;
    const newRemainingAmount = budget.totalBudget - newSpentAmount;
    const budgetVariance = ((newSpentAmount - budget.totalBudget) / budget.totalBudget) * 100;

    // Update category breakdown if it exists
    let updatedCategoryBreakdown = budget.categoryBreakdown;
    if (updatedCategoryBreakdown) {
      updatedCategoryBreakdown = updatedCategoryBreakdown.map(item => {
        if (item.category === args.category) {
          return {
            ...item,
            spent: item.spent + args.amount,
            remaining: item.budgeted - (item.spent + args.amount),
          };
        }
        return item;
      });

      // If category doesn't exist, add it
      const categoryExists = updatedCategoryBreakdown.some(item => item.category === args.category);
      if (!categoryExists) {
        updatedCategoryBreakdown.push({
          category: args.category,
          budgeted: 0,
          spent: args.amount,
          remaining: -args.amount,
        });
      }
    }

    await ctx.db.patch(budget._id, {
      spentAmount: newSpentAmount,
      remainingAmount: newRemainingAmount,
      budgetVariance,
      categoryBreakdown: updatedCategoryBreakdown,
      lastUpdated: new Date().toISOString(),
    });

    return budget._id;
  },
});

// Approve budget
export const approveBudget = mutation({
  args: {
    budgetId: v.id("budgets"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    await ctx.db.patch(args.budgetId, {
      status: "approved",
      approvedBy: args.approvedBy,
      lastUpdated: new Date().toISOString(),
    });

    return args.budgetId;
  },
});

// Activate budget
export const activateBudget = mutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    if (budget.status !== "approved") {
      throw new Error("Budget must be approved before activation");
    }

    await ctx.db.patch(args.budgetId, {
      status: "active",
      lastUpdated: new Date().toISOString(),
    });

    return args.budgetId;
  },
});

// Close budget
export const closeBudget = mutation({
  args: { budgetId: v.id("budgets") },
  handler: async (ctx, args) => {
    const budget = await ctx.db.get(args.budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }

    await ctx.db.patch(args.budgetId, {
      status: "closed",
      lastUpdated: new Date().toISOString(),
    });

    return args.budgetId;
  },
});

// Get budget utilization summary
export const getBudgetUtilizationSummary = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    fiscalYear: v.number(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("budgets")
      .withIndex("byFiscalYear", (q) => q.eq("fiscalYear", args.fiscalYear));

    let budgets = await query.collect();

    if (args.departmentId) {
      budgets = budgets.filter(budget => budget.departmentId === args.departmentId);
    }

    const summary = {
      totalBudgeted: 0,
      totalSpent: 0,
      totalRemaining: 0,
      utilizationPercentage: 0,
      departmentBreakdown: [] as any[],
    };

    const departmentMap = new Map();

    for (const budget of budgets) {
      const department = await ctx.db.get(budget.departmentId);
      const deptName = department?.name || "Unknown";

      summary.totalBudgeted += budget.totalBudget;
      summary.totalSpent += budget.spentAmount;
      summary.totalRemaining += budget.remainingAmount;

      if (!departmentMap.has(deptName)) {
        departmentMap.set(deptName, {
          department: deptName,
          budgeted: 0,
          spent: 0,
          remaining: 0,
          utilization: 0,
        });
      }

      const deptData = departmentMap.get(deptName);
      deptData.budgeted += budget.totalBudget;
      deptData.spent += budget.spentAmount;
      deptData.remaining += budget.remainingAmount;
      deptData.utilization = (deptData.spent / deptData.budgeted) * 100;
    }

    summary.utilizationPercentage = (summary.totalSpent / summary.totalBudgeted) * 100;
    summary.departmentBreakdown = Array.from(departmentMap.values());

    return summary;
  },
});

// Get budget alerts (budgets over threshold)
export const getBudgetAlerts = query({
  args: {
    thresholdPercentage: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.thresholdPercentage || 80; // Default 80%

    const activeBudgets = await ctx.db
      .query("budgets")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();

    const alerts = [];

    for (const budget of activeBudgets) {
      const utilizationPercentage = (budget.spentAmount / budget.totalBudget) * 100;
      
      if (utilizationPercentage >= threshold) {
        const department = await ctx.db.get(budget.departmentId);
        
        alerts.push({
          budgetId: budget._id,
          department: department ? { name: department.name, code: department.code } : null,
          fiscalYear: budget.fiscalYear,
          fiscalPeriod: budget.fiscalPeriod,
          totalBudget: budget.totalBudget,
          spentAmount: budget.spentAmount,
          remainingAmount: budget.remainingAmount,
          utilizationPercentage,
          severity: utilizationPercentage >= 100 ? "critical" : utilizationPercentage >= 90 ? "high" : "medium",
        });
      }
    }

    return alerts.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
  },
});