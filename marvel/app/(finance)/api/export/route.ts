import { NextRequest, NextResponse } from 'next/server'
import { generateExecutiveReport, generateDetailedReport, generateForecastReport, ReportData } from '@/lib/report-generator'

export async function POST(request: NextRequest) {
    try {
        const {
            dashboardData,
            alerts,
            forecasts,
            format = 'executive',
            fileType = 'txt'
        } = await request.json()

        if (!dashboardData) {
            return NextResponse.json({ error: 'No dashboard data provided' }, { status: 400 })
        }

        const reportData: ReportData = {
            dashboardData,
            alerts: alerts || [],
            forecasts,
            reportType: format as any,
            dateRange: 'Last 12 months'
        }

        let reportContent: string
        let filename: string

        // Generate different report types
        switch (format) {
            case 'executive':
                reportContent = generateExecutiveReport(reportData)
                filename = `Stark_Industries_Executive_Report_${new Date().toISOString().split('T')[0]}`
                break
            case 'detailed':
                reportContent = generateDetailedReport(reportData)
                filename = `Stark_Industries_Detailed_Report_${new Date().toISOString().split('T')[0]}`
                break
            case 'forecast':
                reportContent = generateForecastReport(reportData)
                filename = `Stark_Industries_Forecast_Report_${new Date().toISOString().split('T')[0]}`
                break
            default:
                reportContent = generateExecutiveReport(reportData)
                filename = `Stark_Industries_Report_${new Date().toISOString().split('T')[0]}`
        }

        // Return different file types
        if (fileType === 'pdf') {
            // For PDF export (requires additional setup)
            return NextResponse.json({
                error: 'PDF export coming soon. Use TXT format for now.'
            }, { status: 501 })
        }

        // Return text file
        const response = new NextResponse(reportContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Content-Disposition': `attachment; filename="${filename}.txt"`,
            },
        })

        return response

    } catch (error) {
        console.error('Error generating report:', error)
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        )
    }
}
