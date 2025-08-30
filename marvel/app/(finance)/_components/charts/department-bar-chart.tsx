import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { StarkCard } from "@/components/ui/stark-card"
import { Building2 } from "lucide-react"

interface DepartmentBarChartProps {
    data: any[]
    title?: string
}

export function DepartmentBarChart({ data, title = "Department Performance" }: DepartmentBarChartProps) {
    const chartData = data.map(dept => ({
        name: dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name,
        fullName: dept.name,
        revenue: dept.totalRevenue / 1000000, // Convert to millions
        profit: dept.totalProfit / 1000000,
        profitMargin: dept.profitMargin
    })).sort((a, b) => b.revenue - a.revenue)

    return (
        <StarkCard title={title} icon={<Building2 className="h-5 w-5" />}>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="name"
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            className="text-xs fill-muted-foreground"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `${value.toFixed(0)}M`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number, name: string) => [
                                `${value.toFixed(1)}M`,
                                name === 'revenue' ? 'Revenue' : 'Profit'
                            ]}
                            labelFormatter={(label, payload) => {
                                const item = payload?.[0]?.payload
                                return item ? item.fullName : label
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="revenue"
                            fill="hsl(var(--chart-1))"
                            name="Revenue"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="profit"
                            fill="hsl(var(--chart-2))"
                            name="Profit"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </StarkCard>
    )
}
