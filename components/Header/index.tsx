import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Button from "../Button";
import Logo from "../Logo";
import Image from "../Image";

import { navigation } from "@/constants/navigation";

type HeaderProps = {};

const Header = ({}: HeaderProps) => {
    const [openNavigation, setOpenNavigation] = useState<boolean>(false);
    const { user } = useUser();

    // Admin email addresses
    const adminEmails = [
        "joelauge@gmail.com",
        "joel@brainmediaconsulting.com", 
        "david@brainmediaconsulting.com"
    ];

    const isAdmin = user?.emailAddresses?.some(email => 
        adminEmails.includes(email.emailAddress)
    );

    const toggleNavigation = () => {
        if (openNavigation) {
            setOpenNavigation(false);
            enablePageScroll();
        } else {
            setOpenNavigation(true);
            disablePageScroll();
        }
    };

    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleClick = () => {
        enablePageScroll();
        setOpenNavigation(false);
    };

    useEffect(() => {
        enablePageScroll();
        setOpenNavigation(false);
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 z-50 w-full ${
                openNavigation ? "bg-n-8" : " bg-n-8/90 backdrop-blur-sm"
            } border-b border-n-6 lg:bg-n-8/90 lg:backdrop-blur-sm`}
        >
            <div className="flex items-center h-[4.75rem] px-5 lg:h-[5.25rem] lg:px-7.5 xl:px-10">
                <Logo className="xl:mr-8" />
                <nav
                    className={`${
                        openNavigation ? "flex" : "hidden"
                    } fixed top-[4.8125rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
                >
                    <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
                        {navigation.map((item) => {
                            // Hide Dashboard link if user is not authenticated
                            if (item.authRequired && !user) {
                                return null;
                            }
                            
                            // Special styling for Book Consultation button
                            if (item.url === "/booking") {
                                return (
                                    <Button
                                        key={item.id}
                                        href={item.url}
                                        white
                                        className={`${item.onlyMobile ? "lg:hidden" : ""} opacity-90 shadow-2xl`}
                                        onClick={handleClick}
                                    >
                                        {item.title}
                                    </Button>
                                );
                            }
                            
                            return (
                                <Link
                                    className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${
                                        item.onlyMobile ? "lg:hidden" : ""
                                    } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                                        item.url === pathname
                                            ? "z-2 lg:text-n-1"
                                            : "lg:text-n-1"
                                    } lg:leading-5 lg:hover:text-n-1 xl:px-12`}
                                    href={item.url}
                                    onClick={() =>
                                        item.url.startsWith(pathname) &&
                                        handleClick()
                                    }
                                    key={item.id}
                                >
                                    {item.title}
                                    <div
                                        className={`hidden absolute left-0 bottom-0 w-0.25 h-1.5 bg-n-6 lg:block ${
                                            pathname === item.url
                                                ? "lg:h-3 lg:bg-n-1"
                                                : ""
                                        }`}
                                    ></div>
                                    <div
                                        className={`hidden absolute right-0 bottom-0 w-0.25 h-1.5 bg-n-6 lg:block ${
                                            pathname === item.url
                                                ? "lg:h-3 lg:bg-n-1"
                                                : ""
                                        }`}
                                    ></div>
                                </Link>
                            );
                        })}
                        
                        {/* Admin Link for Mobile */}
                        {isAdmin && (
                            <Link
                                className="block relative font-code text-2xl uppercase text-color-1 transition-colors hover:text-color-1/80 lg:hidden px-6 py-6 md:py-8"
                                href="/admin"
                                onClick={handleClick}
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                    <div className="absolute inset-0 pointer-events-none lg:hidden">
                        <div className="absolute inset-0 opacity-[.03]">
                            <Image
                                className="w-full h-full object-cover"
                                src="/images/header/BRAIN_image1.jpg"
                                width={688}
                                height={953}
                                alt="Background"
                            />
                        </div>
                        <div className="absolute top-1/2 left-1/2 w-[51.375rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2">
                            <div className="absolute top-1/2 left-1/2 w-[36.125rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute top-1/2 left-1/2 w-[23.125rem] aspect-square border border-n-2/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        </div>
                        <div className="absolute top-0 left-5 w-0.25 h-full bg-n-6"></div>
                        <div className="absolute top-0 right-5 w-0.25 h-full bg-n-6"></div>
                        <div className="absolute top-[4.4rem] left-16 w-3 h-3 bg-gradient-to-b from-[#DD734F] to-[#1A1A32] rounded-full"></div>
                        <div className="absolute top-[12.6rem] right-16 w-3 h-3 bg-gradient-to-b from-[#B9AEDF] to-[#1A1A32] rounded-full"></div>
                        <div className="absolute top-[26.8rem] left-12 w-6 h-6 bg-gradient-to-b from-[#88E5BE] to-[#1A1A32] rounded-full"></div>
                    </div>
                </nav>
                <Suspense fallback={<div className="hidden lg:flex items-center space-x-4"><div className="w-8 h-8 bg-n-7 rounded-full animate-pulse"></div></div>}>
                    <SignedOut>
                        <SignUpButton 
                            mode="modal"
                        >
                            <button className="button hidden mr-8 text-n-1/50 transition-colors hover:text-n-1 lg:block">
                                New account
                            </button>
                        </SignUpButton>
                        <SignInButton 
                            mode="modal"
                        >
                            <Button className="hidden lg:flex">
                                Sign in
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                            <div className="flex items-center space-x-3">
                                        {isAdmin && (
                                            <Link href="/admin">
                                                <Button className="hidden lg:flex">
                                                    Admin
                                                </Button>
                                            </Link>
                                        )}
                                <UserButton 
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8",
                                            userButtonPopoverCard: "bg-n-8 border border-n-6 shadow-2xl",
                                            userButtonPopoverActionButton: "text-n-1 hover:bg-n-7 px-4 py-2",
                                            userButtonPopoverActionButtonText: "text-n-1 font-medium",
                                            userButtonPopoverFooter: "bg-n-7 border-t border-n-6",
                                            userButtonPopoverMainIdentifier: "text-n-1 font-semibold",
                                            userButtonPopoverSecondaryIdentifier: "text-n-3 text-sm",
                                            userButtonPopoverAvatarBox: "border-2 border-color-1",
                                            userButtonPopoverActions: "bg-n-8",
                                            userButtonPopoverActionButtonIcon: "text-n-3",
                                            userButtonPopoverActionButtonArrow: "text-n-3"
                                        },
                                        variables: {
                                            colorBackground: "#0a0a0a",
                                            colorText: "#ffffff",
                                            colorTextSecondary: "#a1a1aa",
                                            colorPrimary: "#6366f1",
                                            borderRadius: "0.5rem"
                                        }
                                    }}
                                    userProfileProps={{
                                        additionalOAuthScopes: {}
                                    }}
                                    afterSignOutUrl="/"
                                />
                            </div>
                    </SignedIn>
                </Suspense>
                <Button
                    className="ml-auto lg:hidden"
                    onClick={toggleNavigation}
                    px="px-3"
                >
                    <svg
                        className="overflow-visible"
                        width="20"
                        height="12"
                        viewBox="0 0 20 12"
                    >
                        <rect
                            className="transition-all origin-center"
                            y={openNavigation ? "5" : "0"}
                            width="20"
                            height="2"
                            rx="1"
                            fill="white"
                            transform={`rotate(${openNavigation ? "45" : "0"})`}
                        />
                        <rect
                            className="transition-all origin-center"
                            y={openNavigation ? "5" : "10"}
                            width="20"
                            height="2"
                            rx="1"
                            fill="white"
                            transform={`rotate(${
                                openNavigation ? "-45" : "0"
                            })`}
                        />
                    </svg>
                </Button>
            </div>
        </div>
    );
};

export default Header;