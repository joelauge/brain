import type { NextPage } from "next";
import AIReadinessAssessmentPage from "@/templates/AIReadinessAssessmentPage";

export const metadata = {
    title: "AI Readiness Assessment | BRAIN Media Consulting",
    description: "Discover your organization's AI readiness level. Get personalized insights, recommendations, and a comprehensive assessment to guide your AI adoption journey.",
};

const AIReadinessAssessment: NextPage = () => {
    return <AIReadinessAssessmentPage />;
};

export default AIReadinessAssessment;
