import { query } from "./_generated/server";
import { v } from "convex/values";

// Get dashboard overview data
export const getDashboardOverview = query({
  args: {
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Default to current month if no date range provided
    const dateRange = args.dateRange || {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date().toISOString(),
    };

    // Use user's department if no specific department provided
    const targetDepartmentId = args.departmentId || user.departmentId;

    const overview = {
      summary: {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        budgetUtilization: 0,
      },
      recentTransactions: [] as any[],
      budgetAlerts: [] as any[],
      departmentPerformance: [] as any[],
      upcomingAlerts: [] as any[],
      quickStats: {
        transactionCount: 0,
        averageTransactionSize: 0,
        departmentCount: 0,
        activeAlerts: 0,
      },
    };

    // Get financial summary
    let financialRecords = await ctx.db
      .query("financial_records")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range
    financialRecords = financialRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return recordDate >= start && recordDate <= end;
    });

    // Filter by department if specified
    if (targetDepartmentId) {
      financialRecords = financialRecords.filter(record => 
        record.departmentId === targetDepartmentId
      );
    }

    // Calculate summary
    financialRecords.forEach(record => {
      if (record.type === "income") {
        overview.summary.totalRevenue += record.amount;
      } else if (record.type === "expense") {
        overview.summary.totalExpenses += record.amount;
      }
    });

    overview.summary.netProfit = overview.summary.totalRevenue - overview.summary.totalExpenses;

    // Get budget utilization
    const currentYear = new Date().getFullYear();
    let budgets = await ctx.db
      .query("budgets")
      .withIndex("byFiscalYear", (q) => q.eq("fiscalYear", currentYear))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (targetDepartmentId) {
      budgets = budgets.filter(budget => budget.departmentId === targetDepartmentId);
    }

    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    overview.summary.budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // Get recent transactions
    let recentTransactions = await ctx.db
      .query("financial_records")
      .order("desc")
      .take(5);

    if (targetDepartmentId) {
      recentTransactions = recentTransactions.filter(record => 
        record.departmentId === targetDepartmentId
      );
    }

    overview.recentTransactions = await Promise.all(
      recentTransactions.map(async (record) => {
        const department = await ctx.db.get(record.departmentId);
        return {
          ...record,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    // Get budget alerts (over 80% utilization)
    overview.budgetAlerts = budgets.filter(budget => {
      const utilization = (budget.spentAmount / budget.totalBudget) * 100;
      return utilization >= 80;
    }).map(budget => ({
      budgetId: budget._id,
      fiscalPeriod: budget.fiscalPeriod,
      utilization: (budget.spentAmount / budget.totalBudget) * 100,
      severity: (budget.spentAmount / budget.totalBudget) * 100 >= 100 ? "critical" : "warning",
    }));

    // Get department performance (if user is admin or viewing all departments)
    if (!targetDepartmentId || user.role === "admin") {
      const allDepartments = await ctx.db
        .query("departments")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      overview.departmentPerformance = await Promise.all(
        allDepartments.slice(0, 5).map(async (dept) => {
          const deptRecords = financialRecords.filter(r => r.departmentId === dept._id);
          const revenue = deptRecords.filter(r => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
          const expenses = deptRecords.filter(r => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
          
          return {
            department: { name: dept.name, code: dept.code },
            revenue,
            expenses,
            profit: revenue - expenses,
            profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
          };
        })
      );
    }

    // Get upcoming alerts
    const activeAlerts = await ctx.db
      .query("alerts")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .collect();

    overview.upcomingAlerts = activeAlerts.slice(0, 3).map(alert => ({
      name: alert.name,
      type: alert.type,
      threshold: alert.triggerConditions.threshold,
      metric: alert.triggerConditions.metric,
    }));

    // Calculate quick stats
    overview.quickStats = {
      transactionCount: financialRecords.length,
      averageTransactionSize: financialRecords.length > 0 
        ? financialRecords.reduce((sum, r) => sum + r.amount, 0) / financialRecords.length 
        : 0,
      departmentCount: (await ctx.db.query("departments").filter((q) => q.eq(q.field("isActive"), true)).collect()).length,
      activeAlerts: activeAlerts.length,
    };

    return overview;
  },
});

// Get financial metrics for charts
export const getFinancialMetrics = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    dateRange: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
    granularity: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    const granularity = args.granularity || "monthly";

    let records = await ctx.db
      .query("financial_records")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range
    records = records.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(args.dateRange.startDate);
      const end = new Date(args.dateRange.endDate);
      return recordDate >= start && recordDate <= end;
    });

    // Filter by department if specified
    if (args.departmentId) {
      records = records.filter(record => record.departmentId === args.departmentId);
    }

    // Group data by time period
    const groupedData: Record<string, { revenue: number; expenses: number; transactions: number }> = {};

    records.forEach(record => {
      let period: string;
      const date = new Date(record.date);

      switch (granularity) {
        case "daily":
          period = record.date.substring(0, 10); // YYYY-MM-DD
          break;
        case "weekly":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          period = weekStart.toISOString().substring(0, 10);
          break;
        case "monthly":
        default:
          period = record.date.substring(0, 7); // YYYY-MM
          break;
      }

      if (!groupedData[period]) {
        groupedData[period] = { revenue: 0, expenses: 0, transactions: 0 };
      }

      if (record.type === "income") {
        groupedData[period].revenue += record.amount;
      } else if (record.type === "expense") {
        groupedData[period].expenses += record.amount;
      }
      groupedData[period].transactions += 1;
    });

    // Convert to arrays for charting
    const metrics = {
      revenueData: [] as any[],
      expenseData: [] as any[],
      profitData: [] as any[],
      transactionData: [] as any[],
      periods: [] as string[],
    };

    Object.entries(groupedData)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([period, data]) => {
        const profit = data.revenue - data.expenses;
        
        metrics.periods.push(period);
        metrics.revenueData.push({ period, value: data.revenue });
        metrics.expenseData.push({ period, value: data.expenses });
        metrics.profitData.push({ period, value: profit });
        metrics.transactionData.push({ period, value: data.transactions });
      });

    return metrics;
  },
});

