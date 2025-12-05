import { NextRequest, NextResponse } from 'next/server';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

function AIPolicyDocument({ assessment }: { assessment: PolicyAssessment }) {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';
    const concerns = Array.isArray(assessment.concerns) ? assessment.concerns : [];
    const useCases = Array.isArray(assessment.useCases) ? assessment.useCases : [];
    const compliance = Array.isArray(assessment.compliance) ? assessment.compliance : [];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.logo}>BRAIN</Text>
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
                    <Text style={styles.text}>
                        This draft AI policy has been prepared based on your organization's assessment 
                        of AI readiness, ethical boundaries, and governance needs. The recommendations 
                        below are tailored to your specific organizational stance and requirements.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Organizational Assessment</Text>
                    <Text style={styles.label}>Current Stance:</Text>
                    <Text style={styles.value}>{getStanceLabel(assessment.stance)}</Text>
                    
                    <Text style={styles.label}>AI Acumen Level:</Text>
                    <Text style={styles.value}>{assessment.acumen}/5</Text>
                    
                    <Text style={styles.label}>Risk Tolerance:</Text>
                    <Text style={styles.value}>{assessment.riskTolerance.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </View>

                {concerns.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Primary Concerns</Text>
                        {concerns.map((concern, index) => (
                            <Text key={index} style={styles.listItem}>• {concern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                        ))}
                    </View>
                )}

                {useCases.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Identified Use Cases</Text>
                        {useCases.map((useCase, index) => (
                            <Text key={index} style={styles.listItem}>• {useCase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                        ))}
                    </View>
                )}

                {compliance.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Compliance Requirements</Text>
                        {compliance.map((req, index) => (
                            <Text key={index} style={styles.listItem}>• {req.toUpperCase()}</Text>
                        ))}
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Training & Support Needs</Text>
                    <Text style={styles.value}>{assessment.training.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended Governance Structure</Text>
                    <Text style={styles.value}>{assessment.governance.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </View>

                {assessment.additionalContext && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Context</Text>
                        <Text style={styles.text}>{assessment.additionalContext}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Next Steps</Text>
                    <Text style={styles.text}>
                        1. Review this draft policy with your leadership team
                    </Text>
                    <Text style={styles.text}>
                        2. Schedule a consultation with Brain Media Consulting to customize and implement
                    </Text>
                    <Text style={styles.text}>
                        3. Establish your AI governance committee and training program
                    </Text>
                </View>

                <Text style={styles.footer}>
                    This is a draft policy document prepared by Brain Media Consulting.{'\n'}
                    For questions or to schedule a consultation, visit brainmediaconsulting.com
                </Text>
            </Page>
        </Document>
    );
}

export async function POST(request: NextRequest) {
    try {
        const assessment: PolicyAssessment = await request.json();

        const pdfDoc = React.createElement(AIPolicyDocument, { assessment });
        const pdfBuffer = await ReactPDF.renderToBuffer(pdfDoc);

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="draft-ai-policy-${Date.now()}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}

