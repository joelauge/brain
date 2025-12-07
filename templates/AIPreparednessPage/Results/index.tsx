"use client";

import { useState, useEffect } from "react";
import Section from "@/components/Section";
import Tagline from "@/components/Tagline";
import Button from "@/components/Button";
import { PreparednessAssessment } from "@/mocks/ai-preparedness-questions";
import { PreparednessReport } from "@/lib/ai-preparedness-generator";

type ResultsProps = {
    assessment: PreparednessAssessment;
    onRestart: () => void;
};

const Results = ({ assessment, onRestart }: ResultsProps) => {
    const [isGeneratingReport, setIsGeneratingReport] = useState(true);
    const [progressStatus, setProgressStatus] = useState<string>('Initializing report generation...');
    const [progress, setProgress] = useState<number>(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [report, setReport] = useState<PreparednessReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateReport = async () => {
            setIsGeneratingReport(true);
            setProgress(0);
            setProgressStatus('Creating report generation job...');
            
            try {
                // Step 1: Create job
                const createResponse = await fetch('/api/ai-preparedness/generate-report/queue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assessment),
                });

                if (!createResponse.ok) {
                    const errorData = await createResponse.json().catch(() => ({ error: 'Unknown error' }));
                    throw new Error(errorData.error || 'Failed to create report generation job');
                }

                const { jobId: newJobId } = await createResponse.json();
                setJobId(newJobId);

                // Step 2: Poll for status
                const pollInterval = setInterval(async () => {
                    try {
                        const statusResponse = await fetch(`/api/ai-preparedness/generate-report/status/${newJobId}`);
                        
                        if (!statusResponse.ok) {
                            throw new Error('Failed to fetch job status');
                        }

                        const jobStatus = await statusResponse.json();
                        
                        // Update progress
                        setProgress(jobStatus.progress);
                        setProgressStatus(jobStatus.statusMessage || 'Processing...');

                        // Check if completed
                        if (jobStatus.status === 'completed') {
                            clearInterval(pollInterval);
                            setProgress(100);
                            setProgressStatus('Report ready!');
                            
                            if (jobStatus.reportData) {
                                setReport(jobStatus.reportData);
                            }
                            setIsGeneratingReport(false);
                        } else if (jobStatus.status === 'failed') {
                            clearInterval(pollInterval);
                            setIsGeneratingReport(false);
                            setError(jobStatus.error || 'Report generation failed');
                        }
                    } catch (error: any) {
                        clearInterval(pollInterval);
                        setIsGeneratingReport(false);
                        setError(error.message || 'Failed to generate report');
                    }
                }, 1000); // Poll every second

                // Timeout after 2 minutes
                setTimeout(() => {
                    clearInterval(pollInterval);
                    if (isGeneratingReport) {
                        setIsGeneratingReport(false);
                        setError('Report generation is taking longer than expected. Please try again or contact support.');
                    }
                }, 120000);

            } catch (error: any) {
                console.error('Error generating report:', error);
                setError(error.message || 'Unknown error');
                setIsGeneratingReport(false);
            }
        };

        generateReport();
    }, [assessment]);

    if (isGeneratingReport) {
        return (
            <Section>
                <div className="container max-w-[70rem]">
                    <div className="text-center mb-15">
                        <div className="w-20 h-20 bg-color-1/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-color-1 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h1 className="h1 mb-4">Generating Your Report</h1>
                        <p className="body-1 text-n-3 mb-8">
                            We're analyzing your assessment and creating personalized recommendations...
                        </p>
                        
                        <div className="max-w-md mx-auto">
                            <div className="w-full bg-n-6 rounded-full h-2 mb-4 overflow-hidden">
                                <div 
                                    className="bg-color-1 h-full rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>
                            {progressStatus && (
                                <p className="body-2 text-n-3">
                                    {progressStatus} ({progress}%)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </Section>
        );
    }

    if (error) {
        return (
            <Section>
                <div className="container max-w-[70rem]">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 text-center">
                        <div className="w-20 h-20 bg-color-3/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-color-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="h1 mb-4">Report Generation Failed</h1>
                        <p className="body-1 text-n-3 mb-8">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={onRestart} white>
                                Try Again
                            </Button>
                            <Button href="/booking">
                                Book a Consultation
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <Section>
            <div className="container max-w-[70rem]">
                <div className="text-center mb-15">
                    <div className="w-20 h-20 bg-color-1/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-color-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="h1 mb-4">Your AI Preparedness Report</h1>
                    <p className="body-1 text-n-3 mb-8">
                        Personalized recommendations for your AI learning journey
                    </p>
                </div>

                {/* Executive Summary */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Executive Summary</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.executiveSummary}</p>
                    </div>
                </div>

                {/* Current State */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Current State Assessment</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.currentState}</p>
                    </div>
                </div>

                {/* Knowledge Gaps */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Knowledge Gaps</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.knowledgeGaps}</p>
                    </div>
                </div>

                {/* Recommended Learning Path */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Recommended Learning Path</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.recommendedLearningPath}</p>
                    </div>
                </div>

                {/* Video Curriculum */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Video Curriculum</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.videoCurriculum}</p>
                    </div>
                </div>

                {/* Coaching Recommendations */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Coaching Recommendations</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.coachingRecommendations}</p>
                    </div>
                </div>

                {/* Consulting Recommendations */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Consulting Recommendations</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.consultingRecommendations}</p>
                    </div>
                </div>

                {/* Implementation Roadmap */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Implementation Roadmap</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.implementationRoadmap}</p>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Next Steps</Tagline>
                    <div className="prose prose-invert max-w-none">
                        <p className="body-1 text-n-2 whitespace-pre-line">{report.nextSteps}</p>
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

