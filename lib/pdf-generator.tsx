import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PolicyAssessment, aiPolicyQuestions } from '@/mocks/ai-policy-questions';
import { ReadinessAssessment, aiReadinessQuestions } from '@/mocks/ai-readiness-questions';

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
    roadmapStage: {
        marginBottom: 12,
        padding: 10,
        paddingLeft: 12,
    },
    roadmapStageCurrent: {
        backgroundColor: '#6366f1',
        borderLeftWidth: 4,
        borderLeftColor: '#AC6AFF',
        borderLeftStyle: 'solid',
    },
    roadmapStageNormal: {
        backgroundColor: 'transparent',
        borderLeftWidth: 2,
        borderLeftColor: '#3F3A52',
        borderLeftStyle: 'solid',
    },
    roadmapStageTitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    roadmapStageTitleCurrent: {
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    roadmapStageTitleNormal: {
        fontWeight: 'normal',
        color: '#CAC6DD',
    },
    roadmapStageDescription: {
        fontSize: 11,
        lineHeight: 1.4,
    },
    roadmapStageDescriptionCurrent: {
        color: '#E0E0E0',
    },
    roadmapStageDescriptionNormal: {
        color: '#ADA8C3',
    },
});

export function createAIPolicyDocument(
    assessment: PolicyAssessment,
    aiContent: any,
    logoPath: string
) {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';

    // Helper function to get labels for values
    const getLabelForValue = (questionId: string, value: string): string => {
        const question = aiPolicyQuestions.find(q => q.id === questionId);
        if (!question || !question.options) return value;
        const option = question.options.find(opt => opt.value === value);
        return option?.label || value;
    };

    const getConcernLabels = (): string[] => {
        return assessment.concerns
            .filter(c => c !== 'none')
            .map(concern => getLabelForValue('primary-concerns', concern));
    };

    const getUseCaseLabels = (): string[] => {
        return assessment.useCases
            .filter(uc => uc !== 'none')
            .map(useCase => getLabelForValue('use-cases', useCase));
    };

    const getComplianceLabels = (): string[] => {
        return assessment.compliance
            .filter(c => c !== 'none')
            .map(compliance => getLabelForValue('compliance-requirements', compliance));
    };

    const concernLabels = getConcernLabels();
    const useCaseLabels = getUseCaseLabels();
    const complianceLabels = getComplianceLabels();

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
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        This is a draft policy document prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>

            {/* Assessment Details Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Assessment Details</Text>
                </View>

                {/* Primary Concerns */}
                {concernLabels.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Primary Concerns ({concernLabels.length})</Text>
                        {concernLabels.map((concern, index) => (
                            <Text key={index} style={styles.text}>
                                • {concern}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Areas of Opportunity */}
                {useCaseLabels.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Areas of Opportunity ({useCaseLabels.length})</Text>
                        {useCaseLabels.map((useCase, index) => (
                            <Text key={index} style={styles.text}>
                                • {useCase}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Guardrails & Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guardrails & Requirements</Text>
                    
                    {complianceLabels.length > 0 && (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 8 }}>
                                Compliance Requirements:
                            </Text>
                            {complianceLabels.map((compliance, index) => (
                                <Text key={index} style={styles.text}>
                                    • {compliance}
                                </Text>
                            ))}
                        </View>
                    )}

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 8 }}>
                            Risk Management:
                        </Text>
                        <Text style={styles.text}>
                            {getLabelForValue('risk-tolerance', assessment.riskTolerance)} risk tolerance with appropriate safeguards
                        </Text>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 8 }}>
                            Governance Structure:
                        </Text>
                        <Text style={styles.text}>
                            {getLabelForValue('governance-structure', assessment.governance)}
                        </Text>
                    </View>

                    {assessment.additionalContext && (
                        <View>
                            <Text style={{ ...styles.text, fontWeight: 'bold', marginBottom: 8 }}>
                                Additional Context:
                            </Text>
                            <Text style={styles.text}>{assessment.additionalContext}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 2 of 6 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            {/* Policy Content Pages */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
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
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 3 of 6 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
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
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 4 of 6 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
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
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 5 of 6 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
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
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 6 of 6 - This is a draft policy document prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export function createAIReadinessDocument(
    assessment: ReadinessAssessment,
    logoPath: string
) {
    const fullName = [assessment.firstName, assessment.lastName].filter(Boolean).join(' ') || 'Executive';
    const company = assessment.company || 'Your Organization';
    const overallScore = assessment.overallScore || 0;
    const categoryScores = assessment.categoryScores || {};
    const roadmapStage = assessment.roadmapStage || 1;
    const roadmapStageName = assessment.roadmapStageName || 'Awareness & Literacy';

    // Get category names from questions
    const getCategoryName = (pillarId: string): string => {
        const question = aiReadinessQuestions.find(q => q.id === pillarId);
        return question?.category || pillarId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

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
                    <Text style={styles.title}>AI Readiness Assessment Report</Text>
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
                        This AI Readiness Assessment evaluates your organization's preparedness for artificial intelligence adoption across ten critical pillars. Your overall readiness score of {overallScore}/100 places you at Stage {roadmapStage}: {roadmapStageName}.
                    </Text>
                    <Text style={styles.text}>
                        This report provides detailed insights into your organization's strengths and areas for improvement, along with actionable recommendations to advance your AI readiness journey.
                    </Text>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        This assessment report was prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>

            {/* Overall Score Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Overall AI Readiness Score</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Score: {overallScore}/100</Text>
                    <Text style={styles.text}>
                        Your organization has achieved an overall AI readiness score of {overallScore} out of 100. This score reflects your current position across ten critical pillars of AI readiness.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI Readiness Roadmap</Text>
                    <Text style={styles.text}>
                        Your organization is currently at Stage {roadmapStage}: {roadmapStageName}. Below is the complete roadmap showing all stages of AI readiness:
                    </Text>
                    <View style={{ marginTop: 15 }}>
                        {[
                            { stage: 1, name: 'Awareness & Literacy', description: 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.' },
                            { stage: 2, name: 'Opportunity Identification', description: 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.' },
                            { stage: 3, name: 'Pilot Projects', description: 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.' },
                            { stage: 4, name: 'Workflow Integration', description: 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.' },
                            { stage: 5, name: 'Systems Integration', description: 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.' },
                            { stage: 6, name: 'Strategic AI Deployment', description: 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.' },
                            { stage: 7, name: 'Fully Integrated, AI-Driven Organization', description: 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.' },
                        ].map((stageInfo) => {
                            const isCurrent = stageInfo.stage === roadmapStage;
                            return (
                                <View key={stageInfo.stage} style={[
                                    styles.roadmapStage,
                                    isCurrent ? styles.roadmapStageCurrent : styles.roadmapStageNormal
                                ]}>
                                    <Text style={[
                                        styles.roadmapStageTitle,
                                        isCurrent ? styles.roadmapStageTitleCurrent : styles.roadmapStageTitleNormal
                                    ]}>
                                        Stage {stageInfo.stage}: {stageInfo.name} {isCurrent && '← You are here'}
                                    </Text>
                                    <Text style={[
                                        styles.roadmapStageDescription,
                                        isCurrent ? styles.roadmapStageDescriptionCurrent : styles.roadmapStageDescriptionNormal
                                    ]}>
                                        {stageInfo.description}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page 2 - Brain Media Consulting
                    </Text>
                </View>
            </Page>

            {/* Category Scores Page */}
            {Object.keys(categoryScores).length > 0 && (
                <Page size="A4" style={styles.page}>
                    <View style={styles.header}>
                        {logoPath ? (
                            <Image src={logoPath} style={styles.logoImage} />
                        ) : (
                            <Text style={styles.logo}>BRAIN</Text>
                        )}
                        <Text style={styles.title}>Pillar Scores</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Detailed Breakdown (0-5 Scale)</Text>
                        {Object.entries(categoryScores).map(([pillarId, score]: [string, any]) => {
                            const categoryName = getCategoryName(pillarId);
                            return (
                                <View key={pillarId} style={{ marginBottom: 15 }}>
                                    <Text style={styles.text}>
                                        <Text style={{ fontWeight: 'bold' }}>{categoryName}:</Text> {score}/5
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.footer}>
                        {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                        <Text style={{ fontSize: 10, color: '#757185' }}>
                            Page 3 - Brain Media Consulting
                        </Text>
                    </View>
                </Page>
            )}

            {/* Recommendations Page */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoPath ? (
                        <Image src={logoPath} style={styles.logoImage} />
                    ) : (
                        <Text style={styles.logo}>BRAIN</Text>
                    )}
                    <Text style={styles.title}>Recommendations</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Next Steps</Text>
                    <Text style={styles.text}>
                        1. Review this assessment with your leadership team to align on AI readiness priorities
                    </Text>
                    <Text style={styles.text}>
                        2. Schedule a consultation with Brain Media Consulting to develop a customized AI adoption roadmap
                    </Text>
                    <Text style={styles.text}>
                        3. Complete the AI Policy Builder to establish governance frameworks for AI use
                    </Text>
                    <Text style={styles.text}>
                        4. Begin implementing recommendations based on your current roadmap stage
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Priority Actions</Text>
                    {roadmapStage === 1 && (
                        <>
                            <Text style={styles.text}>
                                • Focus on building AI awareness and literacy across your organization
                            </Text>
                            <Text style={styles.text}>
                                • Address common concerns about AI costs and privacy implications
                            </Text>
                            <Text style={styles.text}>
                                • Invest in foundational training programs to help your team understand AI basics
                            </Text>
                        </>
                    )}
                    {roadmapStage === 2 && (
                        <>
                            <Text style={styles.text}>
                                • Map repetitive tasks that could benefit from AI automation
                            </Text>
                            <Text style={styles.text}>
                                • Identify 1-3 "Quick-Win" use cases where AI can provide immediate value
                            </Text>
                            <Text style={styles.text}>
                                • Start with low-risk AI opportunities like automated email responses or document summarization
                            </Text>
                        </>
                    )}
                    {roadmapStage === 3 && (
                        <>
                            <Text style={styles.text}>
                                • Launch pilot projects in 1-2 departments to test AI tools
                            </Text>
                            <Text style={styles.text}>
                                • Run small experiments like automated meeting summaries or donor insight reports
                            </Text>
                            <Text style={styles.text}>
                                • Gather data on effectiveness before scaling to broader adoption
                            </Text>
                        </>
                    )}
                    {roadmapStage >= 4 && (
                        <>
                            <Text style={styles.text}>
                                • Continue integrating AI into core workflows and systems
                            </Text>
                            <Text style={styles.text}>
                                • Optimize existing AI implementations for better performance
                            </Text>
                            <Text style={styles.text}>
                                • Explore advanced use cases and strategic AI initiatives
                            </Text>
                        </>
                    )}
                </View>

                <View style={styles.footer}>
                    {logoPath && <Image src={logoPath} style={styles.footerLogo} />}
                    <Text style={{ fontSize: 10, color: '#757185' }}>
                        Page {Object.keys(categoryScores).length > 0 ? '4' : '3'} - This assessment report was prepared by Brain Media Consulting.{'\n'}
                        For questions or to schedule a consultation, visit brainmediaconsulting.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

