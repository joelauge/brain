import { NextRequest, NextResponse } from 'next/server';
import { ReadinessAssessment } from '@/mocks/ai-readiness-questions';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai-readiness-assessment/generate-pdf/queue
 * Creates a new PDF generation job and returns immediately with job ID
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

        // Create job in database
        let job;
        try {
            // @ts-ignore - Prisma Client type generation
            job = await prisma.pDFGenerationJob.create({
                data: {
                    status: 'pending',
                    progress: 0,
                    statusMessage: 'Job created, waiting to start...',
                    assessmentData: JSON.stringify(assessment),
                },
            });
        } catch (dbError: any) {
            console.error('Database error creating job:', dbError);
            // If table doesn't exist, provide helpful error
            if (dbError?.message?.includes('does not exist') || dbError?.code === 'P2001') {
                console.error('PDFGenerationJob table may not exist. Run: npx prisma db push');
                throw new Error('Database table not found. Please run database migrations.');
            }
            throw dbError;
        }

        // Start processing in background (don't await)
        processPDFJob(job.id).catch((error) => {
            console.error(`Error processing job ${job.id}:`, error);
        });

        return NextResponse.json({
            jobId: job.id,
            status: job.status,
            progress: job.progress,
            statusMessage: job.statusMessage,
        });
    } catch (error: any) {
        console.error('Error creating PDF generation job:', error);
        console.error('Error details:', {
            message: error?.message,
            name: error?.name,
            stack: error?.stack,
        });
        return NextResponse.json(
            { 
                error: 'Failed to create job',
                details: process.env.NODE_ENV === 'development' ? error?.message : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * Background job processor
 */
async function processPDFJob(jobId: string) {
    try {
        // Update status to processing
        // @ts-ignore
        await prisma.pDFGenerationJob.update({
            where: { id: jobId },
            data: {
                status: 'processing',
                progress: 5,
                statusMessage: 'Starting PDF generation...',
            },
        });

        // Get assessment data
        // @ts-ignore
        const job = await prisma.pDFGenerationJob.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        const assessment: ReadinessAssessment = JSON.parse(job.assessmentData);

        // Step 1: Load logo (10%)
        await updateJobProgress(jobId, 10, 'Loading branding assets...');
        const logoPath = await loadLogo();

        // Step 2: Generate PDF (60%)
        await updateJobProgress(jobId, 60, 'Rendering PDF document...');
        const pdfBuffer = await generatePDF(assessment, logoPath);
        await updateJobProgress(jobId, 80, 'PDF generated successfully');

        // Step 3: Save PDF (we'll store it temporarily or use a storage service)
        // For now, we'll store it as base64 in the database (not ideal for large files, but works)
        // In production, use Vercel Blob Storage, S3, or similar
        const pdfBase64 = pdfBuffer.toString('base64');
        const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

        // Step 4: Mark as complete
        // @ts-ignore
        await prisma.pDFGenerationJob.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                progress: 100,
                statusMessage: 'PDF ready for download!',
                pdfUrl: pdfDataUri,
                completedAt: new Date(),
            },
        });

        console.log(`✅ Job ${jobId} completed successfully`);
    } catch (error: any) {
        console.error(`Error processing job ${jobId}:`, error);
        // @ts-ignore
        await prisma.pDFGenerationJob.update({
            where: { id: jobId },
            data: {
                status: 'failed',
                error: error.message || 'Unknown error',
                statusMessage: 'PDF generation failed. Please try again.',
            },
        });
    }
}

async function updateJobProgress(jobId: string, progress: number, statusMessage: string) {
    try {
        // @ts-ignore
        await prisma.pDFGenerationJob.update({
            where: { id: jobId },
            data: {
                progress,
                statusMessage,
            },
        });
    } catch (error) {
        console.error(`Error updating job progress for ${jobId}:`, error);
    }
}

async function loadLogo(): Promise<string> {
    try {
        const path = await import('path');
        const fs = await import('fs');
        const logoFilePath = path.join(process.cwd(), 'public', 'images', 'brain__white_official_logo.png');
        if (fs.existsSync(logoFilePath)) {
            const logoBuffer = fs.readFileSync(logoFilePath);
            const logoBase64 = logoBuffer.toString('base64');
            return `data:image/png;base64,${logoBase64}`;
        }
    } catch (error) {
        console.error('Error loading logo:', error);
    }
    return '';
}

async function generatePDF(
    assessment: ReadinessAssessment,
    logoPath: string
): Promise<Buffer> {
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { createAIReadinessDocument } = await import('@/lib/pdf-generator');
    
    const pdfDoc = createAIReadinessDocument(assessment, logoPath);
    const pdfBuffer = await renderToBuffer(pdfDoc);
    
    // renderToBuffer already returns a Buffer, just ensure it's a Buffer type
    return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
}

