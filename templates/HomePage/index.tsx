"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
import YouTubeCarousel from "./YouTubeCarousel";
import AIPolicyBuilder from "./AIPolicyBuilder";
import Benefits from "./Benefits";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Join from "@/components/Join";

const HomePage = () => {
    return (
        <Layout>
            <Hero />
            <YouTubeCarousel />
            <AIPolicyBuilder />
            <Benefits />
            <Features />
            <HowItWorks />
            <Join />
        </Layout>
    );
};

export default HomePage;
