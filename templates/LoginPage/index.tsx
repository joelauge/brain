"use client";

import { SignIn } from "@clerk/nextjs";
import Layout from "@/components/Layout";
import Section from "@/components/Section";

const LoginPage = ({}) => {
    return (
        <Layout hideFooter>
            <Section className="flex min-h-[calc(100vh-4.8125rem)] overflow-hidden lg:min-h-[calc(100vh-5.3125rem)]">
                <div className="container relative z-2 max-w-[68rem] m-auto lg:flex lg:justify-between">
                    <div className="max-w-[32.875rem] mx-auto mb-12 text-center md:mb-16 lg:flex lg:flex-col lg:justify-around lg:max-w-[23.75rem] lg:m-0 lg:text-left">
                        <h2 className="h2">
                            Join the AI revolution with BRAIN
                        </h2>
                        <p className="hidden body-2 mt-4 text-n-4 md:block">
                            Get started with BRAIN - AI chat app today and
                            experience the power of AI in your conversations!
                        </p>
                    </div>
                    <div className="relative max-w-[23.5rem] mx-auto lg:flex-1 lg:max-w-[27.5rem] lg:m-0 xl:mr-12">
                        <SignIn 
                            appearance={{
                                elements: {
                                    rootBox: "bg-n-8",
                                    card: "bg-n-8 border border-n-6 shadow-2xl",
                                    headerTitle: "text-n-1 text-2xl font-bold",
                                    headerSubtitle: "text-n-3 text-sm",
                                    socialButtonsBlockButton: "bg-n-7 border border-n-5 text-n-1 hover:bg-n-6 transition-colors",
                                    socialButtonsBlockButtonText: "text-n-1",
                                    formButtonPrimary: "bg-color-1 hover:bg-color-1/90 text-n-8 font-semibold",
                                    formFieldInput: "bg-n-7 border-2 border-n-5 text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none px-3 py-2 rounded-lg",
                                    formFieldLabel: "text-n-2 font-medium",
                                    formFieldInputShowPasswordButton: "text-n-3 hover:text-n-1",
                                    footerActionLink: "text-color-1 hover:text-color-1/80",
                                    footerActionText: "text-n-3",
                                    identityPreviewText: "text-n-2",
                                    formResendCodeLink: "text-color-1 hover:text-color-1/80",
                                    otpCodeFieldInput: "bg-n-7 border-2 border-n-5 text-n-1 px-3 py-2 rounded-lg",
                                    formFieldSuccessText: "text-green-400",
                                    formFieldErrorText: "text-red-400",
                                    alertText: "text-n-2",
                                    formHeaderTitle: "text-n-1",
                                    formHeaderSubtitle: "text-n-3",
                                    formFieldRow: "mb-4",
                                    formField: "mb-4"
                                },
                                variables: {
                                    colorPrimary: "#6366f1",
                                    colorBackground: "#0a0a0a",
                                    colorInputBackground: "#1a1a1a",
                                    colorInputText: "#ffffff",
                                    colorText: "#ffffff",
                                    colorTextSecondary: "#a1a1aa",
                                    borderRadius: "0.5rem",
                                    colorNeutral: "#ffffff",
                                    colorDanger: "#ef4444",
                                    colorSuccess: "#10b981"
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="hidden absolute left-5 right-5 bottom-5 z-4 h-0.25 bg-n-6 pointer-events-none md:block lg:left-7.5 lg:right-7.5 lg:bottom-7.5 xl:left-10 xl:right-10 xl:bottom-10"></div>
                <svg
                    className="hidden absolute left-[0.9375rem] bottom-[0.9375rem] z-4 pointer-events-none md:block lg:left-[1.5625rem] lg:bottom-[1.5625rem] xl:left-[2.1875rem] xl:bottom-[2.1875rem]"
                    width="11"
                    height="11"
                    fill="none"
                >
                    <path
                        d="M7 1a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8a1 1 0 0 1-1-1V1z"
                        fill="#ada8c4"
                    />
                </svg>
                <svg
                    className="hidden absolute right-[0.9375rem] bottom-[0.9375rem] z-4 pointer-events-none md:block lg:right-[1.5625rem] lg:bottom-[1.5625rem] xl:right-[2.1875rem] xl:bottom-[2.1875rem]"
                    width="11"
                    height="11"
                    fill="none"
                >
                    <path
                        d="M7 1a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1H1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V8a1 1 0 0 1 1-1h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8a1 1 0 0 1-1-1V1z"
                        fill="#ada8c4"
                    />
                </svg>
                <div className="absolute inset-0">
                    <img
                        className="w-full h-full object-cover"
                        src="/images/login/background.jpg"
                        alt="Background"
                    />
                </div>
            </Section>
        </Layout>
    );
};

export default LoginPage;