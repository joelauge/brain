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
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pdfDownloaded, setPdfDownloaded] = useState(false);

    const handleGeneratePDF = async () => {
        if (isGeneratingReport || pdfDownloaded) return;
        
        setIsGeneratingReport(true);
        setHasStartedGeneration(true);
        setProgress(0);
        setProgressStatus('Creating report generation job...');
        setError(null);
        
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
                            setProgressStatus('PDF ready! Downloading...');
                            
                            // Download PDF
                            if (jobStatus.pdfUrl) {
                                try {
                                    // Handle data URI
                                    if (jobStatus.pdfUrl.startsWith('data:')) {
                                        // Convert data URI to blob
                                        const base64Data = jobStatus.pdfUrl.split(',')[1];
                                        const byteCharacters = atob(base64Data);
                                        const byteNumbers = new Array(byteCharacters.length);
                                        for (let i = 0; i < byteCharacters.length; i++) {
                                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(byteNumbers);
                                        const blob = new Blob([byteArray], { type: 'application/pdf' });
                                        
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `ai-preparedness-report-${assessment.company || 'report'}-${Date.now()}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } else {
                                        // Regular URL
                                        const response = await fetch(jobStatus.pdfUrl);
                                        const blob = await response.blob();
                                        
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `ai-preparedness-report-${assessment.company || 'report'}-${Date.now()}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    }
                                    
                                        setProgressStatus('Download complete!');
                                        setPdfDownloaded(true);
                                        setTimeout(() => {
                                            setProgressStatus('');
                                            setProgress(0);
                                        }, 2000);
                                } catch (downloadError) {
                                    console.error('Error downloading PDF:', downloadError);
                                    setProgressStatus('');
                                    alert('PDF generated but download failed. Please contact support.');
                                }
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
                        Your personalized AI Preparedness Report has been generated and downloaded.
                    </p>
                </div>

                {/* PDF Download Section */}
                {!pdfDownloaded && (
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                        <Tagline className="mb-6">Your Personalized Report</Tagline>
                        <div className="text-center">
                            <p className="body-1 text-n-3 mb-6">
                                Generate and download your comprehensive AI Preparedness Report. This personalized PDF includes:
                            </p>
                            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-color-1 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="body-2 text-n-2">Executive summary and current state assessment</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-color-1 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="body-2 text-n-2">Recommended learning path and video curriculum</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-color-1 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="body-2 text-n-2">Coaching and consulting recommendations</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-color-1 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="body-2 text-n-2">Implementation roadmap and next steps</span>
                                </li>
                            </ul>
                            
                            <Button 
                                onClick={handleGeneratePDF}
                                disabled={isGeneratingReport}
                                white
                                className="px-8"
                            >
                                {isGeneratingReport ? 'Generating Report...' : 'Generate & Download Report'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {pdfDownloaded && (
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                        <Tagline className="mb-6">Report Downloaded Successfully</Tagline>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-color-1/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-color-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="body-1 text-n-2 mb-6">
                                Your personalized AI Preparedness Report has been downloaded successfully!
                            </p>
                            {progressStatus && (
                                <p className="body-2 text-color-1 mb-4">{progressStatus}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12 mb-15">
                    <Tagline className="mb-6">Next Steps</Tagline>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Review Your Report</h4>
                                <p className="body-2 text-n-3">
                                    Take time to review your personalized recommendations and learning path.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Book a Consultation</h4>
                                <p className="body-2 text-n-3">
                                    Schedule a consultation to discuss your specific goals and how Brain's custom coaching packages can help you achieve them.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 bg-color-1/20 rounded-full flex items-center justify-center mr-4 mt-1">
                                <span className="text-color-1 text-sm font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="h6 text-n-1 mb-2">Begin Your AI Journey</h4>
                                <p className="body-2 text-n-3">
                                    Start implementing your personalized learning path and take advantage of our coaching and consulting services.
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

