import Link from "next/link";
import Image from "next/image";

type LogoProps = {
    className?: string;
};

const Logo = ({ className }: LogoProps) => (
    <Link className={`block ${className || ""}`} href="/">
        <Image
            src="/images/brain__white_official_logo.png"
            width={100}
            height={100}
            alt="Brainwave"
            className="w-[100px] h-auto"
        />
    </Link>
);

export default Logo;
