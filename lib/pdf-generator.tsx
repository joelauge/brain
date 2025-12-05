import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PolicyAssessment } from '@/mocks/ai-policy-questions';

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

export function createAIPolicyDocument(
    assessment: PolicyAssessment,
    aiContent: any,
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

