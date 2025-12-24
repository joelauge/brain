import { useState, useEffect } from "react";
import { default as NextImage, ImageProps } from "next/image";

const Image = ({ className, ...props }: ImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Fallback: if image doesn't load within 2 seconds, show it anyway
    // This handles cases where onLoad doesn't fire (cached images, external images, etc.)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!loaded) {
                setLoaded(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [loaded]);

    const handleLoad = () => {
        setLoaded(true);
    };

    const handleError = () => {
        setError(true);
        setLoaded(true); // Show the broken image or placeholder
    };

    // Use onLoadingComplete for Next.js Image (still works, just deprecated)
    // Also use onLoad as fallback
    return (
        <NextImage
            className={`inline-block align-top opacity-0 transition-opacity ${
                loaded && "opacity-100"
            } ${className}`}
            onLoadingComplete={handleLoad}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
        />
    );
};

export default Image;
