import { StarkCard } from "./stark-card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { formatCurrency, formatPercentage, cn } from "../../app/(finance)/_lib/utils"

interface MetricCardProps {
    title: string
    value: number
    format?: 'currency' | 'percentage' | 'number'
    change?: number
    changeType?: 'percentage' | 'currency'
    trend?: 'up' | 'down' | 'stable'
    icon?: React.ReactNode
    className?: string
}

export function MetricCard({
                               title,
                               value,
                               format = 'currency',
                               change,
                               changeType = 'percentage',
                               trend,
                               icon,
                               className
                           }: MetricCardProps) {
    const formatValue = (val: number, fmt: string) => {
        switch (fmt) {
            case 'currency': return formatCurrency(val)
            case 'percentage': return formatPercentage(val)
            default: return val.toLocaleString()
        }
    }

    const getTrendIcon = (t?: string) => {
        switch (t) {
            case 'up': return <TrendingUp className="h-4 w-4" />
            case 'down': return <TrendingDown className="h-4 w-4" />
            default: return <Minus className="h-4 w-4" />
        }
    }

    const getTrendColor = (t?: string) => {
        switch (t) {
            case 'up': return 'text-green-500'
            case 'down': return 'text-red-500'
            default: return 'text-gray-500'
        }
    }

    return (
        <StarkCard className={className} gradient>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {icon && <div className="text-muted-foreground">{icon}</div>}
                </div>

                <div className="space-y-2">
                    <p className="text-3xl font-bold tracking-tight">
                        {formatValue(value, format)}
                    </p>

                    {change !== undefined && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn(
                                "flex items-center gap-1 px-2 py-1",
                                getTrendColor(trend)
                            )}>
                                {getTrendIcon(trend)}
                                <span className="text-xs font-medium">
                  {change > 0 ? '+' : ''}{formatValue(Math.abs(change), changeType)}
                </span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                    )}
                </div>
            </div>
        </StarkCard>
    )
}
