"use client";

import { useState } from "react";
import Section from "@/components/Section";
import Tagline from "@/components/Tagline";
import Button from "@/components/Button";
import Image from "@/components/Image";
import { ReadinessAssessment, aiReadinessQuestions } from "@/mocks/ai-readiness-questions";

type ResultsProps = {
    assessment: ReadinessAssessment;
    onRestart: () => void;
};

const Results = ({ assessment, onRestart }: ResultsProps) => {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true);
        setProgress(0);
        setProgressStatus('Generating PDF...');
        
        try {
            const response = await fetch('/api/ai-readiness-assessment/generate-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessment),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                const errorMessage = errorData.details 
                    ? `${errorData.error}: ${errorData.details}`
                    : errorData.error || 'Failed to generate PDF';
                throw new Error(errorMessage);
            }

            setProgress(50);
            setProgressStatus('Preparing download...');

            // Get PDF blob from response
            const blob = await response.blob();
            
            setProgress(100);
            setProgressStatus('Downloading...');

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-readiness-assessment-${assessment.company || 'report'}-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setProgressStatus('Download complete!');
            setTimeout(() => {
                setProgressStatus('');
                setProgress(0);
            }, 2000);
            setIsGeneratingPDF(false);

        } catch (error: any) {
            console.error('Error generating PDF:', error);
            setProgressStatus('');
            setProgress(0);
            alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again or contact support.`);
            setIsGeneratingPDF(false);
        }
    };

    const getStageColor = (stage: number) => {
        if (stage >= 6) return 'text-green-400';
        if (stage >= 4) return 'text-blue-400';
        if (stage >= 2) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getRecommendations = () => {
        const recommendations = [];
        const score = assessment.overallScore || 0;
        const stage = assessment.roadmapStage || 1;
        
        // Stage-based recommendations based on roadmap stages
        if (stage === 1) {
            recommendations.push({
                title: 'Focus on Awareness',
                description: 'Your goal is to explain AI basics and address top fears like cost and privacy. Start with foundational education about AI technologies and their potential benefits.',
                priority: 'High'
            });
            recommendations.push({
                title: 'Build AI Literacy',
                description: 'Invest in training programs to help your team understand what AI is and how it can support your mission without replacing people.',
                priority: 'High'
            });
        } else if (stage === 2) {
            recommendations.push({
                title: 'Focus on Opportunities',
                description: 'Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases where AI can provide immediate value with minimal risk.',
                priority: 'High'
            });
            recommendations.push({
                title: 'Identify Quick Wins',
                description: 'Look for low-risk AI opportunities like automated email responses, document summarization, or data entry that can demonstrate value.',
                priority: 'High'
            });
        } else if (stage === 3) {
            recommendations.push({
                title: 'Focus on Pilots',
                description: 'Your goal is to run small experiments like automated meeting summaries or donor insight reports to prove AI value before broader adoption.',
                priority: 'High'
            });
            recommendations.push({
                title: 'Run Small Experiments',
                description: 'Launch pilot projects in 1-2 departments to test AI tools and gather data on effectiveness before scaling.',
                priority: 'Medium'
            });
        } else if (stage === 4) {
            recommendations.push({
                title: 'Workflow Integration',
                description: 'Begin integrating AI into your core workflows. Automate routine tasks and enhance existing processes with AI capabilities.',
                priority: 'High'
            });
        } else if (stage === 5) {
            recommendations.push({
                title: 'Systems Integration',
                description: 'Integrate AI across multiple systems and departments. Ensure your tech stack works together seamlessly with AI capabilities.',
                priority: 'High'
            });
        } else if (stage >= 6) {
            recommendations.push({
                title: 'Strategic AI Deployment',
                description: 'You\'re ready for strategic, organization-wide AI initiatives. Focus on optimizing existing implementations and exploring advanced use cases.',
                priority: 'High'
            });
        }

        // Add universal recommendations
        recommendations.push({
            title: 'Complete AI Policy Builder',
            description: 'Use our AI Policy Builder tool to create a comprehensive governance framework that addresses privacy, ethics, and compliance requirements.',
            priority: 'Medium'
        });

        recommendations.push({
            title: 'Schedule a Consultation',
            description: 'Book a session with BRAIN Consulting to discuss your specific needs and develop a customized AI adoption roadmap.',
            priority: 'Medium'
        });

        return recommendations;
    };

    const recommendations = getRecommendations();
    const overallScore = assessment.overallScore || 0;
    const categoryScores = assessment.categoryScores || {};

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
                        Your AI Readiness Assessment results are ready. Review your scores and personalized recommendations below.
                    </p>
                </div>

                {/* Overall Score */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Overall AI Readiness Score</Tagline>
                    <div className="text-center mb-8">
                        <div className="inline-block relative w-48 h-48 mx-auto mb-6">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#1a1a1a"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#6366f1"
                                    strokeWidth="8"
                                    strokeDasharray={`${(overallScore / 100) * 283} 283`}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold text-n-1">{overallScore}</span>
                                <span className="text-sm text-n-3">/ 100</span>
                            </div>
                        </div>
                        <h3 className={`h3 mb-2 ${getStageColor(assessment.roadmapStage || 1)}`}>
                            Stage {assessment.roadmapStage || 1}: {assessment.roadmapStageName || 'Awareness & Literacy'}
                        </h3>
                        <p className="body-2 text-n-3 mb-8">
                            {assessment.roadmapStage === 1 && 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.'}
                            {assessment.roadmapStage === 2 && 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.'}
                            {assessment.roadmapStage === 3 && 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.'}
                            {assessment.roadmapStage === 4 && 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.'}
                            {assessment.roadmapStage === 5 && 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.'}
                            {assessment.roadmapStage === 6 && 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.'}
                            {assessment.roadmapStage === 7 && 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.'}
                        </p>
                        
                        {/* All Roadmap Stages */}
                        <div className="mt-8">
                            <h4 className="h6 text-n-1 mb-4">AI Readiness Roadmap</h4>
                            <p className="body-2 text-n-3 mb-6">
                                Your organization is currently at Stage {assessment.roadmapStage || 1}. Below is the complete roadmap showing all stages of AI readiness:
                            </p>
                            <div className="space-y-3">
                                {[
                                    { stage: 1, name: 'Awareness & Literacy', description: 'Focus on Awareness. Your goal is to explain AI basics and address top fears like cost and privacy.' },
                                    { stage: 2, name: 'Opportunity Identification', description: 'Focus on Opportunities. Your goal is to map repetitive tasks and identify 1-3 "Quick-Win" use cases.' },
                                    { stage: 3, name: 'Pilot Projects', description: 'Focus on Pilots. Your goal is to run small experiments like automated meeting summaries or donor insight reports.' },
                                    { stage: 4, name: 'Workflow Integration', description: 'Focus on Workflow Integration. Begin integrating AI into your core operational processes.' },
                                    { stage: 5, name: 'Systems Integration', description: 'Focus on Systems Integration. Integrate AI capabilities across your entire technology infrastructure.' },
                                    { stage: 6, name: 'Strategic AI Deployment', description: 'Focus on Strategic AI Deployment. You\'re ready for organization-wide strategic AI initiatives.' },
                                    { stage: 7, name: 'Fully Integrated, AI-Driven Organization', description: 'Fully Integrated. You have achieved a fully integrated, AI-driven organization.' },
                                ].map((stageInfo) => {
                                    const isCurrent = stageInfo.stage === (assessment.roadmapStage || 1);
                                    return (
                                        <div
                                            key={stageInfo.stage}
                                            className={`p-4 rounded-lg border-l-4 ${
                                                isCurrent
                                                    ? 'bg-color-1/10 border-color-1'
                                                    : 'bg-n-7 border-n-5'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className={`h6 ${isCurrent ? 'text-color-1' : 'text-n-2'}`}>
                                                    Stage {stageInfo.stage}: {stageInfo.name}
                                                </h5>
                                                {isCurrent && (
                                                    <span className="px-3 py-1 bg-color-1 text-n-8 rounded-full text-xs font-bold">
                                                        You are here
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`body-2 ${isCurrent ? 'text-n-2' : 'text-n-3'}`}>
                                                {stageInfo.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Scores Chart */}
                {Object.keys(categoryScores).length > 0 && (
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                        <Tagline className="mb-6">Pillar Scores (0-5 Scale)</Tagline>
                        <div className="space-y-6">
                            {Object.entries(categoryScores).map(([pillarId, score]: [string, any]) => {
                                const question = aiReadinessQuestions.find(q => q.id === pillarId);
                                const pillarName = question?.category || pillarId.replace(/-/g, ' ');
                                const percentage = (score / 5) * 100;
                                return (
                                    <div key={pillarId}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="body-1 text-n-2">{pillarName}</span>
                                            <span className="body-1 text-n-1 font-bold">{score}/5</span>
                                        </div>
                                        <div className="w-full bg-n-7 rounded-full h-3 overflow-hidden">
                                            <div 
                                                className="bg-color-1 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                <div className="mb-15">
                    <Tagline className="mb-6">Recommendations</Tagline>
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
                                    Book a session with our AI readiness experts to discuss your results and develop a customized AI adoption roadmap.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Review Your Detailed Report</h4>
                                <p className="body-2 text-n-3">
                                    Download your comprehensive PDF report with detailed analysis, recommendations, and actionable next steps.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Start Your AI Journey</h4>
                                <p className="body-2 text-n-3">
                                    Begin implementing the recommendations and tracking your progress as you advance your AI readiness.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PDF Download Section */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Download Your Report</Tagline>
                    <div className="text-center">
                        <p className="body-1 text-n-3 mb-6">
                            Download your personalized AI Readiness Assessment report to share with your team and stakeholders.
                        </p>
                        
                        {isGeneratingPDF && (
                            <div className="mb-6">
                                <div className="w-full bg-n-6 rounded-full h-2 mb-4 overflow-hidden">
                                    <div 
                                        className="bg-color-1 h-full rounded-full transition-all duration-300 ease-out"
                                        style={{
                                            width: `${progress}%`,
                                            animation: progressStatus ? 'pulse 2s ease-in-out infinite' : 'none'
                                        }}
                                    />
                                </div>
                                {progressStatus && (
                                    <p className="body-2 text-n-3 animate-pulse">
                                        {progressStatus} ({progress}%)
                                    </p>
                                )}
                            </div>
                        )}
                        
                        <Button 
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            white
                            className="px-8"
                        >
                            {isGeneratingPDF ? 'Generating PDF...' : 'Download Your Assessment Report'}
                        </Button>
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

