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

        // Step 2: Generate PDF content (30%)
        await updateJobProgress(jobId, 30, 'Generating assessment report...');
        
        // TODO: Implement actual PDF generation using @react-pdf/renderer
        // For now, create a simple placeholder PDF
        await updateJobProgress(jobId, 60, 'Rendering PDF document...');
        
        // Placeholder: Create a simple text-based PDF
        // In production, use @react-pdf/renderer similar to AI Policy Builder
        const pdfContent = generateSimplePDF(assessment);
        await updateJobProgress(jobId, 80, 'PDF generated successfully');

        // Step 3: Save PDF (we'll store it temporarily as base64)
        // In production, use Vercel Blob Storage, S3, or similar
        const pdfBase64 = Buffer.from(pdfContent).toString('base64');
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

function generateSimplePDF(assessment: ReadinessAssessment): string {
    // TODO: Replace with actual PDF generation using @react-pdf/renderer
    // This is a placeholder that returns a simple text representation
    // For now, return a minimal PDF structure
    // In production, implement similar to AI Policy Builder's PDF generation
    
    const pdfText = `
AI Readiness Assessment Report
==============================

Contact Information:
- Name: ${assessment.firstName || ''} ${assessment.lastName || ''}
- Email: ${assessment.email}
- Company: ${assessment.company || 'N/A'}

Assessment Results:
- Overall Score: ${assessment.overallScore || 0}/100
- Readiness Stage: ${assessment.roadmapStageName || 'Awareness & Literacy'} (Stage ${assessment.roadmapStage || 1})

Category Scores:
${Object.entries(assessment.categoryScores || {}).map(([category, score]: [string, any]) => 
    `- ${category}: ${score}/100`
).join('\n')}

This is a placeholder PDF. Implement full PDF generation using @react-pdf/renderer.
    `;
    
    return pdfText;
}
