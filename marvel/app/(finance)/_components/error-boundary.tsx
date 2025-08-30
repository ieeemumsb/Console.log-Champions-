"use client"

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarkCard } from '@/components/ui/stark-card'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Dashboard Error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                    <StarkCard className="max-w-md text-center">
                        <div className="space-y-4">
                            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                            <div>
                                <h2 className="text-2xl font-bold">System Error</h2>
                                <p className="text-muted-foreground mt-2">
                                    An unexpected error occurred in the Stark Industries dashboard.
                                </p>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-sm font-mono text-red-600">
                                    {this.state.error?.message || 'Unknown error'}
                                </p>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Restart Dashboard
                            </Button>
                        </div>
                    </StarkCard>
                </div>
            )
        }

        return this.props.children
    }
}
