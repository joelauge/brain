"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Section from "../Section";
import Logo from "../Logo";
import Image from "../Image";
import Button from "../Button";

import { navigation } from "@/constants/navigation";
import { socials } from "@/constants/socials";

type FooterProps = {};

const Footer = ({}: FooterProps) => {
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [signupForm, setSignupForm] = useState({ firstName: '', email: '' });
    const [signupSubmitting, setSignupSubmitting] = useState(false);
    const [signupMessage, setSignupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const bellRef = useRef<SVGSVGElement>(null);

    // Bell ringing animation every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (bellRef.current) {
                bellRef.current.classList.remove('bell-ringing');
                requestAnimationFrame(() => {
                    if (bellRef.current) {
                        bellRef.current.classList.add('bell-ringing');
                        setTimeout(() => {
                            if (bellRef.current) {
                                bellRef.current.classList.remove('bell-ringing');
                            }
                        }, 500);
                    }
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Section
                className="pt-11 pb-6 px-5 lg:pt-[6.5rem] lg:px-7.5 lg:pb-12 xl:px-10"
                crosses
                customPaddings
            >
                <div className="flex items-center justify-center h-[6.5rem] mb-6 border-b border-n-6 lg:justify-start">
                    <Logo />
                    <nav className="hidden lg:flex items-center justify-center ml-auto">
                        {navigation
                            .filter((item) => !item.authRequired && !item.onlyMobile)
                            .map((item) => {
                                // Special styling for Book Consultation button
                                if (item.url === "/booking") {
                                    return (
                                        <Button
                                            key={item.id}
                                            href={item.url}
                                            white
                                            className="opacity-90 shadow-2xl"
                                        >
                                            {item.title}
                                        </Button>
                                    );
                                }
                                
                                return (
                                    <Link
                                        className={`px-12 py-8 font-code text-xs font-semibold leading-5 uppercase text-n-1 transition-colors hover:text-n-1`}
                                        href={item.url}
                                        key={item.id}
                                    >
                                        {item.title}
                                    </Link>
                                );
                            })}
                    </nav>
                </div>
                <div className="lg:flex lg:items-center lg:justify-between">
                    <div className="hidden caption text-n-4 lg:block">
                        ©️2025 Brain Media Consulting - All rights reserved.
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setShowSignupModal(true)}
                            onMouseEnter={() => {
                                if (bellRef.current) {
                                    bellRef.current.classList.remove('bell-ringing');
                                    requestAnimationFrame(() => {
                                        if (bellRef.current) {
                                            bellRef.current.classList.add('bell-ringing');
                                            setTimeout(() => {
                                                if (bellRef.current) {
                                                    bellRef.current.classList.remove('bell-ringing');
                                                }
                                            }, 500);
                                        }
                                    });
                                }
                            }}
                            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                            <span className="relative inline-block">
                                <svg
                                    ref={bellRef}
                                    className="w-8 h-8 text-color-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                </svg>
                            </span>
                            <span className="text-n-1 text-sm font-medium">Get Notified</span>
                        </button>
                        <div className="flex justify-center -mx-4">
                            {socials.map((item) => (
                                <a
                                    className="flex items-center justify-center w-10 h-10 mx-4 bg-n-7 rounded-full transition-colors hover:bg-n-6"
                                    href={item.url}
                                    target="_blank"
                                    key={item.id}
                                >
                                    <Image
                                        src={item.iconUrl}
                                        width={16}
                                        height={16}
                                        alt={item.title}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* Email Signup Modal */}
            {showSignupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-n-8 rounded-2xl border border-n-6 p-8 max-w-md w-full">
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="h4 text-n-1">Get Notified</h3>
                                <button
                                    onClick={() => {
                                        setShowSignupModal(false);
                                        setSignupMessage(null);
                                        setSignupForm({ firstName: '', email: '' });
                                    }}
                                    className="text-n-3 hover:text-n-1 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="body-2 text-n-3 mb-4">Sign up to receive a weekly newsletter with the latest AI news and updates.</p>
                        </div>

                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setSignupSubmitting(true);
                                setSignupMessage(null);

                                try {
                                    const response = await fetch('/api/newsletter/signup', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            firstName: signupForm.firstName,
                                            email: signupForm.email,
                                        }),
                                    });

                                    if (response.ok) {
                                        setSignupMessage({ type: 'success', text: 'Successfully signed up for notifications!' });
                                        setSignupForm({ firstName: '', email: '' });
                                        setTimeout(() => {
                                            setShowSignupModal(false);
                                            setSignupMessage(null);
                                        }, 2000);
                                    } else {
                                        const data = await response.json();
                                        setSignupMessage({ type: 'error', text: data.error || 'Failed to sign up. Please try again.' });
                                    }
                                } catch (error) {
                                    setSignupMessage({ type: 'error', text: 'An error occurred. Please try again.' });
                                } finally {
                                    setSignupSubmitting(false);
                                }
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={signupForm.firstName}
                                    onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                                    required
                                    placeholder="Enter your first name"
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-n-2 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={signupForm.email}
                                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full bg-n-7 border border-n-5 text-n-1 px-3 py-2 rounded-lg focus:border-color-1 focus:outline-none placeholder:text-n-4"
                                />
                            </div>

                            {signupMessage && (
                                <div
                                    className={`p-4 rounded-lg ${
                                        signupMessage.type === 'success'
                                            ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                                            : 'bg-red-500/20 border border-red-500/50 text-red-400'
                                    }`}
                                >
                                    {signupMessage.text}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={signupSubmitting}
                                    className="flex-1"
                                >
                                    {signupSubmitting ? 'Submitting...' : 'Subscribe'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowSignupModal(false);
                                        setSignupMessage(null);
                                        setSignupForm({ firstName: '', email: '' });
                                    }}
                                    className="bg-n-7 hover:bg-n-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Footer;
