import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new account
export const createAccount = mutation({
  args: {
    accountName: v.string(),
    accountNumber: v.string(),
    accountType: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("petty_cash"),
      v.literal("investment"),
      v.literal("project_fund"),
      v.literal("emergency_fund"),
      v.literal("operational")
    ),
    userId: v.id("users"),
    departmentId: v.id("departments"),
    initialBalance: v.number(),
    currency: v.optional(v.string()),
    dailyLimit: v.optional(v.number()),
    monthlyLimit: v.optional(v.number()),
    minimumBalance: v.optional(v.number()),
    overdraftLimit: v.optional(v.number()),
    description: v.optional(v.string()),
    bankName: v.optional(v.string()),
    routingNumber: v.optional(v.string()),
    sharedWith: v.optional(v.array(v.id("users"))),
    createdBy: v.id("users"),
    permissions: v.optional(v.object({
      canView: v.array(v.id("users")),
      canDeposit: v.array(v.id("users")),
      canWithdraw: v.array(v.id("users")),
      canTransfer: v.array(v.id("users")),
      canManage: v.array(v.id("users")),
    })),
  },
  handler: async (ctx, args) => {
    // Check if account number already exists
    const existingAccount = await ctx.db
      .query("accounts")
      .withIndex("byAccountNumber", (q) => q.eq("accountNumber", args.accountNumber))
      .first();

    if (existingAccount) {
      throw new Error(`Account with number "${args.accountNumber}" already exists`);
    }

    const accountId = await ctx.db.insert("accounts", {
      ...args,
      currentBalance: args.initialBalance,
      currency: args.currency || "USD",
      isActive: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    // Create initial transaction record
    if (args.initialBalance > 0) {
      await ctx.db.insert("account_transactions", {
        accountId,
        transactionId: `INIT-${accountId}`,
        type: "deposit",
        amount: args.initialBalance,
        balanceBefore: 0,
        balanceAfter: args.initialBalance,
        currency: args.currency || "USD",
        description: "Initial account balance",
        authorizedBy: args.createdBy,
        status: "completed",
        transactionDate: new Date().toISOString(),
        processedAt: new Date().toISOString(),
      });
    }

    return accountId;
  },
});

// Get accounts by user
export const getAccountsByUser = query({
  args: {
    userId: v.id("users"),
    includeShared: v.optional(v.boolean()),
    accountType: v.optional(v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("petty_cash"),
      v.literal("investment"),
      v.literal("project_fund"),
      v.literal("emergency_fund"),
      v.literal("operational")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get accounts owned by user
    let ownedAccounts = await ctx.db
      .query("accounts")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    let accounts = ownedAccounts;

    // Include shared accounts if requested
    if (args.includeShared) {
      const allAccounts = await ctx.db.query("accounts").collect();
      const sharedAccounts = allAccounts.filter(account =>
        account.sharedWith?.includes(args.userId) ||
        account.permissions?.canView?.includes(args.userId)
      );
      
      // Combine and deduplicate
      const accountIds = new Set(accounts.map(a => a._id));
      const uniqueSharedAccounts = sharedAccounts.filter(a => !accountIds.has(a._id));
      accounts = [...accounts, ...uniqueSharedAccounts];
    }

    // Apply filters
    if (args.accountType) {
      accounts = accounts.filter(account => account.accountType === args.accountType);
    }

    if (args.isActive !== undefined) {
      accounts = accounts.filter(account => account.isActive === args.isActive);
    }

    // Get additional details
    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        const owner = await ctx.db.get(account.userId);
        const department = await ctx.db.get(account.departmentId);
        const creator = await ctx.db.get(account.createdBy);
        
        // Get recent transaction count
        const recentTransactions = await ctx.db
          .query("account_transactions")
          .withIndex("byAccount", (q) => q.eq("accountId", account._id))
          .order("desc")
          .take(5);

        return {
          ...account,
          owner: owner ? { name: owner.name, email: owner.emailAddress } : null,
          department: department ? { name: department.name, code: department.code } : null,
          creator: creator ? { name: creator.name } : null,
          recentTransactionCount: recentTransactions.length,
          lastTransactionAmount: recentTransactions[0]?.amount || 0,
        };
      })
    );

    return accountsWithDetails.sort((a, b) => b.currentBalance - a.currentBalance);
  },
});

