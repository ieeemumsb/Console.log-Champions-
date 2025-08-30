// File: lib/types.ts
export interface FinancialRecord {
    Department: string;
    Month: string;
    Revenue: number;
    Expenses: number;
    'Profit/Loss': number;
    'Budget Allocation'?: number;
    'Forecasted Growth %': number;
    'Risk Flag': 'High' | 'Medium' | 'Low';
}

export interface DepartmentSummary {
    name: string;
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    profitMargin: number;
    averageGrowth: number;
    riskCounts: {
        high: number;
        medium: number;
        low: number;
    };
    monthlyData: MonthlyData[];
}

export interface MonthlyData {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
    growthRate: number;
}

export interface AlertItem {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    department: string;
    timestamp: Date;
    threshold?: number;
    currentValue?: number;
}

export interface ForecastData {
    department: string;
    currentRevenue: number;
    predictedRevenue: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    riskFactors: string[];
    growthRate: number;
}

