import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Button from "@/components/Button";

type HeroProps = {};

const Hero = ({}: HeroProps) => (
    <Section>
        <div className="container md:pt-10 lg:pt-16 xl:pt-20">
            <Heading
                className="md:mb-15"
                textAlignClassName="text-center"
                titleLarge="AI Readiness Assessment"
                textLarge="Discover your organization's AI readiness level. Get personalized insights, recommendations, and a comprehensive assessment to guide your AI adoption journey."
            >
                <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        className="mt-0"
                        href="#questionnaire"
                        white
                    >
                        Start Assessment
                    </Button>
                    <Button
                        className="mt-0"
                        href="/booking"
                    >
                        Book a Consultation
                    </Button>
                </div>
            </Heading>
        </div>
    </Section>
);

export default Hero;

