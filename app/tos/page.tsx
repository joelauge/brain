import type { NextPage } from "next";
import Section from "@/components/Section";
import Heading from "@/components/Heading";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Terms of Service for BRAIN Media Consulting AI services",
};

const TermsOfService: NextPage = () => {
    return (
        <div className="min-h-screen bg-n-8">
            <Section className="pt-[8.25rem] pb-20 md:pt-[9.75rem] md:pb-32 lg:pt-[12.25rem] lg:pb-40">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <Heading
                            textAlignClassName="text-center mb-16"
                            titleLarge="Terms of Service"
                            textLarge="Last updated: {new Date().toLocaleDateString()}"
                        />
                        
                        <div className="prose prose-invert max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="h3 mb-4 text-n-1">1. Acceptance of Terms</h2>
                                    <p className="body-1 text-n-2">
                                        By accessing and using Brain Media Consulting&apos;s services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">2. Description of Service</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        Brain Media Consulting provides AI consulting services including but not limited to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">AI strategy consultation and planning</li>
                                        <li className="body-2 text-n-3">AI tool recommendations and implementation guidance</li>
                                        <li className="body-2 text-n-3">AI education and training services</li>
                                        <li className="body-2 text-n-3">Custom AI solution development consultation</li>
                                        <li className="body-2 text-n-3">AI trend analysis and market insights</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">3. User Responsibilities</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        As a user of our services, you agree to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">Provide accurate and complete information when scheduling consultations</li>
                                        <li className="body-2 text-n-3">Use our services only for lawful purposes</li>
                                        <li className="body-2 text-n-3">Respect the intellectual property rights of Brain Media Consulting and third parties</li>
                                        <li className="body-2 text-n-3">Not attempt to gain unauthorized access to our systems or services</li>
                                        <li className="body-2 text-n-3">Not use our services to transmit harmful or malicious content</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">4. Consultation Services</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        Our consultation services are provided on an as-is basis. By booking a consultation, you understand that:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">Consultations are advisory in nature and do not constitute professional legal, financial, or technical advice</li>
                                        <li className="body-2 text-n-3">We reserve the right to reschedule or cancel consultations with reasonable notice</li>
                                        <li className="body-2 text-n-3">Consultation fees are non-refundable unless otherwise specified</li>
                                        <li className="body-2 text-n-3">All consultation content is confidential and proprietary</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">5. Payment Terms</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        Payment for our services is due as specified in your service agreement or consultation booking. We accept various payment methods as indicated during the booking process.
                                    </p>
                                    <p className="body-1 text-n-2">
                                        All prices are subject to change without notice. Refunds are handled on a case-by-case basis and are at the sole discretion of Brain Media Consulting.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">6. Intellectual Property</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        All content, materials, and intellectual property provided during our consultations remain the property of Brain Media Consulting unless otherwise specified in writing.
                                    </p>
                                    <p className="body-1 text-n-2">
                                        You may not reproduce, distribute, or create derivative works from our proprietary materials without explicit written permission.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">7. Limitation of Liability</h2>
                                    <p className="body-1 text-n-2">
                                        Brain Media Consulting shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">8. Disclaimer of Warranties</h2>
                                    <p className="body-1 text-n-2">
                                        Our services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">9. Confidentiality</h2>
                                    <p className="body-1 text-n-2">
                                        Both parties agree to maintain the confidentiality of all proprietary and sensitive information shared during consultations. This includes business strategies, technical information, and any other confidential data disclosed during our services.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">10. Termination</h2>
                                    <p className="body-1 text-n-2">
                                        We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">11. Governing Law</h2>
                                    <p className="body-1 text-n-2">
                                        These Terms shall be interpreted and governed by the laws of the jurisdiction in which Brain Media Consulting operates, without regard to its conflict of law provisions.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">12. Changes to Terms</h2>
                                    <p className="body-1 text-n-2">
                                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">13. Contact Information</h2>
                                    <p className="body-1 text-n-2">
                                        If you have any questions about these Terms of Service, please contact us:
                                    </p>
                                    <div className="mt-4 p-6 bg-n-7 rounded-2xl">
                                        <p className="body-1 text-n-1 mb-2">
                                            <strong>Brain Media Consulting</strong>
                                        </p>
                                        <p className="body-2 text-n-3">
                                            Email: legal@brainmediaconsulting.com
                                        </p>
                                        <p className="body-2 text-n-3">
                                            Website: https://brainmediaconsulting.com
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default TermsOfService;