// Get budget vs actual comparison
export const getBudgetVsActual = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    fiscalYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const fiscalYear = args.fiscalYear || new Date().getFullYear();

    let budgets = await ctx.db
      .query("budgets")
      .withIndex("byFiscalYear", (q) => q.eq("fiscalYear", fiscalYear))
      .collect();

    if (args.departmentId) {
      budgets = budgets.filter(budget => budget.departmentId === args.departmentId);
    }

    const comparison = await Promise.all(
      budgets.map(async (budget) => {
        const department = await ctx.db.get(budget.departmentId);
        
        return {
          department: department ? { name: department.name, code: department.code } : null,
          fiscalPeriod: budget.fiscalPeriod,
          budgeted: budget.totalBudget,
          spent: budget.spentAmount,
          remaining: budget.remainingAmount,
          utilization: (budget.spentAmount / budget.totalBudget) * 100,
          variance: budget.budgetVariance || 0,
          status: budget.status,
        };
      })
    );

    return comparison.sort((a, b) => b.utilization - a.utilization);
  },
});

// Get top categories by spending
export const getTopCategories = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    dateRange: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
    limit: v.optional(v.number()),
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let records = await ctx.db
      .query("financial_records")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range
    records = records.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(args.dateRange.startDate);
      const end = new Date(args.dateRange.endDate);
      return recordDate >= start && recordDate <= end;
    });

    // Filter by department and type
    if (args.departmentId) {
      records = records.filter(record => record.departmentId === args.departmentId);
    }

    if (args.type) {
      records = records.filter(record => record.type === args.type);
    }

    // Group by category
    const categoryTotals: Record<string, { total: number; count: number; avgAmount: number }> = {};

    records.forEach(record => {
      if (!categoryTotals[record.category]) {
        categoryTotals[record.category] = { total: 0, count: 0, avgAmount: 0 };
      }
      categoryTotals[record.category].total += record.amount;
      categoryTotals[record.category].count += 1;
    });

    // Calculate averages and sort
    const categories = Object.entries(categoryTotals)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        avgAmount: data.total / data.count,
        percentage: 0, // Will be calculated below
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    // Calculate percentages
    const grandTotal = categories.reduce((sum, cat) => sum + cat.total, 0);
    categories.forEach(cat => {
      cat.percentage = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
    });

    return categories;
  },
});

// Get alert summary for dashboard
export const getAlertSummary = query({
  args: {
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    // Get user's alerts
    let userAlerts = await ctx.db
      .query("alerts")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get recent alert logs
    const recentLogs = await ctx.db
      .query("alert_logs")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    // Get department alerts if specified
    let departmentAlerts: any[] = [];
    if (args.departmentId) {
      departmentAlerts = await ctx.db
        .query("alerts")
        .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }

    const summary = {
      userAlerts: userAlerts.length,
      departmentAlerts: departmentAlerts.length,
      recentTriggered: recentLogs.filter(log => {
        const logDate = new Date(log.triggeredAt);
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return logDate >= dayAgo;
      }).length,
      unacknowledged: recentLogs.filter(log => log.status === "sent").length,
      alertsByType: {} as Record<string, number>,
      criticalAlerts: [] as any[],
    };

    // Count alerts by type
    [...userAlerts, ...departmentAlerts].forEach(alert => {
      summary.alertsByType[alert.type] = (summary.alertsByType[alert.type] || 0) + 1;
    });

    // Get critical alerts (budget overruns, etc.)
    summary.criticalAlerts = recentLogs
      .filter(log => log.message.includes("overrun") || log.triggerValue >= log.threshold * 1.2)
      .slice(0, 5)
      .map(log => ({
        message: log.message,
        triggeredAt: log.triggeredAt,
        severity: "critical",
      }));

    return summary;
  },
});

