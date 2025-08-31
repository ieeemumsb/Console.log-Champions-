// File: lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { FinancialRecord, DepartmentSummary, MonthlyData, AlertItem } from './type'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
    if (value >= 1000000000) {
        return `$${(value / 1000000000).toFixed(2)}B`
    }
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value.toFixed(0)}`
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`
}

export function getRiskColor(risk: string): string {
    switch (risk.toLowerCase()) {
        case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
        case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
        default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
}

export function processFinancialData(rawData: FinancialRecord[]): DepartmentSummary[] {
    // Clean and filter data
    const cleanData = rawData.filter(row =>
        row.Department &&
        row.Department !== 'nil' &&
        row.Department !== '-' &&
        row.Department !== 'N/A' &&
        typeof row.Revenue === 'number' &&
        typeof row.Expenses === 'number' &&
        !isNaN(row.Revenue) &&
        !isNaN(row.Expenses)
    );

    // Group by department
    const departmentGroups = cleanData.reduce((acc, row) => {
        const dept = row.Department;
        if (!acc[dept]) {
            acc[dept] = [];
        }
        acc[dept].push(row);
        return acc;
    }, {} as Record<string, FinancialRecord[]>);

    // Process each department
    const departmentSummaries = Object.entries(departmentGroups).map(([deptName, records]) => {
        const totalRevenue = records.reduce((sum, r) => sum + r.Revenue, 0);
        const totalExpenses = records.reduce((sum, r) => sum + r.Expenses, 0);
        const totalProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        const averageGrowth = records.reduce((sum, r) => sum + (r['Forecasted Growth %'] || 0), 0) / records.length;

        // Risk counting
        const riskCounts = records.reduce((counts, r) => {
            const risk = r['Risk Flag']?.toLowerCase();
            if (risk === 'high') counts.high++;
            else if (risk === 'medium') counts.medium++;
            else if (risk === 'low') counts.low++;
            return counts;
        }, { high: 0, medium: 0, low: 0 });

        // Monthly data aggregation
        const monthlyGroups = records.reduce((acc, r) => {
            const month = r.Month;
            if (!acc[month]) {
                acc[month] = { revenue: 0, expenses: 0, records: 0 };
            }
            acc[month].revenue += r.Revenue;
            acc[month].expenses += r.Expenses;
            acc[month].records++;
            return acc;
        }, {} as Record<string, { revenue: number; expenses: number; records: number }>);

        const monthlyData: MonthlyData[] = Object.entries(monthlyGroups)
            .filter(([month]) => month && month !== '-' && month !== 'N/A')
            .map(([month, data]) => ({
                month,
                revenue: data.revenue,
                expenses: data.expenses,
                profit: data.revenue - data.expenses,
                growthRate: 0 // Will calculate this later
            }))
            .sort((a, b) => {
                const monthOrder = ['Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24'];
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
            });

        // Calculate month-over-month growth rates
        monthlyData.forEach((month, index) => {
            if (index > 0) {
                const prevRevenue = monthlyData[index - 1].revenue;
                month.growthRate = prevRevenue > 0 ? ((month.revenue - prevRevenue) / prevRevenue) * 100 : 0;
            }
        });

        return {
            name: deptName,
            totalRevenue,
            totalExpenses,
            totalProfit,
            profitMargin,
            averageGrowth,
            riskCounts,
            monthlyData
        };
    });

    return departmentSummaries.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export function generateAlerts(departments: DepartmentSummary[]): AlertItem[] {
    const alerts: AlertItem[] = [];

    departments.forEach(dept => {
        // Low profit margin alert
        if (dept.profitMargin < 10) {
            alerts.push({
                id: `${dept.name}-low-margin`,
                type: 'critical',
                message: `${dept.name} has critically low profit margin of ${dept.profitMargin.toFixed(1)}%`,
                department: dept.name,
                timestamp: new Date(),
                threshold: 10,
                currentValue: dept.profitMargin
            });
        }

        // High risk transactions alert
        const totalRiskItems = dept.riskCounts.high + dept.riskCounts.medium + dept.riskCounts.low;
        const highRiskPercentage = totalRiskItems > 0 ? (dept.riskCounts.high / totalRiskItems) * 100 : 0;

        if (highRiskPercentage > 40) {
            alerts.push({
                id: `${dept.name}-high-risk`,
                type: 'warning',
                message: `${dept.name} has ${highRiskPercentage.toFixed(1)}% high-risk transactions`,
                department: dept.name,
                timestamp: new Date(),
                threshold: 40,
                currentValue: highRiskPercentage
            });
        }

        // Negative growth trend alert
        if (dept.averageGrowth < -5) {
            alerts.push({
                id: `${dept.name}-negative-growth`,
                type: 'warning',
                message: `${dept.name} showing negative growth trend of ${dept.averageGrowth.toFixed(1)}%`,
                department: dept.name,
                timestamp: new Date(),
                threshold: -5,
                currentValue: dept.averageGrowth
            });
        }

        // Recent monthly decline
        if (dept.monthlyData.length >= 2) {
            const lastMonth = dept.monthlyData[dept.monthlyData.length - 1];
            const prevMonth = dept.monthlyData[dept.monthlyData.length - 2];

            if (lastMonth.revenue < prevMonth.revenue * 0.9) {
                alerts.push({
                    id: `${dept.name}-revenue-drop`,
                    type: 'critical',
                    message: `${dept.name} revenue dropped ${((1 - lastMonth.revenue / prevMonth.revenue) * 100).toFixed(1)}% last month`,
                    department: dept.name,
                    timestamp: new Date()
                });
            }
        }
    });

    return alerts.sort((a, b) => {
        const priorityOrder = { critical: 3, warning: 2, info: 1 };
        return priorityOrder[b.type] - priorityOrder[a.type];
    });
}