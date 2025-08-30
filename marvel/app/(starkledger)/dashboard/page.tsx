"use client";

import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
    Building2, 
    TrendingUp, 
    DollarSign, 
    Clock, 
    CheckCircle, 
    AlertTriangle,
    PieChart,
    BarChart3,
    ArrowRight,
    Wallet,
    CreditCard
} from "lucide-react";
import Link from "next/link";

// TypeScript interfaces
interface Account {
    _id: string;
    accountName: string;
    accountNumber: string;
    accountType: 'checking' | 'savings' | 'petty_cash' | 'investment' | 'project_fund' | 'emergency_fund' | 'operational';
    currentBalance: number;
    currency: string;
    isActive: boolean;
    department?: { name: string; code: string };
    owner?: { name: string };
}

interface FinancialRecord {
    _id: string;
    type: 'income' | 'expense' | 'transfer';
    amount: number;
    description: string;
    date: string;
    category: string;
    department?: { name: string; code: string };
    creator?: { name: string };
}

interface BudgetAlert {
    budgetId: string;
    department?: { name: string; code: string };
    fiscalPeriod: string;
    utilization: number;
    severity: 'critical' | 'high' | 'medium';
}

const Dashboard: React.FC = () => {
    const { user: clerkUser } = useUser();

    // Get current user from our database
    const user = useQuery(
        api.users.getUserByExternalId,
        clerkUser?.id ? { externalId: clerkUser.id } : "skip"
    );

    // Get all accounts summary
    const accountsSummary = useQuery(
        api.accounts.getAllAccountsSummary,
        user ? { userId: user._id } : "skip"
    );

    // Get recent financial records
    const recentTransactions = useQuery(
        api.financial_records.getRecentFinancialRecords,
        { limit: 5 }
    );

    // Get dashboard overview
    const dashboardOverview = useQuery(
        api.dashboard.getDashboardOverview,
        user ? { userId: user._id } : "skip"
    );

    // Get financial metrics for charts
    const financialMetrics = useQuery(
        api.dashboard.getFinancialMetrics,
        {
            dateRange: {
                startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of year
                endDate: new Date().toISOString()
            },
            granularity: "monthly"
        }
    );

    // Get budget alerts
    // const budgetAlerts = useQuery(api.budgets.getBudgetAlerts) as BudgetAlert[] | undefined;

    // Helper functions
    const formatCurrency = (amount: number, currency: string = "USD"): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getAccountTypeIcon = (type: string) => {
        const icons = {
            checking: <Wallet className="w-5 h-5" />,
            savings: <DollarSign className="w-5 h-5" />,
            petty_cash: <CreditCard className="w-5 h-5" />,
            investment: <TrendingUp className="w-5 h-5" />,
            project_fund: <Building2 className="w-5 h-5" />,
            emergency_fund: <AlertTriangle className="w-5 h-5" />,
            operational: <BarChart3 className="w-5 h-5" />
        };
        return icons[type as keyof typeof icons] || <Wallet className="w-5 h-5" />;
    };

    const getAccountTypeColor = (type: string): string => {
        const colors = {
            checking: 'bg-blue-500',
            savings: 'bg-green-500',
            petty_cash: 'bg-purple-500',
            investment: 'bg-orange-500',
            project_fund: 'bg-pink-500',
            emergency_fund: 'bg-red-500',
            operational: 'bg-gray-500'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Welcome to StarkLedger</h2>
                        <p className="text-muted-foreground">Please sign in to access your financial dashboard.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user === undefined || accountsSummary === undefined || dashboardOverview === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading your dashboard...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (user === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-4">User Not Found</h2>
                        <p className="text-muted-foreground">Please contact support for assistance.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Get first name from user
    const firstName = clerkUser.firstName || clerkUser.fullName?.split(" ")[0] || "User";

    // No data state
    if (!accountsSummary || accountsSummary.totalAccounts === 0) {
        return (
            <div className="min-h-screen bg-background">
                {/* Header Section */}
                <div className="bg-card border-b sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    Welcome back, {firstName}! 👋
                                </h1>
                                <p className="text-muted-foreground mt-1">Here's your financial overview for today</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Balance</p>
                                <div className="text-4xl font-bold">
                                    {formatCurrency(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* No Data State */}
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                                <Building2 className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">No Financial Data Available</h2>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Get started by setting up your first organizational account or adding some financial records to see your dashboard come to life.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/starkledger/accounts">
                                    <Button>
                                        <Wallet className="w-4 h-4 mr-2" />
                                        Set up Accounts
                                    </Button>
                                </Link>
                                <Link href="/starkledger/transactions">
                                    <Button variant="outline">
                                        <BarChart3 className="w-4 h-4 mr-2" />
                                        Add Transactions
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="bg-card border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Welcome back, {firstName}! 👋
                            </h1>
                            <p className="text-muted-foreground mt-1">Here's your financial overview for today</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">Total Balance</p>
                            <div className="text-4xl font-bold">
                                {formatCurrency(accountsSummary.totalBalance)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across {accountsSummary.totalAccounts} accounts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(dashboardOverview.summary.totalRevenue)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Expenses</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {formatCurrency(dashboardOverview.summary.totalExpenses)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Net Profit</p>
                                    <p className={`text-2xl font-bold ${dashboardOverview.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(dashboardOverview.summary.netProfit)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm">Budget Usage</p>
                                    <p className="text-2xl font-bold">
                                        {dashboardOverview.summary.budgetUtilization.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Accounts Grid */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                💳
                            </span>
                            Organization Accounts
                        </h2>
                        <Link href="/starkledger/accounts">
                            <Button variant="outline">
                                View All <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accountsSummary.topAccounts.map((account) => {
                            const percentageOfTotal = accountsSummary.totalBalance > 0 
                                ? (account.balance / accountsSummary.totalBalance) * 100 
                                : 0;

                            return (
                                <Card key={account.id} className="hover:shadow-lg transition-all duration-300 group hover:scale-105">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${getAccountTypeColor(account.type)}`}>
                                                    {getAccountTypeIcon(account.type)}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                                                        {account.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground capitalize">
                                                        {account.type.replace('_', ' ')}
                                                    </p>
                                                    {account.department && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {account.department}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">
                                                {formatCurrency(account.balance)}
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-2 mt-3">
                                                <div
                                                    className={`h-2 rounded-full ${getAccountTypeColor(account.type)}`}
                                                    style={{width: `${Math.min(percentageOfTotal, 100)}%`}}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {percentageOfTotal.toFixed(1)}% of total
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT COLUMN */}
                    <div className="space-y-8">
                        {/* Recent Transactions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                        📊
                                    </span>
                                    Recent Transactions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!recentTransactions || recentTransactions.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                            <BarChart3 className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No recent transactions</p>
                                        <p className="text-sm text-muted-foreground mt-1">Transaction history will appear here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentTransactions.map((transaction) => (
                                            <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                        {transaction.type === 'income' ? '💰' : '💸'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{transaction.description}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {transaction.category} • {formatDate(transaction.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`text-right font-bold ${
                                                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Budget Alerts
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                        ⚠️
                                    </span>
                                    Budget Alerts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!budgetAlerts || budgetAlerts.length === 0 ? (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">All budgets on track</p>
                                        <p className="text-sm text-muted-foreground mt-1">No budget alerts at this time</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {budgetAlerts.slice(0, 3).map((alert, index) => (
                                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                                alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                                'border-yellow-500 bg-yellow-50'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{alert.department?.name || 'Department'}</p>
                                                        <p className="text-sm text-muted-foreground">{alert.fiscalPeriod}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">{alert.utilization.toFixed(1)}%</p>
                                                        <p className="text-xs text-muted-foreground">utilized</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card> */}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-8">

                        {/* Expenses Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                        📈
                                    </span>
                                    Expenses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!financialMetrics || financialMetrics.expenseData.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <BarChart3 className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No expense data available</p>
                                        <p className="text-sm text-muted-foreground mt-1">Add expense records to see trends</p>
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-end justify-between gap-2">
                                        {financialMetrics.expenseData.slice(-7).map((data, index) => {
                                            const maxValue = Math.max(...financialMetrics.expenseData.map(d => d.value));
                                            const height = maxValue > 0 ? (data.value / maxValue) * 200 : 0;
                                            
                                            return (
                                                <div key={index} className="flex-1 flex flex-col items-center">
                                                    <div
                                                        className="w-full bg-blue-500 rounded-t-sm"
                                                        style={{ height: `${height}px` }}
                                                    />
                                                    <span className="text-xs text-muted-foreground mt-2">
                                                        {data.period.split('-')[1]}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Spending Breakdown */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                                        💰
                                    </span>
                                    Spending
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                        <PieChart className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground font-medium">No spending data available</p>
                                    <p className="text-sm text-muted-foreground mt-1">Spending breakdown will appear here</p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>

            {/* Footer Spacer */}
            <div className="h-8"></div>
        </div>
    );
}

export default Dashboard;