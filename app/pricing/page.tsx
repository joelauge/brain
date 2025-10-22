import type { NextPage } from "next";
import PricingPage from "@/templates/PricingPage";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Pricing and packages for AI consulting services with BRAIN Media Consulting",
};

const Home: NextPage = () => {
    return <PricingPage />;
};

export default Home;
