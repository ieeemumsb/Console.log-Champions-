import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react"
import { AlertItem } from "../../_lib/type"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface AlertPanelProps {
    alerts: AlertItem[]
    onDismiss?: (alertId: string) => void
    maxVisible?: number
}

export function AlertPanel({ alerts, onDismiss, maxVisible = 5 }: AlertPanelProps) {
    const visibleAlerts = alerts.slice(0, maxVisible)

    const getAlertIcon = (type: AlertItem['type']) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="h-4 w-4" />
            case 'warning': return <AlertCircle className="h-4 w-4" />
            default: return <Info className="h-4 w-4" />
        }
    }

    const getAlertVariant = (type: AlertItem['type']) => {
        switch (type) {
            case 'critical': return 'destructive'
            case 'warning': return 'default'
            default: return 'default'
        }
    }

    const getAlertColor = (type: AlertItem['type']) => {
        switch (type) {
            case 'critical': return 'border-red-500/50 bg-red-500/10'
            case 'warning': return 'border-yellow-500/50 bg-yellow-500/10'
            default: return 'border-blue-500/50 bg-blue-500/10'
        }
    }

    if (visibleAlerts.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All systems operational</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {visibleAlerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Alert className={cn("relative pr-12", getAlertColor(alert.type))}>
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <AlertDescription className="text-sm leading-relaxed">
                                        {alert.message}
                                    </AlertDescription>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {alert.department}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                                        {alert.threshold && alert.currentValue && (
                                            <Badge variant="secondary" className="text-xs">
                                                {alert.currentValue.toFixed(1)} / {alert.threshold}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {onDismiss && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 h-6 w-6 p-0"
                                    onClick={() => onDismiss(alert.id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </Alert>
                    </motion.div>
                ))}
            </AnimatePresence>

            {alerts.length > maxVisible && (
                <p className="text-xs text-muted-foreground text-center">
                    +{alerts.length - maxVisible} more alerts
                </p>
            )}
        </div>
    )
}