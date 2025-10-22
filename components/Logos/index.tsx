import Image from "@/components/Image";

type LogosProps = {
    className?: string;
};

const Logos = ({ className }: LogosProps) => (
    <div className={className}>
        <h5 className="tagline mb-6 text-center text-n-1/50">
            SOME OF OUR PROJECTS
        </h5>
        <ul className="flex">
            <li className="flex items-center justify-center flex-1 h-[8.5rem]">
                <Image
                    src="/images/dmai_logo2_120px.png"
                    width={120}
                    height={28}
                    alt="Logo 3"
                />
            </li>
            <li className="flex items-center justify-center flex-1 h-[8.5rem]">
                <Image
                    src="/images/neurochain_logo__white120px.png"
                    width={120}
                    height={28}
                    alt="Logo 3"
                />
            </li>
            <li className="flex items-center justify-center flex-1 h-[8.5rem]">
                <Image
                    src="/images/augeinnovation_logo_512px.png"
                    width={100}
                    height={28}
                    alt="Logo 3"
                />
            </li>
            <li className="flex items-center justify-center flex-1 h-[8.5rem]">
                <Image
                    src="/images/dubwaiter_logo_white_200px.png"
                    width={120}
                    height={28}
                    alt="Logo 3"
                />
            </li>
            <li className="flex items-center justify-center flex-1 h-[8.5rem]">
                <Image
                    src="/images/chai_logo.png"
                    width={120}
                    height={28}
                    alt="Logo 3"
                />
            </li>
        </ul>
    </div>
);

export default Logos;
