"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ForecastChart } from "../_components/charts/forecast-chart"
import { MetricCard } from "@/components/ui/metric-card"
import {
    Brain,
    Target,
    AlertTriangle,
    ChevronLeft,
    Calendar,
    Percent,
    Activity,
    Zap,
    TrendingUp
} from "lucide-react"
import Link from 'next/link'
import {ExportDialog} from "../_components/export-dialog";

interface ForecastData {
    period: string
    predicted_revenue: number
    confidence: number
    growth_rate: number
    risk_factors: string[]
}

interface AnalyticsData {
    forecasts: ForecastData[]
    insights: {
        revenue_trend: 'increasing' | 'decreasing' | 'stable'
        confidence_score: number
        key_risks: string[]
        opportunities: string[]
        recommendations: string[]
    }
    performance_metrics: {
        accuracy: number
        trend_strength: number
        volatility: number
    }
}

export default function Analytics() {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(false)
    const [forecastPeriod, setForecastPeriod] = useState('6')
    const [selectedDepartment, setSelectedDepartment] = useState('all')

    const generateForecast = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/forecast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    period: parseInt(forecastPeriod),
                    department: selectedDepartment,
                }),
            })

            if (!response.ok) throw new Error('Forecast generation failed')
            
            const data = await response.json()
            setAnalyticsData(data)
        } catch (error) {
            console.error('Forecast generation failed:', error)
            
            // Fallback to demo data when API fails
            const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02']
            const forecasts = months.slice(0, parseInt(forecastPeriod)).map((month, index) => {
                const baseRevenue = 15000000 + (index * 1200000)
                const growthRate = 5 + Math.random() * 10
                
                return {
                    period: month,
                    predicted_revenue: baseRevenue * (1 + growthRate / 100),
                    confidence: 75 + Math.random() * 20,
                    growth_rate: growthRate,
                    risk_factors: ['Market volatility', 'Supply chain disruptions', 'Competition']
                }
            })

            const fallbackData = {
                forecasts,
                insights: {
                    revenue_trend: 'increasing',
                    confidence_score: 82.4,
                    key_risks: ['Competition from Oscorp', 'Technology disruption', 'Economic downturn'],
                    opportunities: ['Arc reactor technology licensing', 'Clean energy expansion', 'AI integration'],
                    recommendations: [
                        'Increase R&D investment by 15% to maintain technological edge',
                        'Diversify revenue streams beyond defense contracts',
                        'Focus on sustainable energy solutions for long-term growth'
                    ]
                },
                performance_metrics: {
                    accuracy: 89.2,
                    trend_strength: 76.8,
                    volatility: 12.4
                }
            }
            
            setAnalyticsData(fallbackData)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const loadStaticData = () => {
            const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02']
            const forecasts = months.slice(0, parseInt(forecastPeriod)).map((month, index) => {
                const baseRevenue = 15000000 + (index * 1200000)
                const growthRate = 5 + (index * 2.5)
                
                return {
                    period: month,
                    predicted_revenue: baseRevenue * (1 + growthRate / 100),
                    confidence: 75 + (index * 3),
                    growth_rate: growthRate,
                    risk_factors: ['Market volatility', 'Supply chain disruptions', 'Competition']
                }
            })

            const staticData = {
                forecasts,
                insights: {
                    revenue_trend: 'increasing' as const,
                    confidence_score: 82.4,
                    key_risks: ['Competition from Oscorp', 'Technology disruption', 'Economic downturn'],
                    opportunities: ['Arc reactor technology licensing', 'Clean energy expansion', 'AI integration'],
                    recommendations: [
                        'Increase R&D investment by 15% to maintain technological edge',
                        'Diversify revenue streams beyond defense contracts',
                        'Focus on sustainable energy solutions for long-term growth'
                    ]
                },
                performance_metrics: {
                    accuracy: 89.2,
                    trend_strength: 76.8,
                    volatility: 12.4
                }
            }
            
            setAnalyticsData(staticData)
        }
        
        loadStaticData()
    }, [forecastPeriod, selectedDepartment])

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                AI Analytics & Forecasting
                            </h1>
                            <p className="text-lg text-muted-foreground mt-1">
                                Advanced financial predictions powered by artificial intelligence
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={generateForecast}
                            disabled={loading}
                            className="gap-2"
                        >
                            <Brain className="h-4 w-4" />
                            {loading ? 'Generating...' : 'Generate New Forecast'}
                        </Button>

                        <ExportDialog
                            dashboardData={[]} // You might want to pass dashboard data here too
                            alerts={[]}
                            forecasts={analyticsData?.forecasts || []} // This enables the forecast report option
                        />
                    </div>

                {/* Controls */}
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Forecast Period:</span>
                        <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 months</SelectItem>
                                <SelectItem value="6">6 months</SelectItem>
                                <SelectItem value="12">12 months</SelectItem>
                                <SelectItem value="24">24 months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Department:</span>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="research">Research & Development</SelectItem>
                                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="sales">Sales & Marketing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Badge variant="outline" className="ml-auto">
                        <Brain className="h-3 w-3 mr-1" />
                        AI-Powered
                    </Badge>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="text-lg text-muted-foreground">Generating AI forecasts...</p>
                        </div>
                    </div>
                ) : analyticsData ? (
                    <Tabs defaultValue="forecast" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="forecast">Forecasts</TabsTrigger>
                            <TabsTrigger value="insights">AI Insights</TabsTrigger>
                            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
                            <TabsTrigger value="performance">Model Performance</TabsTrigger>
                        </TabsList>

                        <TabsContent value="forecast" className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <MetricCard
                                    title="Avg. Confidence"
                                    value={analyticsData.insights.confidence_score}
                                    format="percentage"
                                    trend="stable"
                                    icon={<Brain className="h-5 w-5" />}
                                />
                                <MetricCard
                                    title="Predicted Growth"
                                    value={analyticsData.forecasts.reduce((acc, f) => acc + f.growth_rate, 0) / analyticsData.forecasts.length}
                                    format="percentage"
                                    trend={analyticsData.insights.revenue_trend === 'increasing' ? 'up' : analyticsData.insights.revenue_trend === 'decreasing' ? 'down' : 'stable'}
                                    icon={<TrendingUp className="h-5 w-5" />}
                                />
                                <MetricCard
                                    title="Model Accuracy"
                                    value={analyticsData.performance_metrics.accuracy}
                                    format="percentage"
                                    trend="up"
                                    icon={<Target className="h-5 w-5" />}
                                />
                                <MetricCard
                                    title="Risk Factors"
                                    value={analyticsData.insights.key_risks.length}
                                    format="number"
                                    trend={analyticsData.insights.key_risks.length > 3 ? 'down' : 'stable'}
                                    icon={<AlertTriangle className="h-5 w-5" />}
                                />
                            </div>

                            {/* Forecast Chart */}
                            <ForecastChart data={analyticsData.forecasts} />
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                            AI Recommendations
                                        </CardTitle>
                                        <CardDescription>
                                            Strategic insights based on data analysis
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {analyticsData.insights.recommendations.map((rec, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                                    <p className="text-sm">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-green-500" />
                                            Growth Opportunities
                                        </CardTitle>
                                        <CardDescription>
                                            Identified areas for potential expansion
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {analyticsData.insights.opportunities.map((opp, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                                    <p className="text-sm">{opp}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="risks" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                        Risk Assessment
                                    </CardTitle>
                                    <CardDescription>
                                        Potential threats and mitigation strategies
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {analyticsData.insights.key_risks.map((risk, index) => (
                                            <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                                                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-900 dark:text-red-100">
                                                        {risk}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="performance" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard
                                    title="Prediction Accuracy"
                                    value={analyticsData.performance_metrics.accuracy}
                                    format="percentage"
                                    trend="up"
                                    change={2.1}
                                    icon={<Target className="h-5 w-5" />}
                                />
                                <MetricCard
                                    title="Trend Strength"
                                    value={analyticsData.performance_metrics.trend_strength}
                                    format="percentage"
                                    trend="stable"
                                    icon={<Activity className="h-5 w-5" />}
                                />
                                <MetricCard
                                    title="Data Volatility"
                                    value={analyticsData.performance_metrics.volatility}
                                    format="percentage"
                                    trend={analyticsData.performance_metrics.volatility < 15 ? 'up' : 'down'}
                                    icon={<Percent className="h-5 w-5" />}
                                />
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Model Information</CardTitle>
                                    <CardDescription>
                                        Details about the AI forecasting model performance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Training Data Points:</span>
                                                <span className="ml-2 text-muted-foreground">2,847</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Last Model Update:</span>
                                                <span className="ml-2 text-muted-foreground">2 hours ago</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Confidence Threshold:</span>
                                                <span className="ml-2 text-muted-foreground">75%</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Forecast Horizon:</span>
                                                <span className="ml-2 text-muted-foreground">{forecastPeriod} months</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center space-y-4">
                            <Brain className="h-16 w-16 text-muted-foreground mx-auto" />
                            <div>
                                <h3 className="text-xl font-semibold">No Analytics Data</h3>
                                <p className="text-muted-foreground">Click &quot;Refresh&quot; to generate AI-powered forecasts</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    )
};