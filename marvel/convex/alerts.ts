import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new alert
export const createAlert = mutation({
  args: {
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("budget_overrun"),
      v.literal("revenue_drop"),
      v.literal("expense_spike"),
      v.literal("threshold_breach"),
      v.literal("custom")
    ),
    triggerConditions: v.object({
      metric: v.string(),
      operator: v.union(v.literal(">"), v.literal("<"), v.literal(">="), v.literal("<="), v.literal("=")),
      threshold: v.number(),
      timeframe: v.optional(v.string()),
    }),
    frequency: v.union(v.literal("immediate"), v.literal("daily"), v.literal("weekly")),
    notificationMethod: v.array(v.union(v.literal("dashboard"), v.literal("email"), v.literal("webhook"))),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      ...args,
      isActive: true,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    });

    return alertId;
  },
});

// Get alerts by user
export const getAlertsByUser = query({
  args: {
    userId: v.id("users"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let alerts = await ctx.db
      .query("alerts")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.isActive !== undefined) {
      alerts = alerts.filter(alert => alert.isActive === args.isActive);
    }

    // Get department details for each alert
    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        let department = null;
        if (alert.departmentId) {
          department = await ctx.db.get(alert.departmentId);
        }
        
        return {
          ...alert,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return alertsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
});

// Get alerts by department
export const getAlertsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let alerts = await ctx.db
      .query("alerts")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .collect();

    if (args.isActive !== undefined) {
      alerts = alerts.filter(alert => alert.isActive === args.isActive);
    }

    // Get user details for each alert
    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        const user = await ctx.db.get(alert.userId);
        
        return {
          ...alert,
          user: user ? { name: user.name, email: user.emailAddress } : null,
        };
      })
    );

    return alertsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
});

// Get all active alerts
export const getActiveAlerts = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query("alerts")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .collect();

    const alertsWithDetails = await Promise.all(
      alerts.map(async (alert) => {
        const user = await ctx.db.get(alert.userId);
        let department = null;
        if (alert.departmentId) {
          department = await ctx.db.get(alert.departmentId);
        }
        
        return {
          ...alert,
          user: user ? { name: user.name, email: user.emailAddress } : null,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return alertsWithDetails;
  },
});

// Update alert
export const updateAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    triggerConditions: v.optional(v.object({
      metric: v.string(),
      operator: v.union(v.literal(">"), v.literal("<"), v.literal(">="), v.literal("<="), v.literal("=")),
      threshold: v.number(),
      timeframe: v.optional(v.string()),
    })),
    frequency: v.optional(v.union(v.literal("immediate"), v.literal("daily"), v.literal("weekly"))),
    notificationMethod: v.optional(v.array(v.union(v.literal("dashboard"), v.literal("email"), v.literal("webhook")))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { alertId, ...updates } = args;
    
    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await ctx.db.patch(alertId, updates);
    return alertId;
  },
});

// Delete alert
export const deleteAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await ctx.db.delete(args.alertId);
    return args.alertId;
  },
});

