// File: components/charts/forecast-chart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, ComposedChart, Bar } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ForecastData {
    period: string
    predicted_revenue: number
    confidence: number
    growth_rate: number
    risk_factors: string[]
}

interface ForecastChartProps {
    data: ForecastData[]
    title?: string
}

export function ForecastChart({ data, title = "AI Revenue Forecasting" }: ForecastChartProps) {
    // Transform the forecast data for the chart
    const chartData = data.map((item, index) => ({
        period: item.period,
        revenue: item.predicted_revenue / 1000000, // Convert to millions
        confidence: item.confidence,
        growth_rate: item.growth_rate,
        type: 'forecast'
    }))

    return (
        <Card className="col-span-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600">
                        AI-Powered
                    </Badge>
                </div>
                <CardDescription>
                    Intelligent revenue predictions with confidence intervals
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <defs>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="period"
                                    className="text-xs fill-muted-foreground"
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    className="text-xs fill-muted-foreground"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(value) => `$${value.toFixed(0)}M`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: number, name: string, props: any) => [
                                        `$${value.toFixed(1)}M`,
                                        'Predicted Revenue'
                                    ]}
                                    labelFormatter={(label, payload) => {
                                        const item = payload?.[0]?.payload
                                        if (item?.confidence) {
                                            return `${label} (${item.confidence.toFixed(0)}% confidence)`
                                        }
                                        return label
                                    }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    fill="url(#forecastGradient)"
                                    fillOpacity={1}
                                    name="Revenue Forecast"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                    name="Trend Line"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Forecast Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Average Confidence</p>
                            <p className="text-2xl font-bold text-blue-500">
                                {data.length > 0
                                    ? (data.reduce((sum, f) => sum + f.confidence, 0) / data.length).toFixed(0)
                                    : 0}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Average Growth</p>
                            <p className="text-2xl font-bold text-green-500">
                                {data.length > 0
                                    ? (data.reduce((sum, f) => sum + f.growth_rate, 0) / data.length).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Forecast</p>
                            <p className="text-2xl font-bold text-purple-500">
                                ${data.length > 0
                                ? (data.reduce((sum, f) => sum + f.predicted_revenue, 0) / 1000000000).toFixed(2)
                                : 0}B
                            </p>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-4 w-4 text-blue-500" />
                            <h4 className="font-semibold text-blue-600">AI Forecast Analysis</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Model Confidence:</span> The AI forecasting model 
                                    shows high confidence in revenue predictions based on current market trends.
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">
                                    <span className="font-medium">Risk Factors:</span> Predictions consider market volatility, 
                                    seasonal patterns, and industry-specific variables for enhanced accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}