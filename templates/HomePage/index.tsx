"use client";

import Layout from "@/components/Layout";
import Hero from "./Hero";
import Benefits from "./Benefits";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import AIPolicyBuilder from "./AIPolicyBuilder";
import Join from "@/components/Join";

const HomePage = () => {
    return (
        <Layout>
            <Hero />
            <Benefits />
            <Features />
            <HowItWorks />
            <AIPolicyBuilder />
            <Join />
        </Layout>
    );
};

export default HomePage;
