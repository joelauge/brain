import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Button from "@/components/Button";
import Image from "@/components/Image";

type AIPolicyBuilderProps = {};

const AIPolicyBuilder = ({}: AIPolicyBuilderProps) => (
    <Section crosses className="bg-n-6">
        <div className="container">
            <div className="relative max-w-[43.125rem] mx-auto py-8 md:py-14 xl:py-0">
                <div className="relative z-1 text-center">
                    <Heading
                        className="mb-8 [&>p]:text-n-1"
                        textAlignClassName="text-center"
                        titleLarge="Use our AI Policy Builder"
                        textLarge="Assess your organization's AI readiness, ethical boundaries, and governance needs. Build a comprehensive AI policy tailored to your executive leadership and teams."
                    >
                        <Button href="/ai-policy-builder" white className="mt-8">
                            Start Your Assessment
                        </Button>
                    </Heading>
                </div>
                <div className="absolute top-1/2 left-1/2 w-[46.5rem] h-[46.5rem] border border-n-2/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-[39.25rem] h-[39.25rem] border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-[30.625rem] h-[30.625rem] border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-[21.5rem] h-[21.5rem] border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-[13.75rem] h-[13.75rem] border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 w-[46.5rem] h-[46.5rem] border border-n-2/5 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-color-dodge pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-[58.85rem] h-[58.85rem] -translate-x-3/4 -translate-y-1/2">
                        <Image
                            className="w-full"
                            src="/images/gradient.png"
                            width={942}
                            height={942}
                            alt="Gradient"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute -top-[5.75rem] left-[18.5rem] -z-1 w-[19.8125rem] pointer-events-none lg:-top-15 lg:left-[5.5rem]">
            <Image
                className="w-full"
                src="/images/join/shapes-1.svg"
                width={317}
                height={293}
                alt="Shapes 1"
            />
        </div>
        <div className="absolute right-[15rem] -bottom-[7rem] -z-1 w-[28.1875rem] pointer-events-none lg:right-7 lg:-bottom-[5rem]">
            <Image
                className="w-full"
                src="/images/join/shapes-2.svg"
                width={451}
                height={266}
                alt="Shapes 2"
            />
        </div>
    </Section>
);

export default AIPolicyBuilder;

