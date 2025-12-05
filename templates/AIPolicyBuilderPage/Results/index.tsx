"use client";

import Section from "@/components/Section";
import Tagline from "@/components/Tagline";
import Button from "@/components/Button";
import Image from "@/components/Image";
import { PolicyAssessment } from "@/mocks/ai-policy-questions";

type ResultsProps = {
    assessment: PolicyAssessment;
    onRestart: () => void;
};

const Results = ({ assessment, onRestart }: ResultsProps) => {
    const getStanceLabel = (stance: string) => {
        const labels: Record<string, string> = {
            'strict-prohibition': 'Strict Prohibition',
            'highly-restricted': 'Highly Restricted',
            'cautious-exploration': 'Cautious Exploration',
            'moderate-adoption': 'Moderate Adoption',
            'strategic-embrace': 'Strategic Embrace',
            'full-embrace': 'Full Embrace'
        };
        return labels[stance] || stance;
    };

    const getRecommendations = () => {
        const recommendations = [];
        
        if (assessment.stance === 'strict-prohibition' || assessment.stance === 'highly-restricted') {
            recommendations.push({
                title: 'Clear Prohibition Policy',
                description: 'Develop a comprehensive policy that clearly defines prohibited AI uses, exceptions, and enforcement mechanisms.',
                priority: 'High'
            });
        }

        if (parseInt(assessment.acumen) <= 2) {
            recommendations.push({
                title: 'AI Education & Training',
                description: 'Implement comprehensive AI literacy programs for leadership and teams to build foundational understanding.',
                priority: 'High'
            });
        }

        if (assessment.concerns.includes('data-privacy') || assessment.compliance.includes('gdpr') || assessment.compliance.includes('ccpa')) {
            recommendations.push({
                title: 'Data Privacy Framework',
                description: 'Establish strict data handling protocols, consent mechanisms, and privacy impact assessments for AI systems.',
                priority: 'High'
            });
        }

        if (assessment.riskTolerance === 'very-low' || assessment.riskTolerance === 'low') {
            recommendations.push({
                title: 'Risk Management Framework',
                description: 'Implement comprehensive risk assessment, monitoring, and mitigation strategies for all AI initiatives.',
                priority: 'High'
            });
        }

        if (assessment.training === 'ongoing-support') {
            recommendations.push({
                title: 'Continuous Learning Program',
                description: 'Establish ongoing training, resources, and support systems to keep teams updated on AI developments.',
                priority: 'Medium'
            });
        }

        if (assessment.governance === 'none') {
            recommendations.push({
                title: 'Governance Structure',
                description: 'Design and implement an AI governance committee or structure appropriate for your organization size and needs.',
                priority: 'High'
            });
        }

        return recommendations;
    };

    const recommendations = getRecommendations();

    return (
        <Section>
            <div className="container max-w-[70rem]">
                <div className="text-center mb-15">
                    <div className="w-20 h-20 bg-color-1/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-color-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="h1 mb-4">Assessment Complete</h1>
                    <p className="body-1 text-n-3 mb-8">
                        Based on your responses, we've prepared recommendations for your AI policy framework.
                    </p>
                </div>

                {/* Assessment Summary */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Assessment Summary</Tagline>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="h6 text-n-2 mb-2">Organizational Stance</h3>
                            <p className="body-1 text-n-1">{getStanceLabel(assessment.stance)}</p>
                        </div>
                        <div>
                            <h3 className="h6 text-n-2 mb-2">AI Acumen Level</h3>
                            <p className="body-1 text-n-1">{assessment.acumen}/5</p>
                        </div>
                        <div>
                            <h3 className="h6 text-n-2 mb-2">Risk Tolerance</h3>
                            <p className="body-1 text-n-1 capitalize">{assessment.riskTolerance.replace('-', ' ')}</p>
                        </div>
                        <div>
                            <h3 className="h6 text-n-2 mb-2">Primary Concerns</h3>
                            <p className="body-1 text-n-1">{assessment.concerns.length} identified</p>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mb-15">
                    <Tagline className="mb-6">Policy Recommendations</Tagline>
                    <ul className="space-y-6">
                        {recommendations.map((rec, index) => (
                            <li
                                key={index}
                                className="relative bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12"
                            >
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-14 h-14 mr-6">
                                        <Image
                                            src="/images/roadmap/done.svg"
                                            width={56}
                                            height={56}
                                            alt="Recommendation"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="h5 text-n-1">{rec.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                rec.priority === 'High' 
                                                    ? 'bg-color-3/20 text-color-3' 
                                                    : 'bg-color-4/20 text-color-4'
                                            }`}>
                                                {rec.priority} Priority
                                            </span>
                                        </div>
                                        <p className="body-2 text-n-3">{rec.description}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Next Steps */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Next Steps</Tagline>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Schedule a Consultation</h4>
                                <p className="body-2 text-n-3">
                                    Book a session with our AI policy experts to discuss your specific needs and develop a customized policy framework.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Review Policy Templates</h4>
                                <p className="body-2 text-n-3">
                                    We'll provide tailored policy templates based on your assessment results and organizational requirements.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Implementation Support</h4>
                                <p className="body-2 text-n-3">
                                    Receive ongoing support for policy implementation, training, and governance structure setup.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button href="/booking" white>
                        Book a Consultation
                    </Button>
                    <Button onClick={onRestart}>
                        Start New Assessment
                    </Button>
                </div>
            </div>
        </Section>
    );
};

export default Results;

