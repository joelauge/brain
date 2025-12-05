import { NextRequest, NextResponse } from 'next/server';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai-policy-builder/generate-pdf/queue
 * Creates a new PDF generation job and returns immediately with job ID
 */
export async function POST(request: NextRequest) {
    try {
        const assessment: PolicyAssessment = await request.json();

        if (!assessment || !assessment.email) {
            return NextResponse.json(
                { error: 'Invalid assessment data' },
                { status: 400 }
            );
        }

        // Create job in database
        // @ts-ignore
        const job = await prisma.pDFGenerationJob.create({
            data: {
                status: 'pending',
                progress: 0,
                statusMessage: 'Job created, waiting to start...',
                assessmentData: JSON.stringify(assessment),
            },
        });

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
            { error: 'Failed to create job' },
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

        const assessment: PolicyAssessment = JSON.parse(job.assessmentData);

        // Step 1: Load logo (10%)
        await updateJobProgress(jobId, 10, 'Loading branding assets...');
        const logoPath = await loadLogo();

        // Step 2: Generate AI content (30%)
        await updateJobProgress(jobId, 20, 'Analyzing your assessment responses...');
        let aiContent;
        try {
            const { generateAIPolicyContent } = await import('@/lib/ai-policy-generator');
            
            // Update progress based on assessment
            const statusMessages = getStatusMessages(assessment);
            for (let i = 0; i < statusMessages.length; i++) {
                await updateJobProgress(
                    jobId,
                    20 + Math.floor((i + 1) / statusMessages.length * 30),
                    statusMessages[i]
                );
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            aiContent = await generateAIPolicyContent(assessment);
            await updateJobProgress(jobId, 50, 'AI policy content generated successfully');
        } catch (aiError: any) {
            console.error('Error generating AI content, using fallback:', aiError);
            await updateJobProgress(jobId, 50, 'Using template content...');
            aiContent = getFallbackContent();
        }

        // Step 3: Generate PDF (60%)
        await updateJobProgress(jobId, 60, 'Rendering PDF document...');
        const pdfBuffer = await generatePDF(assessment, aiContent, logoPath);
        await updateJobProgress(jobId, 80, 'PDF generated successfully');

        // Step 4: Save PDF (we'll store it temporarily or use a storage service)
        // For now, we'll store it as base64 in the database (not ideal for large files, but works)
        // In production, use Vercel Blob Storage, S3, or similar
        const pdfBase64 = pdfBuffer.toString('base64');
        const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

        // Step 5: Mark as complete
        // @ts-ignore
        await prisma.pDFGenerationJob.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                progress: 100,
                statusMessage: 'PDF ready for download!',
                pdfUrl: pdfDataUri, // In production, upload to storage and use URL
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

function getStatusMessages(assessment: PolicyAssessment): string[] {
    const messages = [];
    
    if (assessment.stance === 'strict-prohibition' || assessment.stance === 'highly-restricted') {
        messages.push('Analyzing your strict AI guidelines...');
    } else if (assessment.stance === 'full-embrace') {
        messages.push('Crafting comprehensive AI adoption framework...');
    } else {
        messages.push('Reviewing your organizational stance...');
    }

    if (assessment.concerns.includes('data-privacy')) {
        messages.push('Incorporating data privacy requirements...');
    }
    if (assessment.concerns.includes('compliance')) {
        messages.push('Addressing compliance considerations...');
    }
    if (assessment.concerns.includes('bias-discrimination')) {
        messages.push('Integrating ethical guidelines...');
    }

    if (assessment.useCases.length > 0) {
        messages.push(`Tailoring policy for ${assessment.useCases.length} identified use case${assessment.useCases.length > 1 ? 's' : ''}...`);
    }

    if (assessment.compliance.length > 0) {
        messages.push(`Ensuring ${assessment.compliance.join(', ').toUpperCase()} compliance...`);
    }

    if (assessment.governance === 'centralized') {
        messages.push('Structuring centralized governance framework...');
    } else if (assessment.governance === 'decentralized') {
        messages.push('Designing decentralized governance model...');
    }

    messages.push('Generating comprehensive policy document...');
    
    return messages;
}

function getFallbackContent() {
    return {
        executiveSummary: 'This draft AI policy has been prepared based on your organization\'s assessment of AI readiness, ethical boundaries, and governance needs. The recommendations below are tailored to your specific organizational stance and requirements.',
        policyStatement: 'This organization recognizes the transformative potential of artificial intelligence and is committed to its responsible use. This policy establishes guidelines for AI adoption, use, and governance.',
        scopeAndDefinitions: 'This policy applies to all employees, contractors, and third parties using AI tools or systems on behalf of the organization. AI is defined as any system capable of performing tasks that typically require human intelligence.',
        permittedUses: 'AI may be used in approved scenarios that align with organizational goals, comply with all applicable regulations, and maintain ethical standards.',
        prohibitedUses: 'AI use is prohibited in scenarios that violate privacy, security, compliance requirements, or ethical guidelines.',
        dataPrivacyAndSecurity: 'All AI use must comply with data privacy regulations, maintain appropriate security measures, and protect sensitive information.',
        ethicalGuidelines: 'AI use must be transparent, fair, accountable, and free from bias. All AI decisions must be explainable and subject to human oversight.',
        complianceAndGovernance: 'AI use must comply with all applicable regulations and be subject to appropriate governance and oversight.',
        trainingAndSupport: 'Training and support will be provided to ensure all users understand and comply with this policy.',
        enforcementAndConsequences: 'Violations of this policy will be subject to disciplinary action, up to and including termination.',
        reviewAndUpdates: 'This policy will be reviewed and updated regularly to reflect changes in technology, regulations, and organizational needs.',
    };
}

async function generatePDF(
    assessment: PolicyAssessment,
    aiContent: any,
    logoPath: string
): Promise<Buffer> {
    const { renderToBuffer } = await import('@react-pdf/renderer');
    const { createAIPolicyDocument } = await import('@/lib/pdf-generator');
    
    const pdfDoc = createAIPolicyDocument(assessment, aiContent, logoPath);
    const pdfBuffer = await renderToBuffer(pdfDoc);
    
    // renderToBuffer already returns a Buffer, just ensure it's a Buffer type
    return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
}

