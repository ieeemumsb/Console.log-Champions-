"use client";

import { useState } from "react";

import { MetricCard } from "@/components/ui/metric-card";
import { RevenueChart } from "../_components/charts/revenue-chart";
import { DepartmentBarChart } from "../_components/charts/department-bar-chart";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Building2,
  Calendar,
} from "lucide-react";

import { DepartmentSummary, AlertItem } from "../_lib/type";
import Link from "next/link";

import { cn, generateAlerts } from "../_lib/utils";
import { ExportDialog } from "../_components/export-dialog";
import { RiskPieChart } from "../_components/charts/risk-pie-chart";
import { FileUpload } from "../_components/file-upload";
import { AlertPanel } from "../_components/ui/alert-panel";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DepartmentSummary[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const handleDataProcessed = (data: DepartmentSummary[]) => {
    setDashboardData(data);
    const generatedAlerts = generateAlerts(data);
    setAlerts(generatedAlerts);
  };

  const companyTotals = dashboardData.reduce(
    (acc, dept) => ({
      totalRevenue: acc.totalRevenue + dept.totalRevenue,
      totalExpenses: acc.totalExpenses + dept.totalExpenses,
      totalProfit: acc.totalProfit + dept.totalProfit,
    }),
    { totalRevenue: 0, totalExpenses: 0, totalProfit: 0 }
  );

  const overallProfitMargin =
    companyTotals.totalRevenue > 0
      ? (companyTotals.totalProfit / companyTotals.totalRevenue) * 100
      : 0;

  if (dashboardData.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stark Industries
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Financial Analytics Dashboard
            </p>
          </div>

          <div className="flex justify-center items-center min-h-[60vh]">
            <FileUpload onDataProcessed={handleDataProcessed} useAI={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Stark Industries
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Financial Analytics Dashboard
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                {dashboardData[0]?.monthlyData?.length || 0} months
              </Badge>
              <Badge variant="outline">
                <Building2 className="h-3 w-3 mr-1" />
                {dashboardData.length} departments
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics & Forecasting
            </Button>
          </Link>

          <ExportDialog
            dashboardData={dashboardData}
            alerts={alerts}
            forecasts={[]} // Will be populated if you have forecast data
          />

          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={companyTotals.totalRevenue}
            format="currency"
            trend="up"
            change={5.2}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Net Profit"
            value={companyTotals.totalProfit}
            format="currency"
            trend="up"
            change={12.8}
            changeType="percentage"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Profit Margin"
            value={overallProfitMargin}
            format="percentage"
            trend="stable"
            change={0.3}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Alerts"
            value={alerts.length}
            format="number"
            trend={
              alerts.filter((a) => a.type === "critical").length > 0
                ? "down"
                : "stable"
            }
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DepartmentBarChart data={dashboardData} />
              <RiskPieChart data={dashboardData} />
            </div>

            {dashboardData[0]?.monthlyData && (
              <RevenueChart data={dashboardData[0].monthlyData} />
            )}
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.map((dept, index) => (
                <MetricCard
                  key={dept.name}
                  title={dept.name}
                  value={dept.totalRevenue}
                  format="currency"
                  change={dept.profitMargin}
                  changeType="percentage"
                  trend={
                    dept.profitMargin > 15
                      ? "up"
                      : dept.profitMargin < 5
                        ? "down"
                        : "stable"
                  }
                  icon={<Building2 className="h-5 w-5" />}
                  className={cn(
                    "transition-all duration-200",
                    index === 0 &&
                      "ring-2 ring-blue-500/20 ring-offset-2 ring-offset-background"
                  )}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AlertPanel
                  alerts={alerts}
                  onDismiss={(id) =>
                    setAlerts(alerts.filter((a) => a.id !== id))
                  }
                  maxVisible={10}
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Risk Summary</h3>
                <div className="space-y-3">
                  {["critical", "warning", "info"].map((type) => {
                    const count = alerts.filter((a) => a.type === type).length;
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <span className="capitalize font-medium">
                          {type} Alerts
                        </span>
                        <Badge
                          variant={
                            type === "critical" ? "destructive" : "secondary"
                          }
                        >
                          {count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
