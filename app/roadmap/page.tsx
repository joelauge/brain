import type { NextPage } from "next";
import RoadmapPage from "@/templates/RoadmapPage";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Roadmap and future plans for BRAIN Media Consulting AI services",
};

const Home: NextPage = () => {
    return <RoadmapPage />;
};

export default Home;
