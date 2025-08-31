import { Skeleton } from "@/components/ui/skeleton"
import { StarkCard } from "@/components/ui/stark-card"

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-10 w-80" />
                <Skeleton className="h-6 w-60" />
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StarkCard key={i}>
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    </StarkCard>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StarkCard>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </StarkCard>
                <StarkCard>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </StarkCard>
            </div>
        </div>
    )
}