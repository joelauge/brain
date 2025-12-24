"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Join from "@/components/Join";
import Hero from "./Hero";
import Questionnaire from "./Questionnaire";
import Results from "./Results";
import { PreparednessAssessment } from "@/mocks/ai-preparedness-questions";

const AIPreparednessPage = () => {
    const [assessment, setAssessment] = useState<PreparednessAssessment | null>(null);
    const [showResults, setShowResults] = useState(false);

    const handleComplete = (completedAssessment: PreparednessAssessment) => {
        setAssessment(completedAssessment);
        setShowResults(true);
    };

    const handleRestart = () => {
        setAssessment(null);
        setShowResults(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <Layout>
            <Hero />
            {!showResults ? (
                <Questionnaire onComplete={handleComplete} />
            ) : (
                assessment && <Results assessment={assessment} onRestart={handleRestart} />
            )}
            {!showResults && <Join />}
        </Layout>
    );
};

export default AIPreparednessPage;

