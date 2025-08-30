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

  help: defineTable({
    needHelp: v.boolean(),
    description: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  }),

  // Departments table: Stark Industries departments
  departments: defineTable({
    name: v.string(), // e.g., "Tech Innovation", "Energy Production", "R&D"
    code: v.string(), // e.g., "TECH", "ENERGY", "RD"
    description: v.optional(v.string()),
    managerId: v.optional(v.id("users")),
    budgetLimit: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("byCode", ["code"])
    .index("byManager", ["managerId"]),

  // Financial Records table: core financial transactions and data
  financial_records: defineTable({
    // Basic transaction info
    transactionId: v.string(), // Unique transaction identifier
    date: v.string(), // ISO date string
    departmentId: v.id("departments"),

    // Financial data
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("transfer")
    ),
    category: v.string(), // e.g., "Salary", "Equipment", "Research", "Marketing"
    subcategory: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()), // Default USD

    // Additional details
    description: v.string(),
    reference: v.optional(v.string()), // Invoice number, PO number, etc.
    vendor: v.optional(v.string()),
    project: v.optional(v.string()),

    // Status and tracking
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    approvedBy: v.optional(v.id("users")),
    createdBy: v.id("users"),

    // Metadata
    tags: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.string())), // File URLs
  })
    .index("byDepartment", ["departmentId"])
    .index("byDate", ["date"])
    .index("byType", ["type"])
    .index("byCategory", ["category"])
    .index("byStatus", ["status"])
    .index("byCreatedBy", ["createdBy"])
    .index("byDateDepartment", ["date", "departmentId"]),

  // Budgets table: department budget allocations and tracking
  budgets: defineTable({
    departmentId: v.id("departments"),
    fiscalYear: v.number(), // e.g., 2024
    fiscalPeriod: v.string(), // e.g., "Q1", "Q2", "Annual"

    // Budget allocations
    totalBudget: v.number(),
    allocatedAmount: v.number(),
    spentAmount: v.number(),
    remainingAmount: v.number(),

    // Category-wise breakdown
    categoryBreakdown: v.optional(
      v.array(
        v.object({
          category: v.string(),
          budgeted: v.number(),
          spent: v.number(),
          remaining: v.number(),
        })
      )
    ),

    // Status and tracking
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("closed")
    ),
    approvedBy: v.optional(v.id("users")),
    createdBy: v.id("users"),
    lastUpdated: v.string(),

    // Variance tracking
    budgetVariance: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("byDepartment", ["departmentId"])
    .index("byFiscalYear", ["fiscalYear"])
    .index("byStatus", ["status"])
    .index("byDepartmentYear", ["departmentId", "fiscalYear"]),

  // Alerts table: custom notifications and triggers
  alerts: defineTable({
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),

    // Alert configuration
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("budget_overrun"),
      v.literal("revenue_drop"),
      v.literal("expense_spike"),
      v.literal("threshold_breach"),
      v.literal("custom")
    ),

    // Trigger conditions
    triggerConditions: v.object({
      metric: v.string(), // e.g., "budget_utilization", "revenue", "expenses"
      operator: v.union(
        v.literal(">"),
        v.literal("<"),
        v.literal(">="),
        v.literal("<="),
        v.literal("=")
      ),
      threshold: v.number(),
      timeframe: v.optional(v.string()), // e.g., "daily", "weekly", "monthly"
    }),

    // Notification settings
    isActive: v.boolean(),
    frequency: v.union(
      v.literal("immediate"),
      v.literal("daily"),
      v.literal("weekly")
    ),
    notificationMethod: v.array(
      v.union(v.literal("dashboard"), v.literal("email"), v.literal("webhook"))
    ),

    // Status tracking
    lastTriggered: v.optional(v.string()),
    triggerCount: v.optional(v.number()),
    createdAt: v.string(),
  })
    .index("byUser", ["userId"])
    .index("byDepartment", ["departmentId"])
    .index("byType", ["type"])
    .index("byActive", ["isActive"]),

  // Alert Logs table: history of triggered alerts
  alert_logs: defineTable({
    alertId: v.id("alerts"),
    userId: v.id("users"),
    departmentId: v.optional(v.id("departments")),

    triggeredAt: v.string(),
    triggerValue: v.number(),
    threshold: v.number(),
    message: v.string(),

    status: v.union(
      v.literal("sent"),
      v.literal("failed"),
      v.literal("acknowledged")
    ),
    acknowledgedBy: v.optional(v.id("users")),
    acknowledgedAt: v.optional(v.string()),
  })
    .index("byAlert", ["alertId"])
    .index("byUser", ["userId"])
    .index("byTriggeredAt", ["triggeredAt"])
    .index("byStatus", ["status"]),

  // Reports table: generated reports and exports
  reports: defineTable({
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

    // Report parameters
    parameters: v.object({
      dateRange: v.object({
        startDate: v.string(),
        endDate: v.string(),
      }),
      departments: v.optional(v.array(v.id("departments"))),
      categories: v.optional(v.array(v.string())),
      metrics: v.optional(v.array(v.string())),
    }),

    // Generated content
    data: v.optional(v.any()), // JSON data for the report
    fileUrl: v.optional(v.string()), // URL to exported file (PDF, Excel, etc.)
    chartUrls: v.optional(v.array(v.string())), // URLs to chart images

    // Metadata
    generatedBy: v.id("users"),
    generatedAt: v.string(),
    format: v.union(
      v.literal("pdf"),
      v.literal("excel"),
      v.literal("json"),
      v.literal("csv")
    ),
    size: v.optional(v.number()), // File size in bytes

    // Sharing and access
    isPublic: v.boolean(),
    sharedWith: v.optional(v.array(v.id("users"))),
    scheduledRecurrence: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"))
    ),

    // Status
    status: v.union(
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("expired")
    ),
    expiresAt: v.optional(v.string()),
  })
    .index("byGeneratedBy", ["generatedBy"])
    .index("byType", ["type"])
    .index("byGeneratedAt", ["generatedAt"])
    .index("byStatus", ["status"])
    .index("byPublic", ["isPublic"]),

  // Forecasts table: AI-powered predictions and trends
  forecasts: defineTable({
    departmentId: v.id("departments"),
    type: v.union(
      v.literal("revenue"),
      v.literal("expenses"),
      v.literal("budget_utilization"),
      v.literal("cash_flow")
    ),

    // Forecast data
    baseDate: v.string(), // Date from which forecast starts
    forecastPeriod: v.number(), // Number of periods (days/months) forecasted
    periodType: v.union(
      v.literal("days"),
      v.literal("weeks"),
      v.literal("months")
    ),

    predictions: v.array(
      v.object({
        period: v.string(),
        predictedValue: v.number(),
        confidence: v.number(), // 0-1 confidence score
        lowerBound: v.optional(v.number()),
        upperBound: v.optional(v.number()),
      })
    ),

    // Model information
    algorithm: v.optional(v.string()),
    accuracy: v.optional(v.number()),
    trainingDataSize: v.optional(v.number()),

    // Metadata
    generatedBy: v.id("users"),
    generatedAt: v.string(),
    isActive: v.boolean(),
  })
    .index("byDepartment", ["departmentId"])
    .index("byType", ["type"])
    .index("byGeneratedAt", ["generatedAt"])
    .index("byActive", ["isActive"]),

  // Accounts table: organizational accounts for staff members
  accounts: defineTable({
    // Account identification
    accountName: v.string(), // e.g., "Main Operating Account", "Petty Cash", "R&D Fund"
    accountNumber: v.string(), // Unique account identifier
    accountType: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("petty_cash"),
      v.literal("investment"),
      v.literal("project_fund"),
      v.literal("emergency_fund"),
      v.literal("operational")
    ),

    // Ownership and access
    userId: v.id("users"), // Primary account holder/manager
    departmentId: v.id("departments"), // Department this account belongs to
    sharedWith: v.optional(v.array(v.id("users"))), // Other users with access

    // Financial information
    currentBalance: v.number(),
    initialBalance: v.number(),
    currency: v.optional(v.string()), // Default USD

    // Account limits and controls
    dailyLimit: v.optional(v.number()),
    monthlyLimit: v.optional(v.number()),
    minimumBalance: v.optional(v.number()),
    overdraftLimit: v.optional(v.number()),

    // Account details
    description: v.optional(v.string()),
    bankName: v.optional(v.string()),
    routingNumber: v.optional(v.string()),

    // Status and tracking
    isActive: v.boolean(),
    isLocked: v.optional(v.boolean()),
    lockReason: v.optional(v.string()),
    lastTransactionDate: v.optional(v.string()),

    // Metadata
    createdBy: v.id("users"),
    createdAt: v.string(),
    lastUpdated: v.string(),
    tags: v.optional(v.array(v.string())),

    // Permissions
    permissions: v.optional(
      v.object({
        canView: v.array(v.id("users")),
        canDeposit: v.array(v.id("users")),
        canWithdraw: v.array(v.id("users")),
        canTransfer: v.array(v.id("users")),
        canManage: v.array(v.id("users")),
      })
    ),
  })
    .index("byUser", ["userId"])
    .index("byDepartment", ["departmentId"])
    .index("byAccountNumber", ["accountNumber"])
    .index("byType", ["accountType"])
    .index("byActive", ["isActive"])
    .index("byUserDepartment", ["userId", "departmentId"]),

  // Account Transactions table: track all account movements
  account_transactions: defineTable({
    accountId: v.id("accounts"),

    // Transaction details
    transactionId: v.string(), // Unique transaction ID
    type: v.union(
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("transfer_in"),
      v.literal("transfer_out"),
      v.literal("fee"),
      v.literal("interest"),
      v.literal("adjustment")
    ),

    // Amounts and balance
    amount: v.number(),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    currency: v.optional(v.string()),

    // Transaction metadata
    description: v.string(),
    category: v.optional(v.string()),
    reference: v.optional(v.string()), // Check number, invoice, etc.

    // Related records
    relatedFinancialRecordId: v.optional(v.id("financial_records")),
    relatedAccountId: v.optional(v.id("accounts")), // For transfers

    // Authorization
    authorizedBy: v.id("users"),
    approvedBy: v.optional(v.id("users")),

    // Status and timing
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    transactionDate: v.string(),
    processedAt: v.optional(v.string()),

    // Additional info
    notes: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  })
    .index("byAccount", ["accountId"])
    .index("byTransactionId", ["transactionId"])
    .index("byType", ["type"])
    .index("byStatus", ["status"])
    .index("byDate", ["transactionDate"])
    .index("byAuthorizedBy", ["authorizedBy"])
    .index("byAccountDate", ["accountId", "transactionDate"]),
});
