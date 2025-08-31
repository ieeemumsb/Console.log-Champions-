import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { StarkCard } from "@/components/ui/stark-card"
import { TrendingUp } from "lucide-react"

interface RevenueChartProps {
    data: any[]
    title?: string
}

export function RevenueChart({ data, title = "Revenue Trends" }: RevenueChartProps) {
    return (
        <StarkCard title={title} icon={<TrendingUp className="h-5 w-5" />}>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="month"
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number, name: string) => [
                                `${(value / 1000000).toFixed(1)}M`,
                                name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
                            ]}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="hsl(var(--chart-1))"
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                            name="Revenue"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="hsl(var(--chart-2))"
                            fillOpacity={1}
                            fill="url(#expensesGradient)"
                            name="Expenses"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </StarkCard>
    )
}