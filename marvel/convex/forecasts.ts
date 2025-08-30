import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new forecast
export const createForecast = mutation({
  args: {
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    ),
    baseDate: v.string(),
    forecastPeriod: v.number(),
    periodType: v.union(v.literal("days"), v.literal("weeks"), v.literal("months")),
    predictions: v.array(v.object({
      period: v.string(),
      predictedValue: v.number(),
      confidence: v.number(),
      lowerBound: v.optional(v.number()),
      upperBound: v.optional(v.number()),
    })),
    algorithm: v.optional(v.string()),
    accuracy: v.optional(v.number()),
    trainingDataSize: v.optional(v.number()),
    generatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const forecastId = await ctx.db.insert("forecasts", {
      ...args,
      generatedAt: new Date().toISOString(),
      isActive: true,
    });

    return forecastId;
  },
});

// Generate forecast based on historical data
export const generateForecast = mutation({
  args: {
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    ),
    forecastPeriod: v.number(),
    periodType: v.union(v.literal("days"), v.literal("weeks"), v.literal("months")),
    generatedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get historical financial data for the department
    const historicalRecords = await ctx.db
      .query("financial_records")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Sort by date
    historicalRecords.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (historicalRecords.length < 3) {
      throw new Error("Insufficient historical data for forecasting. Need at least 3 data points.");
    }

    // Generate forecast using simple linear regression and moving average
    const predictions = generatePredictions(
      historicalRecords,
      args.type,
      args.forecastPeriod,
      args.periodType
    );

    const forecastId = await ctx.db.insert("forecasts", {
      departmentId: args.departmentId,
      type: args.type,
      baseDate: new Date().toISOString(),
      forecastPeriod: args.forecastPeriod,
      periodType: args.periodType,
      predictions,
      algorithm: "Linear Regression + Moving Average",
      accuracy: calculateAccuracy(predictions),
      trainingDataSize: historicalRecords.length,
      generatedBy: args.generatedBy,
      generatedAt: new Date().toISOString(),
      isActive: true,
    });

    return forecastId;
  },
});

// Helper function to generate predictions
function generatePredictions(
  historicalRecords: any[],
  type: string,
  forecastPeriod: number,
  periodType: string
): any[] {
  // Group data by period (monthly for simplicity)
  const monthlyData: Record<string, number> = {};
  
  historicalRecords.forEach(record => {
    const month = record.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }
    
    if (type === "revenue" && record.type === "income") {
      monthlyData[month] += record.amount;
    } else if (type === "expenses" && record.type === "expense") {
      monthlyData[month] += record.amount;
    } else if (type === "cash_flow") {
      if (record.type === "income") {
        monthlyData[month] += record.amount;
      } else if (record.type === "expense") {
        monthlyData[month] -= record.amount;
      }
    }
  });

  const dataPoints = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, value }));

  if (dataPoints.length === 0) {
    return [];
  }

  // Simple trend calculation
  const values = dataPoints.map(d => d.value);
  const trend = calculateTrend(values);
  const lastValue = values[values.length - 1];
  const movingAverage = calculateMovingAverage(values, Math.min(3, values.length));

  const predictions: any[] = [];
  const baseDate = new Date();

  for (let i = 1; i <= forecastPeriod; i++) {
    const futureDate = new Date(baseDate);
    
    if (periodType === "months") {
      futureDate.setMonth(baseDate.getMonth() + i);
    } else if (periodType === "weeks") {
      futureDate.setDate(baseDate.getDate() + (i * 7));
    } else {
      futureDate.setDate(baseDate.getDate() + i);
    }

    // Combine trend and moving average for prediction
    const trendComponent = trend * i;
    const baseValue = movingAverage;
    const predictedValue = Math.max(0, baseValue + trendComponent);
    
    // Add some uncertainty bounds (±20% for simplicity)
    const uncertainty = predictedValue * 0.2;
    const confidence = Math.max(0.6, 1 - (i * 0.1)); // Confidence decreases over time

    predictions.push({
      period: futureDate.toISOString().substring(0, 10), // YYYY-MM-DD
      predictedValue: Math.round(predictedValue * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      lowerBound: Math.max(0, Math.round((predictedValue - uncertainty) * 100) / 100),
      upperBound: Math.round((predictedValue + uncertainty) * 100) / 100,
    });
  }

  return predictions;
}

// Calculate trend using linear regression
function calculateTrend(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const xSum = (n * (n + 1)) / 2;
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xySum = values.reduce((sum, val, index) => sum + val * (index + 1), 0);
  const xxSum = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  return isNaN(slope) ? 0 : slope;
}

// Calculate moving average
function calculateMovingAverage(values: number[], window: number): number {
  if (values.length === 0) return 0;
  const recentValues = values.slice(-window);
  return recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
}

// Calculate forecast accuracy (placeholder implementation)
function calculateAccuracy(predictions: any[]): number {
  // In a real implementation, this would compare predictions with actual values
  // For now, return a reasonable accuracy based on confidence
  const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  return Math.round(avgConfidence * 85 * 100) / 100; // Convert to percentage
}

