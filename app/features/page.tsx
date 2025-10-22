import type { NextPage } from "next";
import FeaturesPage from "@/templates/FeaturesPage";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Discover our AI consulting features and services with BRAIN Media Consulting",
};

const Home: NextPage = () => {
    return <FeaturesPage />;
};

export default Home;