// Get department comparison metrics
export const getDepartmentComparison = query({
  args: {
    dateRange: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
    metric: v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("profit"),
      v.literal("budget_utilization")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const departments = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const comparison = await Promise.all(
      departments.map(async (dept) => {
        // Get financial records for this department
        const records = await ctx.db
          .query("financial_records")
          .withIndex("byDepartment", (q) => q.eq("departmentId", dept._id))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect();

        const filteredRecords = records.filter((record) => {
          const recordDate = new Date(record.date);
          const start = new Date(args.dateRange.startDate);
          const end = new Date(args.dateRange.endDate);
          return recordDate >= start && recordDate <= end;
        });

        const revenue = filteredRecords
          .filter(r => r.type === "income")
          .reduce((sum, r) => sum + r.amount, 0);
        
        const expenses = filteredRecords
          .filter(r => r.type === "expense")
          .reduce((sum, r) => sum + r.amount, 0);

        const profit = revenue - expenses;

        // Get budget utilization
        const currentYear = new Date().getFullYear();
        const budget = await ctx.db
          .query("budgets")
          .withIndex("byDepartmentYear", (q) => 
            q.eq("departmentId", dept._id).eq("fiscalYear", currentYear)
          )
          .filter((q) => q.eq(q.field("status"), "active"))
          .first();

        const budgetUtilization = budget ? (budget.spentAmount / budget.totalBudget) * 100 : 0;

        let metricValue: number;
        switch (args.metric) {
          case "revenue":
            metricValue = revenue;
            break;
          case "expenses":
            metricValue = expenses;
            break;
          case "profit":
            metricValue = profit;
            break;
          case "budget_utilization":
            metricValue = budgetUtilization;
            break;
          default:
            metricValue = 0;
        }

        return {
          department: { name: dept.name, code: dept.code },
          revenue,
          expenses,
          profit,
          budgetUtilization,
          metricValue,
          transactionCount: filteredRecords.length,
        };
      })
    );

    // Sort by metric value and limit results
    return comparison
      .sort((a, b) => b.metricValue - a.metricValue)
      .slice(0, limit);
  },
});

// Get financial health score
export const getFinancialHealthScore = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    dateRange: v.object({
      startDate: v.string(),
      endDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Calculate various financial health indicators
    let records = await ctx.db
      .query("financial_records")
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range and department
    records = records.filter((record) => {
      const recordDate = new Date(record.date);
      const start = new Date(args.dateRange.startDate);
      const end = new Date(args.dateRange.endDate);
      const inDateRange = recordDate >= start && recordDate <= end;
      const inDepartment = !args.departmentId || record.departmentId === args.departmentId;
      return inDateRange && inDepartment;
    });

    const revenue = records.filter(r => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
    const expenses = records.filter(r => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Get budget data
    const currentYear = new Date().getFullYear();
    let budgets = await ctx.db
      .query("budgets")
      .withIndex("byFiscalYear", (q) => q.eq("fiscalYear", currentYear))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (args.departmentId) {
      budgets = budgets.filter(budget => budget.departmentId === args.departmentId);
    }

    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    // Calculate health score components (0-100 each)
    const profitabilityScore = Math.max(0, Math.min(100, profitMargin + 50)); // -50% to +50% margin maps to 0-100
    const budgetControlScore = Math.max(0, 100 - Math.max(0, budgetUtilization - 85)); // Penalty for >85% utilization
    const growthScore = 75; // Placeholder - would need historical comparison
    const efficiencyScore = revenue > 0 ? Math.min(100, (profit / expenses) * 50 + 50) : 50;

    const overallScore = (profitabilityScore + budgetControlScore + growthScore + efficiencyScore) / 4;

    // Determine health status
    let healthStatus: string;
    let healthColor: string;
    
    if (overallScore >= 80) {
      healthStatus = "Excellent";
      healthColor = "green";
    } else if (overallScore >= 60) {
      healthStatus = "Good";
      healthColor = "blue";
    } else if (overallScore >= 40) {
      healthStatus = "Fair";
      healthColor = "yellow";
    } else {
      healthStatus = "Poor";
      healthColor = "red";
    }

    return {
      overallScore: Math.round(overallScore),
      healthStatus,
      healthColor,
      components: {
        profitability: Math.round(profitabilityScore),
        budgetControl: Math.round(budgetControlScore),
        growth: Math.round(growthScore),
        efficiency: Math.round(efficiencyScore),
      },
      metrics: {
        revenue,
        expenses,
        profit,
        profitMargin,
        budgetUtilization,
      },
      recommendations: generateHealthRecommendations(overallScore, profitMargin, budgetUtilization),
    };
  },
});

// Helper function to generate health recommendations
function generateHealthRecommendations(score: number, profitMargin: number, budgetUtilization: number): string[] {
  const recommendations: string[] = [];

  if (score < 60) {
    recommendations.push("Overall financial health needs improvement. Review key metrics and implement corrective measures.");
  }

  if (profitMargin < 10) {
    recommendations.push("Low profit margins detected. Consider cost reduction or revenue optimization strategies.");
  }

  if (budgetUtilization > 90) {
    recommendations.push("High budget utilization. Monitor spending closely and consider budget adjustments.");
  }

  if (profitMargin < 0) {
    recommendations.push("Negative profit margins require immediate attention. Analyze cost structure and pricing strategy.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Financial health is good. Continue monitoring key metrics and maintain current strategies.");
  }

  return recommendations;
}