// Get forecasts by department
export const getForecastsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    type: v.optional(v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let forecasts = await ctx.db
      .query("forecasts")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .collect();

    if (args.type) {
      forecasts = forecasts.filter(f => f.type === args.type);
    }

    if (args.isActive !== undefined) {
      forecasts = forecasts.filter(f => f.isActive === args.isActive);
    }

    const forecastsWithDetails = await Promise.all(
      forecasts.map(async (forecast) => {
        const generator = await ctx.db.get(forecast.generatedBy);
        const department = await ctx.db.get(forecast.departmentId);
        
        return {
          ...forecast,
          generator: generator ? { name: generator.name } : null,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return forecastsWithDetails.sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  },
});

// Get active forecasts
export const getActiveForecasts = query({
  args: {
    type: v.optional(v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let forecasts = await ctx.db
      .query("forecasts")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit);

    if (args.type) {
      forecasts = forecasts.filter(f => f.type === args.type);
    }

    const forecastsWithDetails = await Promise.all(
      forecasts.map(async (forecast) => {
        const department = await ctx.db.get(forecast.departmentId);
        
        return {
          ...forecast,
          department: department ? { name: department.name, code: department.code } : null,
        };
      })
    );

    return forecastsWithDetails;
  },
});

// Get forecast by ID
export const getForecastById = query({
  args: { forecastId: v.id("forecasts") },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId);
    if (!forecast) {
      throw new Error("Forecast not found");
    }

    const generator = await ctx.db.get(forecast.generatedBy);
    const department = await ctx.db.get(forecast.departmentId);
    
    return {
      ...forecast,
      generator: generator ? { name: generator.name, email: generator.emailAddress } : null,
      department: department ? { name: department.name, code: department.code } : null,
    };
  },
});

// Update forecast status
export const updateForecastStatus = mutation({
  args: {
    forecastId: v.id("forecasts"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId);
    if (!forecast) {
      throw new Error("Forecast not found");
    }

    await ctx.db.patch(args.forecastId, {
      isActive: args.isActive,
    });

    return args.forecastId;
  },
});

// Delete forecast
export const deleteForecast = mutation({
  args: { forecastId: v.id("forecasts") },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId);
    if (!forecast) {
      throw new Error("Forecast not found");
    }

    await ctx.db.delete(args.forecastId);
    return args.forecastId;
  },
});

// Get forecast accuracy comparison
export const getForecastAccuracyComparison = query({
  args: {
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    ),
  },
  handler: async (ctx, args) => {
    const forecasts = await ctx.db
      .query("forecasts")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    // Get recent actual data for comparison
    const actualRecords = await ctx.db
      .query("financial_records")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const comparison = {
      forecastCount: forecasts.length,
      averageAccuracy: 0,
      bestForecast: null as any,
      worstForecast: null as any,
      accuracyTrend: [] as any[],
    };

    if (forecasts.length === 0) {
      return comparison;
    }

    // Calculate average accuracy
    const totalAccuracy = forecasts.reduce((sum, f) => sum + (f.accuracy || 0), 0);
    comparison.averageAccuracy = totalAccuracy / forecasts.length;

    // Find best and worst forecasts
    const sortedByAccuracy = [...forecasts].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
    comparison.bestForecast = sortedByAccuracy[0];
    comparison.worstForecast = sortedByAccuracy[sortedByAccuracy.length - 1];

    // Generate accuracy trend over time
    const monthlyAccuracy: Record<string, { total: number; count: number }> = {};
    
    forecasts.forEach(forecast => {
      const month = forecast.generatedAt.substring(0, 7); // YYYY-MM
      if (!monthlyAccuracy[month]) {
        monthlyAccuracy[month] = { total: 0, count: 0 };
      }
      monthlyAccuracy[month].total += forecast.accuracy || 0;
      monthlyAccuracy[month].count += 1;
    });

    comparison.accuracyTrend = Object.entries(monthlyAccuracy)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        period: month,
        accuracy: data.total / data.count,
      }));

    return comparison;
  },
});

// Get forecast insights and recommendations
export const getForecastInsights = query({
  args: {
    departmentId: v.optional(v.id("departments")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    let query = ctx.db.query("forecasts").withIndex("byActive", (q) => q.eq("isActive", true));
    
    let forecasts = await query.take(limit * 2); // Get more to filter if needed

    if (args.departmentId) {
      forecasts = forecasts.filter(f => f.departmentId === args.departmentId);
    }

    const insights = {
      totalForecasts: forecasts.length,
      insights: [] as any[],
      recommendations: [] as string[],
      riskAlerts: [] as any[],
    };

    for (const forecast of forecasts.slice(0, limit)) {
      const department = await ctx.db.get(forecast.departmentId);
      
      // Analyze predictions for insights
      const nearTermPredictions = forecast.predictions.slice(0, 3); // Next 3 periods
      const avgPrediction = nearTermPredictions.reduce((sum, p) => sum + p.predictedValue, 0) / nearTermPredictions.length;
      const avgConfidence = nearTermPredictions.reduce((sum, p) => sum + p.confidence, 0) / nearTermPredictions.length;

      const insight = {
        department: department ? { name: department.name, code: department.code } : null,
        type: forecast.type,
        trend: avgPrediction > 0 ? "increasing" : "decreasing",
        avgPrediction,
        avgConfidence,
        accuracy: forecast.accuracy,
        generatedAt: forecast.generatedAt,
      };

      insights.insights.push(insight);

      // Generate recommendations
      if (forecast.type === "expenses" && avgPrediction > 0) {
        insights.recommendations.push(
          `${department?.name}: Expenses are forecasted to increase. Consider budget review.`
        );
      }

      if (avgConfidence < 0.7) {
        insights.recommendations.push(
          `${department?.name}: Low confidence in ${forecast.type} forecast. More data needed.`
        );
      }

      // Generate risk alerts
      if (forecast.type === "cash_flow" && avgPrediction < 0) {
        insights.riskAlerts.push({
          department: department?.name,
          type: "cash_flow_negative",
          message: "Negative cash flow predicted",
          severity: "high",
        });
      }

      if (forecast.type === "budget_utilization" && avgPrediction > 90) {
        insights.riskAlerts.push({
          department: department?.name,
          type: "budget_overrun",
          message: "Budget overrun risk detected",
          severity: "medium",
        });
      }
    }

    return insights;
  },
});