import { NextRequest, NextResponse } from 'next/server';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { generateAIPolicyContent } from '@/lib/ai-policy-generator';
import path from 'path';
import fs from 'fs';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#0E0C15',
        padding: 40,
        color: '#FFFFFF',
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #AC6AFF',
        paddingBottom: 20,
    },
    logo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#AC6AFF',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#ADA8C3',
        marginBottom: 30,
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#AC6AFF',
        marginBottom: 10,
        borderLeft: '3px solid #AC6AFF',
        paddingLeft: 10,
    },
    text: {
        fontSize: 12,
        color: '#CAC6DD',
        lineHeight: 1.6,
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        color: '#ADA8C3',
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    value: {
        fontSize: 12,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    list: {
        marginLeft: 20,
        marginTop: 5,
    },
    listItem: {
        fontSize: 11,
        color: '#CAC6DD',
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 10,
        color: '#757185',
        borderTop: '1px solid #3F3A52',
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    logoImage: {
        width: 60,
        height: 20,
        objectFit: 'contain',
    },
    footerLogo: {
        width: 40,
        height: 14,
        objectFit: 'contain',
    },
});

function getStanceLabel(stance: string): string {
    const labels: Record<string, string> = {
        'strict-prohibition': 'Strict Prohibition',
        'highly-restricted': 'Highly Restricted',
        'cautious-exploration': 'Cautious Exploration',
        'moderate-adoption': 'Moderate Adoption',
        'strategic-embrace': 'Strategic Embrace',
        'full-embrace': 'Full Embrace'
    };
    return labels[stance] || stance;
}

function AIPolicyDocument({ 
    assessment, 
    aiContent,
    logoPath
}: { 
    assessment: PolicyAssessment;
    aiContent: Awaited<ReturnType<typeof generateAIPolicyContent>>;
    logoPath: string;
}) {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} alt="" />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Your Draft AI Policy</Text>
                    <Text style={styles.subtitle}>
                        Prepared for {fullName} at {company}
                    </Text>
                    <Text style={styles.subtitle}>
                        Generated on {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Executive Summary</Text>
                    <Text style={styles.text}>{aiContent.executiveSummary}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} alt="" />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        This is a draft policy document prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>

            {/* Policy Content Pages */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} alt="" />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>AI Policy Document</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Policy Statement</Text>
                    <Text style={styles.text}>{aiContent.policyStatement}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Scope and Definitions</Text>
                    <Text style={styles.text}>{aiContent.scopeAndDefinitions}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} alt="" />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 2 of 5 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} alt="" />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>AI Policy Document</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Permitted Uses</Text>
                    <Text style={styles.text}>{aiContent.permittedUses}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Prohibited Uses</Text>
                    <Text style={styles.text}>{aiContent.prohibitedUses}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Data Privacy and Security</Text>
                    <Text style={styles.text}>{aiContent.dataPrivacyAndSecurity}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} alt="" />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 3 of 5 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} alt="" />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>AI Policy Document</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Ethical Guidelines</Text>
                    <Text style={styles.text}>{aiContent.ethicalGuidelines}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Compliance and Governance</Text>
                    <Text style={styles.text}>{aiContent.complianceAndGovernance}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Training and Support</Text>
                    <Text style={styles.text}>{aiContent.trainingAndSupport}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} alt="" />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 4 of 5 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} alt="" />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>AI Policy Document</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Enforcement and Consequences</Text>
                    <Text style={styles.text}>{aiContent.enforcementAndConsequences}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Review and Updates</Text>
                    <Text style={styles.text}>{aiContent.reviewAndUpdates}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Next Steps</Text>
                    <Text style={styles.text}>
                        1. Review this draft policy with your leadership team and legal counsel
                    </Text>
                    <Text style={styles.text}>
                        2. Schedule a consultation with Brain Media Consulting to customize and implement this policy
                    </Text>
                    <Text style={styles.text}>
                        3. Establish your AI governance committee and training program
                    </Text>
                    <Text style={styles.text}>
                        4. Begin phased rollout of AI tools and processes according to this policy
                    </Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} alt="" />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 5 of 5 - This is a draft policy document prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

// Increase function timeout for PDF generation
// Vercel Hobby: 10s max, Pro: 60s max, Enterprise: 300s max
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const assessment: PolicyAssessment = await request.json();

        console.log('Generating PDF for assessment:', { email: assessment.email, company: assessment.company });

        // Validate assessment data
        if (!assessment || !assessment.email) {
            return NextResponse.json(
                { error: 'Invalid assessment data' },
                { status: 400 }
            );
        }

        // Get logo path - convert to base64 data URI for React PDF
        // Use try-catch with timeout to avoid blocking
        let logoPath: string = '';
        try {
            const logoFilePath = path.join(process.cwd(), 'public', 'images', 'brain__white_official_logo.png');
            if (fs.existsSync(logoFilePath)) {
                const logoBuffer = fs.readFileSync(logoFilePath);
                const logoBase64 = logoBuffer.toString('base64');
                logoPath = `data:image/png;base64,${logoBase64}`;
                console.log('✅ Logo loaded successfully');
            } else {
                console.warn('Logo file not found, using text fallback');
            }
        } catch (logoError) {
            console.error('Error loading logo, using text fallback:', logoError);
            // Fallback to text if logo can't be loaded - don't fail the whole request
        }

        // Generate AI policy content with timeout
        console.log('Generating AI policy content...');
        let aiContent;
        try {
            // Add timeout wrapper for AI generation (max 25 seconds)
            const aiGenerationPromise = generateAIPolicyContent(assessment);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('AI generation timeout')), 25000)
            );
            
            aiContent = await Promise.race([aiGenerationPromise, timeoutPromise]) as Awaited<ReturnType<typeof generateAIPolicyContent>>;
            console.log('✅ AI policy content generated successfully');
        } catch (aiError: any) {
            console.error('Error generating AI content, using fallback:', aiError);
            // Fallback to basic content if AI generation fails or times out
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

        const pdfDoc = <AIPolicyDocument assessment={assessment} aiContent={aiContent} logoPath={logoPath} />;
        
        console.log('Rendering PDF to buffer...');
        // Add timeout for PDF rendering (max 20 seconds)
        const renderPromise = renderToBuffer(pdfDoc);
        const renderTimeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('PDF rendering timeout')), 20000)
        );
        
        const pdfBuffer = await Promise.race([renderPromise, renderTimeoutPromise]);
        console.log('PDF buffer generated, size:', pdfBuffer.length);

        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw new Error('PDF buffer is empty');
        }

        // Convert Buffer to Uint8Array for NextResponse
        const pdfArray = Buffer.isBuffer(pdfBuffer) 
            ? new Uint8Array(pdfBuffer) 
            : new Uint8Array(Buffer.from(pdfBuffer));

        return new NextResponse(pdfArray, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="draft-ai-policy-${Date.now()}.pdf"`,
                'Content-Length': pdfArray.length.toString(),
            },
        });
    } catch (error: any) {
        console.error('Error generating PDF:', error);
        console.error('Error stack:', error?.stack);
        console.error('Error message:', error?.message);
        console.error('Error name:', error?.name);
        
        // Check if it's a timeout error
        const isTimeout = error?.message?.includes('timeout') || 
                         error?.message?.includes('504') ||
                         error?.name === 'AbortError';
        
        return NextResponse.json(
            { 
                error: isTimeout ? 'PDF generation timed out. Please try again or contact support.' : 'Failed to generate PDF',
                details: error?.message || 'Unknown error',
                name: error?.name,
                isTimeout,
                stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: isTimeout ? 504 : 500 }
        );
    }
}