// Trigger alert (called by monitoring functions)
export const triggerAlert = mutation({
  args: {
    alertId: v.id("alerts"),
    triggerValue: v.number(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const alert = await ctx.db.get(args.alertId);
    if (!alert || !alert.isActive) {
      throw new Error("Alert not found or inactive");
    }

    // Update alert trigger count and last triggered time
    await ctx.db.patch(args.alertId, {
      lastTriggered: new Date().toISOString(),
      triggerCount: (alert.triggerCount || 0) + 1,
    });

    // Create alert log entry
    const logId = await ctx.db.insert("alert_logs", {
      alertId: args.alertId,
      userId: alert.userId,
      departmentId: alert.departmentId,
      triggeredAt: new Date().toISOString(),
      triggerValue: args.triggerValue,
      threshold: alert.triggerConditions.threshold,
      message: args.message,
      status: "sent",
    });

    return logId;
  },
});

// Get alert logs
export const getAlertLogs = query({
  args: {
    alertId: v.optional(v.id("alerts")),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let query = ctx.db.query("alert_logs");
    
    if (args.alertId) {
      query = query.withIndex("byAlert", (q) => q.eq("alertId", args.alertId));
    } else if (args.userId) {
      query = query.withIndex("byUser", (q) => q.eq("userId", args.userId));
    }

    const logs = await query.order("desc").take(limit);

    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        const alert = await ctx.db.get(log.alertId);
        const user = await ctx.db.get(log.userId);
        let department = null;
        if (log.departmentId) {
          department = await ctx.db.get(log.departmentId);
        }
        
        return {
          ...log,
          alert: alert ? { name: alert.name, type: alert.type } : null,
          user: user ? { name: user.name, email: user.emailAddress } : null,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return logsWithDetails;
  },
});

// Acknowledge alert log
export const acknowledgeAlertLog = mutation({
  args: {
    logId: v.id("alert_logs"),
    acknowledgedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const log = await ctx.db.get(args.logId);
    if (!log) {
      throw new Error("Alert log not found");
    }

    await ctx.db.patch(args.logId, {
      status: "acknowledged",
      acknowledgedBy: args.acknowledgedBy,
      acknowledgedAt: new Date().toISOString(),
    });

    return args.logId;
  },
});

// Check budget overrun alerts
export const checkBudgetOverrunAlerts = mutation({
  args: {},
  handler: async (ctx) => {
    const budgetAlerts = await ctx.db
      .query("alerts")
      .withIndex("byType", (q) => q.eq("type", "budget_overrun"))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const triggeredAlerts = [];

    for (const alert of budgetAlerts) {
      if (!alert.departmentId) continue;

      // Get active budgets for this department
      const budgets = await ctx.db
        .query("budgets")
        .withIndex("byDepartment", (q) => q.eq("departmentId", alert.departmentId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();

      for (const budget of budgets) {
        const utilizationPercentage = (budget.spentAmount / budget.totalBudget) * 100;
        
        // Check if threshold is breached
        let shouldTrigger = false;
        switch (alert.triggerConditions.operator) {
          case ">":
            shouldTrigger = utilizationPercentage > alert.triggerConditions.threshold;
            break;
          case ">=":
            shouldTrigger = utilizationPercentage >= alert.triggerConditions.threshold;
            break;
          case "<":
            shouldTrigger = utilizationPercentage < alert.triggerConditions.threshold;
            break;
          case "<=":
            shouldTrigger = utilizationPercentage <= alert.triggerConditions.threshold;
            break;
          case "=":
            shouldTrigger = Math.abs(utilizationPercentage - alert.triggerConditions.threshold) < 0.1;
            break;
        }

        if (shouldTrigger) {
          const department = await ctx.db.get(alert.departmentId);
          const message = `Budget utilization for ${department?.name} (${budget.fiscalPeriod} ${budget.fiscalYear}) is ${utilizationPercentage.toFixed(1)}%, which ${alert.triggerConditions.operator} ${alert.triggerConditions.threshold}%`;
          
          const logId = await ctx.runMutation(api.alerts.triggerAlert, {
            alertId: alert._id,
            triggerValue: utilizationPercentage,
            message,
          });
          
          triggeredAlerts.push(logId);
        }
      }
    }

    return triggeredAlerts;
  },
});

// Get alert statistics
export const getAlertStatistics = query({
  args: {
    userId: v.optional(v.id("users")),
    departmentId: v.optional(v.id("departments")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let alertQuery = ctx.db.query("alerts");
    let logQuery = ctx.db.query("alert_logs");

    if (args.userId) {
      alertQuery = alertQuery.withIndex("byUser", (q) => q.eq("userId", args.userId));
      logQuery = logQuery.withIndex("byUser", (q) => q.eq("userId", args.userId));
    } else if (args.departmentId) {
      alertQuery = alertQuery.withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId));
    }

    const alerts = await alertQuery.collect();
    const logs = await logQuery.collect();

    // Filter logs by date range
    const recentLogs = logs.filter(log => 
      new Date(log.triggeredAt) >= startDate
    );

    const statistics = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      inactiveAlerts: alerts.filter(a => !a.isActive).length,
      totalTriggered: recentLogs.length,
      acknowledgedCount: recentLogs.filter(l => l.status === "acknowledged").length,
      pendingCount: recentLogs.filter(l => l.status === "sent").length,
      failedCount: recentLogs.filter(l => l.status === "failed").length,
      alertsByType: {} as Record<string, number>,
      triggersByDay: {} as Record<string, number>,
    };

    // Count alerts by type
    alerts.forEach(alert => {
      statistics.alertsByType[alert.type] = (statistics.alertsByType[alert.type] || 0) + 1;
    });

    // Count triggers by day
    recentLogs.forEach(log => {
      const day = log.triggeredAt.split('T')[0];
      statistics.triggersByDay[day] = (statistics.triggersByDay[day] || 0) + 1;
    });

    return statistics;
  },
});

// Import api reference for internal mutations
const api = {} as any; // This would be properly imported in a real implementation