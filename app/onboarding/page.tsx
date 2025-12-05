"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Button from "@/components/Button";

const ClientOnboardingContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [showNextSteps, setShowNextSteps] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        projectName: '',
        projectDescription: '',
        quotedAmount: 0,
        assignedConsultant: ''
    });

    useEffect(() => {
        // Get project details from URL params
        const email = searchParams.get('email');
        const projectName = searchParams.get('project');
        
        if (email) {
            setFormData(prev => ({ ...prev, email }));
        }
        if (projectName) {
            setFormData(prev => ({ ...prev, projectName }));
        }
    }, [searchParams]);

    const steps = [
        {
            title: "Welcome to BRAIN",
            subtitle: "Let's get you set up with your project",
            content: (
                <div className="text-center">
                    <div className="w-20 h-20 bg-color-1/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-color-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="h3 text-n-1 mb-4">Your Project Quote is Ready!</h2>
                    <p className="body-2 text-n-3 mb-6">
                        We&apos;ve prepared a custom project proposal for you. Let&apos;s create your account so you can view the details and track progress.
                    </p>
                    {formData.projectName && (
                        <div className="bg-n-8 rounded-xl border border-n-6 p-4 mb-6">
                            <h3 className="h6 text-n-1 mb-2">Project Preview</h3>
                            <p className="body-2 text-n-2">{formData.projectName}</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            title: "Create Your Account",
            subtitle: "Tell us a bit about yourself",
            content: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-n-2 mb-2">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-n-2 mb-2">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                                placeholder="Smith"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-n-2 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                            placeholder="john@company.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-n-2 mb-2">Company (Optional)</label>
                        <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                            placeholder="Acme Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-n-2 mb-2">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Project Details",
            subtitle: "Review your project information",
            content: (
                <div className="space-y-4">
                    <div className="bg-n-8 rounded-xl border border-n-6 p-6">
                        <h3 className="h6 text-n-1 mb-4">Project Overview</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-n-3 mb-1">Project Name</label>
                                <p className="body-2 text-n-1">{formData.projectName || 'Custom AI Project'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-n-3 mb-1">Description</label>
                                <p className="body-2 text-n-2">{formData.projectDescription || 'AI implementation project tailored to your business needs.'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-n-3 mb-1">Assigned Consultant</label>
                                <p className="body-2 text-n-1">{formData.assignedConsultant || 'Joel Auge'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-n-3 mb-1">Quoted Amount</label>
                                <p className="h6 text-color-1">${(formData.quotedAmount / 100).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 className="text-sm font-medium text-blue-400 mb-1">What happens next?</h4>
                                <p className="text-sm text-blue-300">
                                    After creating your account, you&apos;ll be able to view detailed project steps, track progress, 
                                    communicate with your consultant, and manage payments.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Account Created!",
            subtitle: "Welcome to BRAIN",
            content: (
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="h3 text-n-1 mb-4">Account Created Successfully!</h2>
                    <p className="body-2 text-n-3 mb-6">
                        Your account has been created and your project is ready to view. 
                        You can now access your dashboard to see project details and track progress.
                    </p>
                    <div className="bg-n-8 rounded-xl border border-n-6 p-4 mb-6">
                        <button
                            onClick={() => setShowNextSteps(!showNextSteps)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <h3 className="h6 text-n-1">Next Steps</h3>
                            <svg 
                                className={`w-5 h-5 text-n-3 transition-transform duration-200 ${
                                    showNextSteps ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${
                            showNextSteps ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                        }`}>
                            <ul className="text-left space-y-2 text-sm text-n-2">
                                <li>• Review your project details and timeline</li>
                                <li>• Complete the initial 50% payment to begin work</li>
                                <li>• Communicate with your assigned consultant</li>
                                <li>• Track progress through each project step</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Final step - redirect to dashboard
            router.push('/dashboard');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return true; // Welcome step
            case 1:
                return formData.firstName && formData.lastName && formData.email;
            case 2:
                return true; // Project review step
            case 3:
                return true; // Success step
            default:
                return false;
        }
    };

    return (
        <Layout hideFooter>
            <Section className="flex min-h-[calc(100vh-4.8125rem)] overflow-hidden lg:min-h-[calc(100vh-5.3125rem)]">
                <div className="container relative z-2 max-w-2xl m-auto">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-n-2">Step {currentStep + 1} of {steps.length}</span>
                                <span className="text-sm text-n-4">{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
                            </div>
                            <div className="w-full bg-n-7 rounded-full h-2">
                                <div 
                                    className="bg-color-1 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="mb-8">
                            <Heading
                                className="mb-2"
                                textAlignClassName="text-center"
                                titleLarge={steps[currentStep].title}
                                textLarge={steps[currentStep].subtitle}
                            />
                            <div className="mt-6">
                                {steps[currentStep].content}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <Button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="px-6"
                            >
                                Back
                            </Button>
                            
                            {currentStep === steps.length - 1 ? (
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6"
                                >
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={!isStepValid()}
                                    className="px-6"
                                >
                                    {currentStep === steps.length - 2 ? 'Create Account' : 'Next'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Section>
        </Layout>
    );
};

const ClientOnboarding = () => {
    return (
        <Suspense fallback={
            <Layout>
                <Section className="pt-32 pb-16">
                    <div className="container mx-auto text-center">
                        <Heading titleLarge="Loading..." className="mb-8" />
                    </div>
                </Section>
            </Layout>
        }>
            <ClientOnboardingContent />
        </Suspense>
    );
};

export default ClientOnboarding;
