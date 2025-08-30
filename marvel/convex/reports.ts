import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new report
export const createReport = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("financial_summary"),
      v.literal("budget_analysis"),
      v.literal("department_performance"),
      v.literal("trend_analysis"),
      v.literal("forecast_report"),
      v.literal("custom")
    ),
    parameters: v.object({
      dateRange: v.object({
        startDate: v.string(),
        endDate: v.string(),
      }),
      departments: v.optional(v.array(v.id("departments"))),
      categories: v.optional(v.array(v.string())),
      metrics: v.optional(v.array(v.string())),
    }),
    format: v.union(v.literal("pdf"), v.literal("excel"), v.literal("json"), v.literal("csv")),
    generatedBy: v.id("users"),
    isPublic: v.optional(v.boolean()),
    sharedWith: v.optional(v.array(v.id("users"))),
    scheduledRecurrence: v.optional(v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("reports", {
      ...args,
      isPublic: args.isPublic || false,
      status: "generating",
      generatedAt: new Date().toISOString(),
    });

    // Generate report data based on type and parameters
    const reportData = await generateReportData(ctx, args.type, args.parameters);

    // Update report with generated data
    await ctx.db.patch(reportId, {
      data: reportData,
      status: "completed",
      size: JSON.stringify(reportData).length, // Approximate size in bytes
    });

    return reportId;
  },
});

// Generate report data based on type and parameters
async function generateReportData(ctx: any, type: string, parameters: any) {
  const { dateRange, departments, categories, metrics } = parameters;

  switch (type) {
    case "financial_summary":
      return await generateFinancialSummary(ctx, dateRange, departments);
    case "budget_analysis":
      return await generateBudgetAnalysis(ctx, dateRange, departments);
    case "department_performance":
      return await generateDepartmentPerformance(ctx, dateRange, departments);
    case "trend_analysis":
      return await generateTrendAnalysis(ctx, dateRange, departments, metrics);
    default:
      return { message: "Report type not implemented" };
  }
}

// Generate financial summary report
async function generateFinancialSummary(ctx: any, dateRange: any, departmentIds?: string[]) {
  let financialRecords = await ctx.db
    .query("financial_records")
    .filter((q: any) => q.eq(q.field("status"), "completed"))
    .collect();

  // Filter by date range
  financialRecords = financialRecords.filter((record: any) => {
    const recordDate = new Date(record.date);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return recordDate >= start && recordDate <= end;
  });

  // Filter by departments if specified
  if (departmentIds && departmentIds.length > 0) {
    financialRecords = financialRecords.filter((record: any) =>
      departmentIds.includes(record.departmentId)
    );
  }

  const summary = {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: financialRecords.length,
    categoryBreakdown: {} as Record<string, { income: number; expenses: number; net: number }>,
    departmentBreakdown: {} as Record<string, { income: number; expenses: number; net: number }>,
    monthlyTrends: {} as Record<string, { income: number; expenses: number; net: number }>,
  };

  // Process records
  for (const record of financialRecords) {
    const amount = record.amount;
    
    if (record.type === "income") {
      summary.totalIncome += amount;
    } else if (record.type === "expense") {
      summary.totalExpenses += amount;
    }

    // Category breakdown
    if (!summary.categoryBreakdown[record.category]) {
      summary.categoryBreakdown[record.category] = { income: 0, expenses: 0, net: 0 };
    }
    
    if (record.type === "income") {
      summary.categoryBreakdown[record.category].income += amount;
    } else if (record.type === "expense") {
      summary.categoryBreakdown[record.category].expenses += amount;
    }
    summary.categoryBreakdown[record.category].net = 
      summary.categoryBreakdown[record.category].income - summary.categoryBreakdown[record.category].expenses;

    // Department breakdown
    const department = await ctx.db.get(record.departmentId);
    const deptName = department?.name || "Unknown";
    
    if (!summary.departmentBreakdown[deptName]) {
      summary.departmentBreakdown[deptName] = { income: 0, expenses: 0, net: 0 };
    }
    
    if (record.type === "income") {
      summary.departmentBreakdown[deptName].income += amount;
    } else if (record.type === "expense") {
      summary.departmentBreakdown[deptName].expenses += amount;
    }
    summary.departmentBreakdown[deptName].net = 
      summary.departmentBreakdown[deptName].income - summary.departmentBreakdown[deptName].expenses;

    // Monthly trends
    const month = record.date.substring(0, 7); // YYYY-MM
    if (!summary.monthlyTrends[month]) {
      summary.monthlyTrends[month] = { income: 0, expenses: 0, net: 0 };
    }
    
    if (record.type === "income") {
      summary.monthlyTrends[month].income += amount;
    } else if (record.type === "expense") {
      summary.monthlyTrends[month].expenses += amount;
    }
    summary.monthlyTrends[month].net = 
      summary.monthlyTrends[month].income - summary.monthlyTrends[month].expenses;
  }

  summary.netProfit = summary.totalIncome - summary.totalExpenses;

  return summary;
}

