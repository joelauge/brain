import Link from "next/link";
import { svgs } from "./svgs";

type ButtonProps = {
    className?: string;
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
    px?: string;
    white?: boolean;
    disabled?: boolean;
};

const Button = ({
    className,
    href,
    onClick,
    children,
    px,
    white,
    disabled,
}: ButtonProps) => {
    const classes = `button relative inline-flex items-center justify-center h-11 ${
        px || "px-7"
    } ${white ? "text-n-8" : "text-n-1"} transition-colors hover:text-color-1 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className || ""}`;

    const spanClasses = `relative z-10`;

    return href ? (
        href.startsWith("mailto:") ? (
            <a href={href} className={classes}>
                <span className={spanClasses}>{children}</span>
                {svgs(white)}
            </a>
        ) : (
            <Link href={href} className={classes}>
                <span className={spanClasses}>{children}</span>
                {svgs(white)}
            </Link>
        )
    ) : (
        <button className={classes} onClick={onClick} disabled={disabled}>
            <span className={spanClasses}>{children}</span>
            {svgs(white)}
        </button>
    );
};

export default Button;
