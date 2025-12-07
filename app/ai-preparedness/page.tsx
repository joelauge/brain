import type { NextPage } from "next";
import AIPreparednessPage from "@/templates/AIPreparednessPage";

export const metadata = {
    title: "AI Preparedness Assessment | BRAIN Media Consulting",
    description: "Assess your personal AI readiness as an executive. Get personalized recommendations for upskilling, coaching, and AI implementation consulting.",
};

const AIPreparedness: NextPage = () => {
    return <AIPreparednessPage />;
};

export default AIPreparedness;

