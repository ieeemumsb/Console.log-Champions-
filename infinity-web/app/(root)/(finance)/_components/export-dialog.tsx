"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Download, FileText, BarChart3, TrendingUp, Loader2 } from "lucide-react"

interface ExportDialogProps {
    dashboardData: any[]
    alerts: any[]
    forecasts?: any[]
}

export function ExportDialog({ dashboardData, alerts, forecasts }: ExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false)
    const [reportType, setReportType] = useState('executive')
    const [fileFormat, setFileFormat] = useState('txt')
    const [open, setOpen] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dashboardData,
                    alerts,
                    forecasts,
                    format: reportType,
                    fileType: fileFormat
                }),
            })

            if (!response.ok) throw new Error('Export failed')

            // Handle file download
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url

            const filename = `Stark_Industries_${reportType}_Report_${new Date().toISOString().split('T')[0]}.${fileFormat}`
            a.download = filename
            a.click()
            URL.revokeObjectURL(url)

            setOpen(false)
        } catch (error) {
            console.error('Export failed:', error)
            alert('Export failed. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    const reportTypes = [
        {
            value: 'executive',
            title: 'Executive Summary',
            description: 'High-level overview for board meetings and executives',
            icon: <BarChart3 className="h-4 w-4" />,
            pages: '2-3 pages'
        },
        {
            value: 'detailed',
            title: 'Detailed Analysis',
            description: 'Comprehensive breakdown of all departments and metrics',
            icon: <FileText className="h-4 w-4" />,
            pages: '5-8 pages'
        },
        {
            value: 'forecast',
            title: 'AI Forecasting Report',
            description: 'Future predictions and growth projections',
            icon: <TrendingUp className="h-4 w-4" />,
            pages: '3-4 pages',
            disabled: !forecasts || forecasts.length === 0
        }
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90%]">
                <DialogHeader>
                    <DialogTitle>Export Financial Report</DialogTitle>
                    <DialogDescription>
                        Generate a professional report for presentations and stakeholder meetings.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Report Type Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Report Type</Label>
                        <RadioGroup value={reportType} onValueChange={setReportType} className="space-y-2">
                            {reportTypes.map((type) => (
                                <div key={type.value} className={`flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors ${type.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <RadioGroupItem
                                        value={type.value}
                                        id={type.value}
                                        disabled={type.disabled}
                                        className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <Label
                                            htmlFor={type.value}
                                            className={`flex items-center gap-2 font-medium ${type.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            {type.icon}
                                            {type.title}
                                            <Badge variant="outline" className="text-xs">
                                                {type.pages}
                                            </Badge>
                                            {type.disabled && (
                                                <Badge variant="secondary" className="text-xs">
                                                    No Data
                                                </Badge>
                                            )}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {type.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* File Format Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">File Format</Label>
                        <Select value={fileFormat} onValueChange={setFileFormat}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="txt">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Text Document (.txt)
                                    </div>
                                </SelectItem>
                                <SelectItem value="pdf" disabled>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        PDF Document (.pdf) - Coming Soon
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Report Preview */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Report Will Include:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Company financial overview (${(dashboardData.reduce((sum, dept) => sum + dept.totalRevenue, 0) / 1000000000).toFixed(1)}B revenue)</li>
                            <li>• Department performance analysis ({dashboardData.length} departments)</li>
                            <li>• Risk assessment ({alerts.length} active alerts)</li>
                            {reportType === 'forecast' && forecasts && (
                                <li>• AI-powered growth predictions ({forecasts.length} department forecasts)</li>
                            )}
                            <li>• Executive recommendations and insights</li>
                        </ul>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Export Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
