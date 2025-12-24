import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PreparednessAssessment } from '@/mocks/ai-preparedness-questions';
import { PreparednessReport } from '@/lib/ai-preparedness-generator';

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
    logoImage: {
        width: 60,
        height: 20,
        objectFit: 'contain',
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
    footerLogo: {
        width: 40,
        height: 14,
        objectFit: 'contain',
    },
});

export function createPreparednessDocument(
    assessment: PreparednessAssessment,
    report: PreparednessReport,
    logoPath: string
) {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';

    return (
        <Document>
            {/* Cover Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Your AI Preparedness Report</Text>
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
                    <Text style={styles.text}>{report.executiveSummary}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        This report was prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>

            {/* Current State & Knowledge Gaps */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>AI Preparedness Assessment</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current State Assessment</Text>
                    <Text style={styles.text}>{report.currentState}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Knowledge Gaps</Text>
                    <Text style={styles.text}>{report.knowledgeGaps}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 2 of 4 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            {/* Learning Path & Video Curriculum */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Learning Recommendations</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recommended Learning Path</Text>
                    <Text style={styles.text}>{report.recommendedLearningPath}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Video Curriculum</Text>
                    <Text style={styles.text}>{report.videoCurriculum}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 3 of 4 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            {/* Coaching, Consulting & Next Steps */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Coaching & Implementation</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Coaching Recommendations</Text>
                    <Text style={styles.text}>{report.coachingRecommendations}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Consulting Recommendations</Text>
                    <Text style={styles.text}>{report.consultingRecommendations}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Implementation Roadmap</Text>
                    <Text style={styles.text}>{report.implementationRoadmap}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Next Steps</Text>
                    <Text style={styles.text}>{report.nextSteps}</Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 4 of 4 - This report was prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

