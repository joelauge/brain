import { NextRequest, NextResponse } from 'next/server';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';
import { renderToBuffer } from '@react-pdf/renderer';
import { createAIPolicyDocument } from '@/lib/pdf-generator';
import path from 'path';
import fs from 'fs';

/**
 * POST /api/ai-policy-builder/generate-pdf
 * Generates PDF synchronously and returns it directly (no database needed)
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

        // Generate AI content (with fallback to template)
        let aiContent;
        try {
            const { generateAIPolicyContent } = await import('@/lib/ai-policy-generator');
            // Set a timeout for AI generation (10 seconds)
            const aiPromise = generateAIPolicyContent(assessment);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('AI generation timeout')), 10000)
            );
            
            aiContent = await Promise.race([aiPromise, timeoutPromise]) as any;
        } catch (aiError: any) {
            console.error('Error generating AI content, using fallback:', aiError);
            // Use fallback template content
            aiContent = {
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

        // Generate PDF
        const pdfDoc = createAIPolicyDocument(assessment, aiContent, logoPath);
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
                'Content-Disposition': `attachment; filename="draft-ai-policy-${assessment.company || 'policy'}-${Date.now()}.pdf"`,
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