// Generate budget analysis report
async function generateBudgetAnalysis(ctx: any, dateRange: any, departmentIds?: string[]) {
  const currentYear = new Date().getFullYear();
  
  let budgets = await ctx.db
    .query("budgets")
    .withIndex("byFiscalYear", (q: any) => q.eq("fiscalYear", currentYear))
    .collect();

  if (departmentIds && departmentIds.length > 0) {
    budgets = budgets.filter((budget: any) => departmentIds.includes(budget.departmentId));
  }

  const analysis = {
    totalBudgeted: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallUtilization: 0,
    budgetsByDepartment: [] as any[],
    budgetsByPeriod: {} as Record<string, { budgeted: number; spent: number; utilization: number }>,
    alertsTriggered: 0,
  };

  for (const budget of budgets) {
    const department = await ctx.db.get(budget.departmentId);
    const utilizationPercentage = (budget.spentAmount / budget.totalBudget) * 100;

    analysis.totalBudgeted += budget.totalBudget;
    analysis.totalSpent += budget.spentAmount;
    analysis.totalRemaining += budget.remainingAmount;

    analysis.budgetsByDepartment.push({
      department: department?.name || "Unknown",
      fiscalPeriod: budget.fiscalPeriod,
      budgeted: budget.totalBudget,
      spent: budget.spentAmount,
      remaining: budget.remainingAmount,
      utilization: utilizationPercentage,
      status: budget.status,
      variance: budget.budgetVariance || 0,
    });

    // Period breakdown
    if (!analysis.budgetsByPeriod[budget.fiscalPeriod]) {
      analysis.budgetsByPeriod[budget.fiscalPeriod] = { budgeted: 0, spent: 0, utilization: 0 };
    }
    analysis.budgetsByPeriod[budget.fiscalPeriod].budgeted += budget.totalBudget;
    analysis.budgetsByPeriod[budget.fiscalPeriod].spent += budget.spentAmount;

    // Count alerts if over 80% utilization
    if (utilizationPercentage > 80) {
      analysis.alertsTriggered++;
    }
  }

  analysis.overallUtilization = (analysis.totalSpent / analysis.totalBudgeted) * 100;

  // Calculate utilization for each period
  Object.keys(analysis.budgetsByPeriod).forEach(period => {
    const periodData = analysis.budgetsByPeriod[period];
    periodData.utilization = (periodData.spent / periodData.budgeted) * 100;
  });

  return analysis;
}

