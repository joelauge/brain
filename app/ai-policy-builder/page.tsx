import type { NextPage } from "next";
import AIPolicyBuilderPage from "@/templates/AIPolicyBuilderPage";

export const metadata = {
    title: "AI Policy Builder | BRAIN Media Consulting",
    description: "Assess your organization's AI readiness, ethical boundaries, and governance needs. Build a comprehensive AI policy tailored to your executive leadership and teams.",
};

const AIPolicyBuilder: NextPage = () => {
    return <AIPolicyBuilderPage />;
};

export default AIPolicyBuilder;

