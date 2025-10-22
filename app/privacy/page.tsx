import type { NextPage } from "next";
import Section from "@/components/Section";
import Heading from "@/components/Heading";

export const metadata = {
    title: "AI Consulting with BRAIN Media Consulting",
    description: "Privacy Policy for BRAIN Media Consulting AI services",
};

const Privacy: NextPage = () => {
    return (
        <div className="min-h-screen bg-n-8">
            <Section className="pt-[8.25rem] pb-20 md:pt-[9.75rem] md:pb-32 lg:pt-[12.25rem] lg:pb-40">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <Heading
                            textAlignClassName="text-center mb-16"
                            titleLarge="Privacy Policy"
                            textLarge="Last updated: {new Date().toLocaleDateString()}"
                        />
                        
                        <div className="prose prose-invert max-w-none">
                            <div className="space-y-8">
                                <section>
                                    <h2 className="h3 mb-4 text-n-1">1. Information We Collect</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        At Brain Media Consulting, we collect information you provide directly to us, such as when you:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">Schedule a consultation through our booking system</li>
                                        <li className="body-2 text-n-3">Contact us via email or our website</li>
                                        <li className="body-2 text-n-3">Subscribe to our newsletter or updates</li>
                                        <li className="body-2 text-n-3">Use our AI consulting services</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">2. How We Use Your Information</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        We use the information we collect to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">Provide, maintain, and improve our AI consulting services</li>
                                        <li className="body-2 text-n-3">Process and manage your consultation bookings</li>
                                        <li className="body-2 text-n-3">Send you technical information, updates, and marketing communications</li>
                                        <li className="body-2 text-n-3">Respond to your comments, questions, and requests</li>
                                        <li className="body-2 text-n-3">Monitor and analyze trends, usage, and activities</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">3. Information Sharing and Disclosure</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">To trusted service providers who assist us in operating our website and conducting our business</li>
                                        <li className="body-2 text-n-3">When we believe release is appropriate to comply with the law, enforce our site policies, or protect our rights</li>
                                        <li className="body-2 text-n-3">In connection with a merger, acquisition, or sale of all or a portion of our assets</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">4. Data Security</h2>
                                    <p className="body-1 text-n-2">
                                        We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">5. Cookies and Tracking Technologies</h2>
                                    <p className="body-1 text-n-2">
                                        We use cookies and similar tracking technologies to enhance your experience on our website, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">6. Third-Party Services</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                                    </p>
                                    <p className="body-1 text-n-2">
                                        We use Calendly for appointment scheduling. Please review Calendly&apos;s privacy policy for information about how they handle your data.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">7. Your Rights</h2>
                                    <p className="body-1 text-n-2 mb-4">
                                        You have the right to:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li className="body-2 text-n-3">Access, update, or delete your personal information</li>
                                        <li className="body-2 text-n-3">Opt-out of marketing communications</li>
                                        <li className="body-2 text-n-3">Request a copy of your personal data</li>
                                        <li className="body-2 text-n-3">Withdraw consent for data processing</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">8. Children&apos;s Privacy</h2>
                                    <p className="body-1 text-n-2">
                                        Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">9. Changes to This Privacy Policy</h2>
                                    <p className="body-1 text-n-2">
                                        We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
                                    </p>
                                </section>

                                <section>
                                    <h2 className="h3 mb-4 text-n-1">10. Contact Us</h2>
                                    <p className="body-1 text-n-2">
                                        If you have any questions about this privacy policy or our data practices, please contact us at:
                                    </p>
                                    <div className="mt-4 p-6 bg-n-7 rounded-2xl">
                                        <p className="body-1 text-n-1 mb-2">
                                            <strong>Brain Media Consulting</strong>
                                        </p>
                                        <p className="body-2 text-n-3">
                                            Email: privacy@brainmediaconsulting.com
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

export default Privacy;
