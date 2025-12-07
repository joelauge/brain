import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        // @ts-ignore
        const job = await prisma.preparednessReportJob.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: job.status,
            progress: job.progress,
            statusMessage: job.statusMessage,
            reportData: job.reportData ? JSON.parse(job.reportData) : null,
            error: job.error,
        });
    } catch (error: any) {
        console.error('Error fetching report job status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch job status', details: error.message },
            { status: 500 }
        );
    }
}

