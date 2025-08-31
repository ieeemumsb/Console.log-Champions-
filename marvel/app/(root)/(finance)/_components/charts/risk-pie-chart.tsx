import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { StarkCard } from "@/components/ui/stark-card"
import { Shield } from "lucide-react"

interface RiskPieChartProps {
    data: any[]
    title?: string
}

export function RiskPieChart({ data, title = "Risk Distribution" }: RiskPieChartProps) {
    const riskData = data.reduce((acc, dept) => {
        acc.high += dept.riskCounts.high
        acc.medium += dept.riskCounts.medium
        acc.low += dept.riskCounts.low
        return acc
    }, { high: 0, medium: 0, low: 0 })

    const chartData = [
        { name: 'High Risk', value: riskData.high, color: 'hsl(var(--chart-3))' },
        { name: 'Medium Risk', value: riskData.medium, color: 'hsl(var(--chart-4))' },
        { name: 'Low Risk', value: riskData.low, color: 'hsl(var(--chart-5))' }
    ]

    return (
        <StarkCard title={title} icon={<Shield className="h-5 w-5" />}>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                            labelLine={false}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                            }}
                            formatter={(value: number) => [value, 'Transactions']}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </StarkCard>
    )
}