// Generate department performance report
async function generateDepartmentPerformance(ctx: any, dateRange: any, departmentIds?: string[]) {
  const departments = await ctx.db.query("departments").collect();
  
  const filteredDepartments = departmentIds && departmentIds.length > 0 
    ? departments.filter(dept => departmentIds.includes(dept._id))
    : departments.filter(dept => dept.isActive);

  const performance = {
    departmentCount: filteredDepartments.length,
    departments: [] as any[],
    topPerformers: [] as any[],
    bottomPerformers: [] as any[],
  };

  for (const department of filteredDepartments) {
    // Get financial records for this department
    const records = await ctx.db
      .query("financial_records")
      .withIndex("byDepartment", (q: any) => q.eq("departmentId", department._id))
      .filter((q: any) => q.eq(q.field("status"), "completed"))
      .collect();

    const filteredRecords = records.filter((record: any) => {
      const recordDate = new Date(record.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return recordDate >= start && recordDate <= end;
    });

    const income = filteredRecords
      .filter(r => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);
    
    const expenses = filteredRecords
      .filter(r => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    const netProfit = income - expenses;
    const profitMargin = income > 0 ? (netProfit / income) * 100 : 0;

    // Get current budget
    const currentYear = new Date().getFullYear();
    const budget = await ctx.db
      .query("budgets")
      .withIndex("byDepartmentYear", (q: any) => 
        q.eq("departmentId", department._id).eq("fiscalYear", currentYear)
      )
      .first();

    const deptPerformance = {
      department: {
        id: department._id,
        name: department.name,
        code: department.code,
      },
      income,
      expenses,
      netProfit,
      profitMargin,
      transactionCount: filteredRecords.length,
      budgetUtilization: budget ? (budget.spentAmount / budget.totalBudget) * 100 : 0,
      budgetRemaining: budget ? budget.remainingAmount : 0,
    };

    performance.departments.push(deptPerformance);
  }

  // Sort by net profit for top/bottom performers
  const sortedByProfit = [...performance.departments].sort((a, b) => b.netProfit - a.netProfit);
  performance.topPerformers = sortedByProfit.slice(0, 3);
  performance.bottomPerformers = sortedByProfit.slice(-3).reverse();

  return performance;
}

// Generate trend analysis report
async function generateTrendAnalysis(ctx: any, dateRange: any, departmentIds?: string[], metrics?: string[]) {
  const analysis = {
    dateRange,
    trends: {
      revenue: [] as any[],
      expenses: [] as any[],
      profit: [] as any[],
    },
    growth: {
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitGrowth: 0,
    },
    seasonality: {} as Record<string, any>,
  };

  // Get all financial records in date range
  let records = await ctx.db
    .query("financial_records")
    .filter((q: any) => q.eq(q.field("status"), "completed"))
    .collect();

  records = records.filter((record: any) => {
    const recordDate = new Date(record.date);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return recordDate >= start && recordDate <= end;
  });

  if (departmentIds && departmentIds.length > 0) {
    records = records.filter((record: any) => departmentIds.includes(record.departmentId));
  }

  // Group by month for trends
  const monthlyData = {} as Record<string, { revenue: number; expenses: number; profit: number }>;

  records.forEach((record: any) => {
    const month = record.date.substring(0, 7); // YYYY-MM
    
    if (!monthlyData[month]) {
      monthlyData[month] = { revenue: 0, expenses: 0, profit: 0 };
    }

    if (record.type === "income") {
      monthlyData[month].revenue += record.amount;
    } else if (record.type === "expense") {
      monthlyData[month].expenses += record.amount;
    }
  });

  // Calculate profit and create trend arrays
  Object.keys(monthlyData).sort().forEach(month => {
    const data = monthlyData[month];
    data.profit = data.revenue - data.expenses;

    analysis.trends.revenue.push({ period: month, value: data.revenue });
    analysis.trends.expenses.push({ period: month, value: data.expenses });
    analysis.trends.profit.push({ period: month, value: data.profit });
  });

  // Calculate growth rates (comparing first and last months)
  if (analysis.trends.revenue.length >= 2) {
    const firstRevenue = analysis.trends.revenue[0].value;
    const lastRevenue = analysis.trends.revenue[analysis.trends.revenue.length - 1].value;
    analysis.growth.revenueGrowth = firstRevenue > 0 ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0;

    const firstExpense = analysis.trends.expenses[0].value;
    const lastExpense = analysis.trends.expenses[analysis.trends.expenses.length - 1].value;
    analysis.growth.expenseGrowth = firstExpense > 0 ? ((lastExpense - firstExpense) / firstExpense) * 100 : 0;

    const firstProfit = analysis.trends.profit[0].value;
    const lastProfit = analysis.trends.profit[analysis.trends.profit.length - 1].value;
    analysis.growth.profitGrowth = firstProfit !== 0 ? ((lastProfit - firstProfit) / Math.abs(firstProfit)) * 100 : 0;
  }

  return analysis;
}

// Get reports by user
export const getReportsByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const reports = await ctx.db
      .query("reports")
      .withIndex("byGeneratedBy", (q) => q.eq("generatedBy", args.userId))
      .order("desc")
      .take(limit);

    return reports;
  },
});

// Get public reports
export const getPublicReports = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const reports = await ctx.db
      .query("reports")
      .withIndex("byPublic", (q) => q.eq("isPublic", true))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .take(limit);

    const reportsWithCreator = await Promise.all(
      reports.map(async (report) => {
        const creator = await ctx.db.get(report.generatedBy);
        return {
          ...report,
          creator: creator ? { name: creator.name } : null,
        };
      })
    );

    return reportsWithCreator;
  },
});

// Get report by ID
export const getReportById = query({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    const creator = await ctx.db.get(report.generatedBy);
    
    return {
      ...report,
      creator: creator ? { name: creator.name, email: creator.emailAddress } : null,
    };
  },
});

// Update report sharing settings
export const updateReportSharing = mutation({
  args: {
    reportId: v.id("reports"),
    isPublic: v.optional(v.boolean()),
    sharedWith: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const { reportId, ...updates } = args;
    
    const report = await ctx.db.get(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(reportId, updates);
    return reportId;
  },
});

// Delete report
export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.delete(args.reportId);
    return args.reportId;
  },
});

// Get report statistics
export const getReportStatistics = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let query = ctx.db.query("reports");
    
    if (args.userId) {
      query = query.withIndex("byGeneratedBy", (q) => q.eq("generatedBy", args.userId));
    }

    const reports = await query.collect();

    const statistics = {
      totalReports: reports.length,
      completedReports: reports.filter(r => r.status === "completed").length,
      failedReports: reports.filter(r => r.status === "failed").length,
      publicReports: reports.filter(r => r.isPublic).length,
      reportsByType: {} as Record<string, number>,
      reportsByFormat: {} as Record<string, number>,
      averageSize: 0,
    };

    let totalSize = 0;
    reports.forEach(report => {
      statistics.reportsByType[report.type] = (statistics.reportsByType[report.type] || 0) + 1;
      statistics.reportsByFormat[report.format] = (statistics.reportsByFormat[report.format] || 0) + 1;
      if (report.size) totalSize += report.size;
    });

    statistics.averageSize = reports.length > 0 ? totalSize / reports.length : 0;

    return statistics;
  },
});