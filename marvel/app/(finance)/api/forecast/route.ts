import { NextRequest, NextResponse } from 'next/server';
import { generateForecast } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
    try {
        const { period, department } = await request.json();

        const forecastData = await generateForecast({
            period: period || 6,
            department: department || 'all'
        });

        return NextResponse.json({
            forecasts: forecastData.forecasts,
            insights: forecastData.insights,
            performance_metrics: forecastData.performance_metrics,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error generating forecast:', error);
        return NextResponse.json(
            { error: 'Failed to generate forecast' },
            { status: 500 }
        );
    }
}
