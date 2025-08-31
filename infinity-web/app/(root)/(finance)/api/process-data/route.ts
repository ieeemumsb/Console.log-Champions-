import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { cleanFinancialData } from '../../_lib/openai-service';
import { processFinancialData } from '../../_lib/utils';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Read Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        // Clean data using OpenAI (optional - can be toggled)
        const useAI = request.nextUrl.searchParams.get('useAI') === 'true';
        let cleanedData;

        if (useAI) {
            cleanedData = await cleanFinancialData(rawData);
        } else {
            // Manual cleaning fallback
            cleanedData = rawData.filter((row: any) =>
                row.Department &&
                row.Department !== 'nil' &&
                row.Department !== '-' &&
                row.Department !== 'N/A' &&
                typeof row.Revenue === 'number' &&
                typeof row.Expenses === 'number'
            );
        }

        // Process into dashboard format
        const processedData = processFinancialData(cleanedData as any);

        return NextResponse.json({
            success: true,
            data: processedData,
            recordCount: cleanedData.length,
            departmentCount: processedData.length
        });

    } catch (error) {
        console.error('Error processing data:', error);
        return NextResponse.json(
            { error: 'Failed to process financial data' },
            { status: 500 }
        );
    }
}
