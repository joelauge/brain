import "@splidejs/react-splide/css";
import "tippy.js/animations/shift-toward.css";
import "./globals.css";
import { Sora, Source_Code_Pro, Space_Grotesk } from "next/font/google";
import ClerkWrapper from "@/components/ClerkWrapper";
import { ReactNode } from "react";
import Script from "next/script";

const sora = Sora({
    weight: ["300", "400", "600"],
    subsets: ["latin"],
    display: "block",
    variable: "--font-sora",
});

const code = Source_Code_Pro({
    weight: ["400", "600", "700"],
    subsets: ["latin"],
    display: "block",
    variable: "--font-code",
});

const grotesk = Space_Grotesk({
    weight: ["300"],
    subsets: ["latin"],
    display: "block",
    variable: "--font-grotesk",
});

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description:
        "Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business.",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ClerkWrapper>
            <html lang="en">
                <head>
                <meta
                    content="AI Consulting with BRAIN Media Consulting"
                    name="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                />
                <meta
                    content="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                    property="og:title"
                />
                <meta
                    content="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                    property="og:description"
                />
                <meta
                    content="%PUBLIC_URL%/fb-og-image.png"
                    property="og:image"
                />
                <meta
                    property="og:url"
                    content="https://ui8.net/ui8/products/brainwave-ai-landing-page-kit"
                />
                <meta
                    property="og:site_name"
                    content="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                />
                <meta
                    content="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                    property="twitter:title"
                />
                <meta
                    content="Professional AI consulting services with Joel and Dave. Get personalized guidance on AI tools, strategies, and implementation for your business."
                    property="twitter:description"
                />
                <meta
                    content="%PUBLIC_URL%/twitter-card.png"
                    property="twitter:image"
                />
                <meta property="og:type" content="Article" />
                <meta content="summary" name="twitter:card" />
                <meta name="twitter:site" content="@ui8" />
                <meta name="twitter:creator" content="@ui8" />
                <meta property="fb:admins" content="132951670226590" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1"
                />
                <meta name="msapplication-TileColor" content="#da532c" />
                <meta name="theme-color" content="#ffffff" />
                {/* Google tag (gtag.js) */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-X65K98S312"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-X65K98S312');
                    `}
                </Script>
            </head>
            <body
                className={`${sora.variable} ${code.variable} ${grotesk.variable} font-sans bg-n-8 text-n-1 text-base`}
            >
                {children}
                <svg className="block" width={0} height={0}>
                    <defs>
                        <linearGradient
                            id="btn-left"
                            x1="50%"
                            x2="50%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#89F9E8" />
                            <stop offset="100%" stopColor="#FACB7B" />
                        </linearGradient>
                        <linearGradient
                            id="btn-top"
                            x1="100%"
                            x2="0%"
                            y1="50%"
                            y2="50%"
                        >
                            <stop offset="0%" stopColor="#D87CEE" />
                            <stop offset="100%" stopColor="#FACB7B" />
                        </linearGradient>
                        <linearGradient
                            id="btn-bottom"
                            x1="100%"
                            x2="0%"
                            y1="50%"
                            y2="50%"
                        >
                            <stop offset="0%" stopColor="#9099FC" />
                            <stop offset="100%" stopColor="#89F9E8" />
                        </linearGradient>
                        <linearGradient
                            id="btn-right"
                            x1="14.635%"
                            x2="14.635%"
                            y1="0%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#9099FC" />
                            <stop offset="100%" stopColor="#D87CEE" />
                        </linearGradient>
                    </defs>
                </svg>
            </body>
        </html>
        </ClerkWrapper>
    );
}
