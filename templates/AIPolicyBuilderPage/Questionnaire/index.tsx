"use client";

import { useState } from "react";
import Section from "@/components/Section";
import Tagline from "@/components/Tagline";
import Button from "@/components/Button";
import { aiPolicyQuestions, PolicyAssessment } from "@/mocks/ai-policy-questions";

type QuestionnaireProps = {
    onComplete: (assessment: PolicyAssessment) => void;
};

const Questionnaire = ({ onComplete }: QuestionnaireProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [showEmailCapture, setShowEmailCapture] = useState(false);
    const [emailData, setEmailData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        company: ''
    });

    const question = aiPolicyQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / aiPolicyQuestions.length) * 100;

    const handleAnswer = (value: any) => {
        setAnswers(prev => ({
            ...prev,
            [question.id]: value
        }));
    };

    const handleNext = () => {
        if (currentQuestion < aiPolicyQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Show email capture before completing
            setShowEmailCapture(true);
        }
    };

    const handleEmailSubmit = async () => {
        if (!emailData.email) return;

        // Complete assessment
        const assessment: PolicyAssessment = {
            email: emailData.email,
            firstName: emailData.firstName,
            lastName: emailData.lastName,
            company: emailData.company,
            stance: answers['org-stance'] || '',
            acumen: answers['ai-acumen'] || '',
            concerns: answers['primary-concerns'] || [],
            useCases: answers['use-cases'] || [],
            riskTolerance: answers['risk-tolerance'] || '',
            compliance: answers['compliance-requirements'] || [],
            training: answers['training-needs'] || '',
            governance: answers['governance-structure'] || '',
            additionalContext: answers['specific-concerns'] || ''
        };

        // Send to API
        try {
            await fetch('/api/ai-policy-builder/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assessment),
            });
        } catch (error) {
            console.error('Error capturing lead:', error);
        }

        onComplete(assessment);
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const isAnswerValid = () => {
        const answer = answers[question.id];
        if (question.required) {
            if (question.type === 'multiple') {
                return Array.isArray(answer) && answer.length > 0;
            }
            return answer !== undefined && answer !== '';
        }
        return true;
    };

    if (showEmailCapture) {
        return (
            <Section id="questionnaire">
                <div className="container max-w-[70rem]">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12">
                        <div className="mb-8 text-center">
                            <h2 className="h3 mb-4 text-n-1">Almost There!</h2>
                            <p className="body-2 text-n-3">
                                Please provide your contact information to receive your personalized AI policy recommendations.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Email Address *</label>
                                <input
                                    type="email"
                                    value={emailData.email}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-xl focus:border-color-1 focus:outline-none"
                                    placeholder="executive@company.com"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-n-2 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={emailData.firstName}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-xl focus:border-color-1 focus:outline-none"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-n-2 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={emailData.lastName}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-xl focus:border-color-1 focus:outline-none"
                                        placeholder="Smith"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={emailData.company}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, company: e.target.value }))}
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-xl focus:border-color-1 focus:outline-none"
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-n-6">
                            <Button
                                onClick={() => setShowEmailCapture(false)}
                                className="px-6"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleEmailSubmit}
                                disabled={!emailData.email}
                                className="px-6"
                                white
                            >
                                Get My Results
                            </Button>
                        </div>
                    </div>
                </div>
            </Section>
        );
    }

    return (
        <Section id="questionnaire">
            <div className="container max-w-[70rem]">
                {/* Progress Indicator */}
                <div className="mb-15">
                    <div className="flex items-center justify-between mb-4">
                        <Tagline>Question {currentQuestion + 1} of {aiPolicyQuestions.length}</Tagline>
                        <span className="body-2 text-n-4">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full bg-n-7 rounded-full h-2">
                        <div 
                            className="bg-color-1 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-n-8 rounded-2xl border border-n-6 p-8 md:p-12">
                    <div className="mb-8">
                        <Tagline className="mb-4">{question.category}</Tagline>
                        <h2 className="h3 mb-4 text-n-1">{question.question}</h2>
                        {question.description && (
                            <p className="body-2 text-n-3">{question.description}</p>
                        )}
                    </div>

                    {/* Answer Options */}
                    <div className="space-y-4 mb-8">
                        {question.type === 'single' && question.options?.map((option) => {
                            const isSelected = answers[question.id] === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-color-1 bg-color-1/10'
                                            : 'border-n-6 bg-n-7 hover:border-n-5'
                                    }`}
                                >
                                    <div className="flex items-start">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 mt-0.5 ${
                                            isSelected ? 'border-color-1 bg-color-1' : 'border-n-4'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-full h-full rounded-full bg-n-1 m-0.5" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="h6 text-n-1 mb-1">{option.label}</h3>
                                            {option.description && (
                                                <p className="body-2 text-n-3">{option.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}

                        {question.type === 'multiple' && question.options?.map((option) => {
                            const selectedAnswers = answers[question.id] || [];
                            const isSelected = Array.isArray(selectedAnswers) && selectedAnswers.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        const current = selectedAnswers || [];
                                        if (isSelected) {
                                            handleAnswer(current.filter((v: string) => v !== option.value));
                                        } else {
                                            handleAnswer([...current, option.value]);
                                        }
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-color-1 bg-color-1/10'
                                            : 'border-n-6 bg-n-7 hover:border-n-5'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 w-5 h-5 rounded border-2 mr-4 ${
                                            isSelected ? 'border-color-1 bg-color-1' : 'border-n-4'
                                        }`}>
                                            {isSelected && (
                                                <svg className="w-full h-full text-n-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="body-1 text-n-1">{option.label}</span>
                                    </div>
                                </button>
                            );
                        })}

                        {question.type === 'scale' && question.options?.map((option) => {
                            const isSelected = answers[question.id] === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleAnswer(option.value)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? 'border-color-1 bg-color-1/10'
                                            : 'border-n-6 bg-n-7 hover:border-n-5'
                                    }`}
                                >
                                    <span className="body-1 text-n-1">{option.label}</span>
                                </button>
                            );
                        })}

                        {question.type === 'text' && (
                            <textarea
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                                className="w-full bg-n-7 border border-n-5 text-n-1 px-4 py-3 rounded-xl focus:border-color-1 focus:outline-none min-h-[8rem]"
                                placeholder="Share any additional context, concerns, or goals..."
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t border-n-6">
                        <Button
                            onClick={handleBack}
                            disabled={currentQuestion === 0}
                            className="px-6"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!isAnswerValid()}
                            className="px-6"
                            white
                        >
                            {currentQuestion === aiPolicyQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Questionnaire;