// Get accounts by department
export const getAccountsByDepartment = query({
  args: {
    departmentId: v.id("departments"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let accounts = await ctx.db
      .query("accounts")
      .withIndex("byDepartment", (q) => q.eq("departmentId", args.departmentId))
      .collect();

    if (args.isActive !== undefined) {
      accounts = accounts.filter(account => account.isActive === args.isActive);
    }

    const accountsWithDetails = await Promise.all(
      accounts.map(async (account) => {
        const owner = await ctx.db.get(account.userId);
        
        return {
          ...account,
          owner: owner ? { name: owner.name, email: owner.emailAddress } : null,
        };
      })
    );

    return accountsWithDetails;
  },
});

// Get account by ID with full details
export const getAccountById = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    const owner = await ctx.db.get(account.userId);
    const department = await ctx.db.get(account.departmentId);
    const creator = await ctx.db.get(account.createdBy);

    // Get shared users details
    let sharedUsers = [];
    if (account.sharedWith) {
      sharedUsers = await Promise.all(
        account.sharedWith.map(async (userId) => {
          const user = await ctx.db.get(userId);
          return user ? { id: userId, name: user.name, email: user.emailAddress } : null;
        })
      );
      sharedUsers = sharedUsers.filter(Boolean);
    }

    // Get recent transactions
    const recentTransactions = await ctx.db
      .query("account_transactions")
      .withIndex("byAccount", (q) => q.eq("accountId", args.accountId))
      .order("desc")
      .take(10);

    return {
      ...account,
      owner: owner ? { name: owner.name, email: owner.emailAddress } : null,
      department: department ? { name: department.name, code: department.code } : null,
      creator: creator ? { name: creator.name } : null,
      sharedUsers,
      recentTransactions,
    };
  },
});

// Update account
export const updateAccount = mutation({
  args: {
    accountId: v.id("accounts"),
    accountName: v.optional(v.string()),
    dailyLimit: v.optional(v.number()),
    monthlyLimit: v.optional(v.number()),
    minimumBalance: v.optional(v.number()),
    overdraftLimit: v.optional(v.number()),
    description: v.optional(v.string()),
    sharedWith: v.optional(v.array(v.id("users"))),
    permissions: v.optional(v.object({
      canView: v.array(v.id("users")),
      canDeposit: v.array(v.id("users")),
      canWithdraw: v.array(v.id("users")),
      canTransfer: v.array(v.id("users")),
      canManage: v.array(v.id("users")),
    })),
  },
  handler: async (ctx, args) => {
    const { accountId, ...updates } = args;
    
    const account = await ctx.db.get(accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(accountId, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });

    return accountId;
  },
});

// Lock/unlock account
export const toggleAccountLock = mutation({
  args: {
    accountId: v.id("accounts"),
    isLocked: v.boolean(),
    lockReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(args.accountId, {
      isLocked: args.isLocked,
      lockReason: args.lockReason,
      lastUpdated: new Date().toISOString(),
    });

    return args.accountId;
  },
});

// Deactivate account (soft delete)
export const deactivateAccount = mutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    await ctx.db.patch(args.accountId, {
      isActive: false,
      lastUpdated: new Date().toISOString(),
    });

    return args.accountId;
  },
});

