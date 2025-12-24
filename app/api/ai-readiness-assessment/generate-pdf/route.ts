import { NextRequest, NextResponse } from 'next/server';
import { ReadinessAssessment } from '@/mocks/ai-readiness-questions';
import { renderToBuffer } from '@react-pdf/renderer';
import { createAIReadinessDocument } from '@/lib/pdf-generator';
import path from 'path';
import fs from 'fs';

/**
 * POST /api/ai-readiness-assessment/generate-pdf
 * Generates PDF synchronously and returns it directly (no database needed)
 */
export async function POST(request: NextRequest) {
    try {
        const assessment: ReadinessAssessment = await request.json();

        if (!assessment || !assessment.email) {
            return NextResponse.json(
                { error: 'Invalid assessment data' },
                { status: 400 }
            );
        }

        // Load logo
        let logoPath = '';
        try {
            const logoFilePath = path.join(process.cwd(), 'public', 'images', 'brain__white_official_logo.png');
            if (fs.existsSync(logoFilePath)) {
                const logoBuffer = fs.readFileSync(logoFilePath);
                const logoBase64 = logoBuffer.toString('base64');
                logoPath = `data:image/png;base64,${logoBase64}`;
            }
        } catch (error) {
            console.error('Error loading logo:', error);
        }

        // Generate PDF
        const pdfDoc = createAIReadinessDocument(assessment, logoPath);
        const pdfBuffer = await renderToBuffer(pdfDoc);
        
        // Ensure we have a proper Buffer
        let buffer: Buffer;
        if (Buffer.isBuffer(pdfBuffer)) {
            buffer = pdfBuffer;
        } else {
            // renderToBuffer can return Buffer or Uint8Array, convert to Buffer
            buffer = Buffer.from(pdfBuffer as any);
        }

        // Return PDF directly
        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': buffer.length.toString(),
                'Content-Disposition': `attachment; filename="ai-readiness-assessment-${assessment.company || 'report'}-${Date.now()}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { 
                error: 'Failed to generate PDF',
                details: process.env.NODE_ENV === 'development' ? error?.message : undefined
            },
            { status: 500 }
        );
    }
}

