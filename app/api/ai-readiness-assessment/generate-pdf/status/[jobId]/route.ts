import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai-readiness-assessment/generate-pdf/status/[jobId]
 * Returns the current status of a PDF generation job
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        if (!jobId) {
            return NextResponse.json(
                { error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // @ts-ignore - Prisma Client type generation
        const job = await prisma.pDFGenerationJob.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            statusMessage: job.statusMessage,
            pdfUrl: job.pdfUrl,
            error: job.error,
            completedAt: job.completedAt,
        });
    } catch (error: any) {
        console.error('Error fetching job status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job status' },
            { status: 500 }
        );
    }
}