// Make a deposit
export const makeDeposit = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    reference: v.optional(v.string()),
    authorizedBy: v.id("users"),
    relatedFinancialRecordId: v.optional(v.id("financial_records")),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.isActive || account.isLocked) {
      throw new Error("Account is not available for transactions");
    }

    if (args.amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const balanceBefore = account.currentBalance;
    const balanceAfter = balanceBefore + args.amount;

    // Create transaction record
    const transactionId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transactionRecordId = await ctx.db.insert("account_transactions", {
      accountId: args.accountId,
      transactionId,
      type: "deposit",
      amount: args.amount,
      balanceBefore,
      balanceAfter,
      currency: account.currency,
      description: args.description,
      category: args.category,
      reference: args.reference,
      relatedFinancialRecordId: args.relatedFinancialRecordId,
      authorizedBy: args.authorizedBy,
      status: "completed",
      transactionDate: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    // Update account balance
    await ctx.db.patch(args.accountId, {
      currentBalance: balanceAfter,
      lastTransactionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    return transactionRecordId;
  },
});

// Make a withdrawal
export const makeWithdrawal = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    reference: v.optional(v.string()),
    authorizedBy: v.id("users"),
    relatedFinancialRecordId: v.optional(v.id("financial_records")),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.isActive || account.isLocked) {
      throw new Error("Account is not available for transactions");
    }

    if (args.amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    const balanceBefore = account.currentBalance;
    const balanceAfter = balanceBefore - args.amount;

    // Check minimum balance and overdraft limits
    const minimumAllowed = (account.minimumBalance || 0) - (account.overdraftLimit || 0);
    if (balanceAfter < minimumAllowed) {
      throw new Error(`Insufficient funds. Minimum allowed balance is ${minimumAllowed}`);
    }

    // Create transaction record
    const transactionId = `WDR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const transactionRecordId = await ctx.db.insert("account_transactions", {
      accountId: args.accountId,
      transactionId,
      type: "withdrawal",
      amount: args.amount,
      balanceBefore,
      balanceAfter,
      currency: account.currency,
      description: args.description,
      category: args.category,
      reference: args.reference,
      relatedFinancialRecordId: args.relatedFinancialRecordId,
      authorizedBy: args.authorizedBy,
      status: "completed",
      transactionDate: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    // Update account balance
    await ctx.db.patch(args.accountId, {
      currentBalance: balanceAfter,
      lastTransactionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    return transactionRecordId;
  },
});

// Transfer between accounts
export const transferFunds = mutation({
  args: {
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    reference: v.optional(v.string()),
    authorizedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const fromAccount = await ctx.db.get(args.fromAccountId);
    const toAccount = await ctx.db.get(args.toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error("One or both accounts not found");
    }

    if (!fromAccount.isActive || fromAccount.isLocked || !toAccount.isActive || toAccount.isLocked) {
      throw new Error("One or both accounts are not available for transactions");
    }

    if (args.amount <= 0) {
      throw new Error("Transfer amount must be positive");
    }

    if (args.fromAccountId === args.toAccountId) {
      throw new Error("Cannot transfer to the same account");
    }

    // Check if withdrawal is possible from source account
    const fromBalanceBefore = fromAccount.currentBalance;
    const fromBalanceAfter = fromBalanceBefore - args.amount;
    const minimumAllowed = (fromAccount.minimumBalance || 0) - (fromAccount.overdraftLimit || 0);
    
    if (fromBalanceAfter < minimumAllowed) {
      throw new Error(`Insufficient funds in source account. Minimum allowed balance is ${minimumAllowed}`);
    }

    // Calculate destination account balance
    const toBalanceBefore = toAccount.currentBalance;
    const toBalanceAfter = toBalanceBefore + args.amount;

    const transferId = `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create withdrawal transaction
    const withdrawalId = await ctx.db.insert("account_transactions", {
      accountId: args.fromAccountId,
      transactionId: `${transferId}-OUT`,
      type: "transfer_out",
      amount: args.amount,
      balanceBefore: fromBalanceBefore,
      balanceAfter: fromBalanceAfter,
      currency: fromAccount.currency,
      description: `Transfer to ${toAccount.accountName}: ${args.description}`,
      reference: args.reference,
      relatedAccountId: args.toAccountId,
      authorizedBy: args.authorizedBy,
      status: "completed",
      transactionDate: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    // Create deposit transaction
    const depositId = await ctx.db.insert("account_transactions", {
      accountId: args.toAccountId,
      transactionId: `${transferId}-IN`,
      type: "transfer_in",
      amount: args.amount,
      balanceBefore: toBalanceBefore,
      balanceAfter: toBalanceAfter,
      currency: toAccount.currency,
      description: `Transfer from ${fromAccount.accountName}: ${args.description}`,
      reference: args.reference,
      relatedAccountId: args.fromAccountId,
      authorizedBy: args.authorizedBy,
      status: "completed",
      transactionDate: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    // Update account balances
    await ctx.db.patch(args.fromAccountId, {
      currentBalance: fromBalanceAfter,
      lastTransactionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    await ctx.db.patch(args.toAccountId, {
      currentBalance: toBalanceAfter,
      lastTransactionDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    return { withdrawalId, depositId, transferId };
  },
});

// Get account transactions
export const getAccountTransactions = query({
  args: {
    accountId: v.id("accounts"),
    limit: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("deposit"),
      v.literal("withdrawal"),
      v.literal("transfer_in"),
      v.literal("transfer_out"),
      v.literal("fee"),
      v.literal("interest"),
      v.literal("adjustment")
    )),
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let transactions = await ctx.db
      .query("account_transactions")
      .withIndex("byAccount", (q) => q.eq("accountId", args.accountId))
      .order("desc")
      .take(limit * 2); // Get more to allow for filtering

    // Apply filters
    if (args.type) {
      transactions = transactions.filter(t => t.type === args.type);
    }

    if (args.dateRange) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate);
        const start = new Date(args.dateRange!.startDate);
        const end = new Date(args.dateRange!.endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    transactions = transactions.slice(0, limit);

    // Get additional details
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const authorizer = await ctx.db.get(transaction.authorizedBy);
        const approver = transaction.approvedBy ? await ctx.db.get(transaction.approvedBy) : null;
        
        let relatedAccount = null;
        if (transaction.relatedAccountId) {
          relatedAccount = await ctx.db.get(transaction.relatedAccountId);
        }

        return {
          ...transaction,
          authorizer: authorizer ? { name: authorizer.name, email: authorizer.emailAddress } : null,
          approver: approver ? { name: approver.name, email: approver.emailAddress } : null,
          relatedAccount: relatedAccount ? { name: relatedAccount.accountName, number: relatedAccount.accountNumber } : null,
        };
      })
    );

    return transactionsWithDetails;
  },
});

// Get account summary
export const getAccountSummary = query({
  args: {
    accountId: v.id("accounts"),
    dateRange: v.optional(v.object({
      startDate: v.string(),
      endDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) {
      throw new Error("Account not found");
    }

    let transactions = await ctx.db
      .query("account_transactions")
      .withIndex("byAccount", (q) => q.eq("accountId", args.accountId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Filter by date range if provided
    if (args.dateRange) {
      transactions = transactions.filter(t => {
        const transactionDate = new Date(t.transactionDate);
        const start = new Date(args.dateRange!.startDate);
        const end = new Date(args.dateRange!.endDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    const summary = {
      accountInfo: {
        name: account.accountName,
        number: account.accountNumber,
        type: account.accountType,
        currentBalance: account.currentBalance,
        currency: account.currency,
      },
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransferIn: 0,
      totalTransferOut: 0,
      totalFees: 0,
      netChange: 0,
      transactionCount: transactions.length,
      averageTransactionSize: 0,
      largestDeposit: 0,
      largestWithdrawal: 0,
      categoryBreakdown: {} as Record<string, { deposits: number; withdrawals: number; count: number }>,
    };

    transactions.forEach(t => {
      switch (t.type) {
        case "deposit":
          summary.totalDeposits += t.amount;
          summary.largestDeposit = Math.max(summary.largestDeposit, t.amount);
          break;
        case "withdrawal":
          summary.totalWithdrawals += t.amount;
          summary.largestWithdrawal = Math.max(summary.largestWithdrawal, t.amount);
          break;
        case "transfer_in":
          summary.totalTransferIn += t.amount;
          break;
        case "transfer_out":
          summary.totalTransferOut += t.amount;
          break;
        case "fee":
          summary.totalFees += t.amount;
          break;
      }

      // Category breakdown
      if (t.category) {
        if (!summary.categoryBreakdown[t.category]) {
          summary.categoryBreakdown[t.category] = { deposits: 0, withdrawals: 0, count: 0 };
        }
        
        if (t.type === "deposit" || t.type === "transfer_in") {
          summary.categoryBreakdown[t.category].deposits += t.amount;
        } else if (t.type === "withdrawal" || t.type === "transfer_out") {
          summary.categoryBreakdown[t.category].withdrawals += t.amount;
        }
        summary.categoryBreakdown[t.category].count += 1;
      }
    });

    summary.netChange = (summary.totalDeposits + summary.totalTransferIn) - (summary.totalWithdrawals + summary.totalTransferOut + summary.totalFees);
    summary.averageTransactionSize = transactions.length > 0 ? 
      Math.abs(transactions.reduce((sum, t) => sum + t.amount, 0)) / transactions.length : 0;

    return summary;
  },
});

// Get all accounts summary for dashboard
export const getAllAccountsSummary = query({
  args: {
    userId: v.optional(v.id("users")),
    departmentId: v.optional(v.id("departments")),
  },
  handler: async (ctx, args) => {
    let accounts = await ctx.db.query("accounts").collect();

    // Filter by user or department
    if (args.userId) {
      accounts = accounts.filter(account => 
        account.userId === args.userId || 
        account.sharedWith?.includes(args.userId)
      );
    } else if (args.departmentId) {
      accounts = accounts.filter(account => account.departmentId === args.departmentId);
    }

    // Only active accounts
    accounts = accounts.filter(account => account.isActive);

    const summary = {
      totalAccounts: accounts.length,
      totalBalance: 0,
      accountsByType: {} as Record<string, { count: number; totalBalance: number }>,
      accountsByDepartment: {} as Record<string, { count: number; totalBalance: number }>,
      topAccounts: [] as any[],
      lowBalanceAccounts: [] as any[],
    };

    // Get department details and calculate summaries
    for (const account of accounts) {
      summary.totalBalance += account.currentBalance;

      // By type
      if (!summary.accountsByType[account.accountType]) {
        summary.accountsByType[account.accountType] = { count: 0, totalBalance: 0 };
      }
      summary.accountsByType[account.accountType].count += 1;
      summary.accountsByType[account.accountType].totalBalance += account.currentBalance;

      // By department
      const department = await ctx.db.get(account.departmentId);
      const deptName = department?.name || "Unknown";
      
      if (!summary.accountsByDepartment[deptName]) {
        summary.accountsByDepartment[deptName] = { count: 0, totalBalance: 0 };
      }
      summary.accountsByDepartment[deptName].count += 1;
      summary.accountsByDepartment[deptName].totalBalance += account.currentBalance;
    }

    // Get top accounts by balance
    const sortedAccounts = [...accounts].sort((a, b) => b.currentBalance - a.currentBalance);
    summary.topAccounts = await Promise.all(
      sortedAccounts.slice(0, 5).map(async (account) => {
        const department = await ctx.db.get(account.departmentId);
        return {
          id: account._id,
          name: account.accountName,
          type: account.accountType,
          balance: account.currentBalance,
          department: department?.name,
        };
      })
    );

    // Get low balance accounts (below minimum balance)
    const lowBalanceAccounts = accounts.filter(account => 
      account.minimumBalance && account.currentBalance < account.minimumBalance
    );
    
    summary.lowBalanceAccounts = await Promise.all(
      lowBalanceAccounts.map(async (account) => {
        const department = await ctx.db.get(account.departmentId);
        return {
          id: account._id,
          name: account.accountName,
          balance: account.currentBalance,
          minimumBalance: account.minimumBalance,
          shortfall: (account.minimumBalance || 0) - account.currentBalance,
          department: department?.name,
        };
      })
    );

    return summary;
  },
});