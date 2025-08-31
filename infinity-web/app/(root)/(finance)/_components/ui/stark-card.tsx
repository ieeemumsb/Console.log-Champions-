import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StarkCardProps {
    children: React.ReactNode
    title?: string
    className?: string
    icon?: React.ReactNode
    gradient?: boolean
}

export function StarkCard({ children, title, className, icon, gradient = false }: StarkCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className={cn(
                "relative overflow-hidden border-border/50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
                gradient && "bg-gradient-to-br from-card via-card to-card/80",
                "shadow-lg hover:shadow-xl transition-all duration-300",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:to-purple-500/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
                className
            )}>
                {title && (
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            {icon}
                            {title}
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </motion.div>
    )
}
