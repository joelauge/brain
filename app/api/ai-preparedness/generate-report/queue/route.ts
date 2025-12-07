import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePreparednessReport } from '@/lib/ai-preparedness-generator';
import { PreparednessAssessment } from '@/mocks/ai-preparedness-questions';

async function processReportJob(jobId: string) {
    try {
        // @ts-ignore
        await prisma.preparednessReportJob.update({
            where: { id: jobId },
            data: {
                status: 'processing',
                progress: 10,
                statusMessage: 'Analyzing your assessment...',
            },
        });

        // @ts-ignore
        const job = await prisma.preparednessReportJob.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        const assessment: PreparednessAssessment = JSON.parse(job.assessmentData);

        // Update progress
        // @ts-ignore
        await prisma.preparednessReportJob.update({
            where: { id: jobId },
            data: {
                progress: 30,
                statusMessage: 'Generating personalized recommendations...',
            },
        });

        // Generate AI report
        const report = await generatePreparednessReport(assessment);

        // Update progress
        // @ts-ignore
        await prisma.preparednessReportJob.update({
            where: { id: jobId },
            data: {
                progress: 80,
                statusMessage: 'Finalizing your report...',
            },
        });

        // Save report
        // @ts-ignore
        await prisma.preparednessReportJob.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                progress: 100,
                statusMessage: 'Report ready!',
                reportData: JSON.stringify(report),
                completedAt: new Date(),
            },
        });
    } catch (error: any) {
        console.error('Error processing report job:', error);
        try {
            // @ts-ignore
            await prisma.preparednessReportJob.update({
                where: { id: jobId },
                data: {
                    status: 'failed',
                    error: error.message || 'Unknown error',
                    statusMessage: 'Failed to generate report',
                },
            });
        } catch (updateError) {
            console.error('Error updating failed job:', updateError);
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const assessment: PreparednessAssessment = await request.json();

        // Create job
        // @ts-ignore
        const job = await prisma.preparednessReportJob.create({
            data: {
                status: 'pending',
                progress: 0,
                statusMessage: 'Creating report generation job...',
                assessmentData: JSON.stringify(assessment),
            },
        });

        // Process in background (don't await)
        processReportJob(job.id).catch(console.error);

        return NextResponse.json({ jobId: job.id });
    } catch (error: any) {
        console.error('Error creating report job:', error);
        return NextResponse.json(
            { error: 'Failed to create report job', details: error.message },
            { status: 500 }
        );
    }
}

