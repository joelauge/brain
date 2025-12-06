"use client";

import { useEffect, useState, useRef } from "react";
import { Splide, SplideTrack, SplideSlide } from "@splidejs/react-splide";
import Section from "@/components/Section";
import Heading from "@/components/Heading";
import Image from "@/components/Image";

interface YouTubeVideo {
    id: string;
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    duration: string;
}

type YouTubeCarouselProps = {};

const YouTubeCarousel = ({}: YouTubeCarouselProps) => {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const ref = useRef<any>(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/youtube/videos');
            const data = await response.json();
            if (data.videos) {
                setVideos(data.videos);
            }
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClick = (index: number) => {
        setActiveIndex(index);
        ref.current?.go(index);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const parseDuration = (duration: string): string => {
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '';
        
        const hours = parseInt(match[1] || '0', 10);
        const minutes = parseInt(match[2] || '0', 10);
        const seconds = parseInt(match[3] || '0', 10);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Section>
            <div className="container">
                <Heading
                    className="md:mb-15"
                    textAlignClassName="text-center"
                    titleLarge="Latest Shows"
                    textLarge={loading ? "Loading latest shows..." : videos.length === 0 ? "Check back soon for our latest long-form content!" : "Watch Our Latest Long-Form Content"}
                />
                
                {loading ? (
                    <div className="text-center py-12">
                        <p className="body-1 text-n-3">Loading videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="body-1 text-n-3">No long-form videos available at this time.</p>
                    </div>
                ) : (
                    <>
                        <Splide
                            className="splide-visible relative z-2"
                            options={{
                                type: 'loop',
                                perPage: 3,
                                perMove: 1,
                                gap: '1.5rem',
                                pagination: false,
                                arrows: true,
                                breakpoints: {
                                    1024: {
                                        perPage: 2,
                                    },
                                    768: {
                                        perPage: 1,
                                    },
                                },
                            }}
                            onMoved={(e, newIndex) => setActiveIndex(newIndex)}
                            hasTrack={false}
                            ref={ref}
                        >
                            <SplideTrack>
                                {videos.map((video) => (
                                    <SplideSlide key={video.id}>
                                        <a
                                            href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group"
                                        >
                                            <div className="bg-n-8 rounded-2xl border border-n-6 overflow-hidden hover:border-color-1 transition-colors">
                                                <div className="relative aspect-video overflow-hidden bg-n-7">
                                                    <Image
                                                        src={video.thumbnail}
                                                        width={640}
                                                        height={360}
                                                        alt={video.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized={false}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-n-8/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <span className="px-2 py-1 bg-n-1/90 backdrop-blur-sm rounded text-xs font-bold text-n-8">
                                                                {parseDuration(video.duration)}
                                                            </span>
                                                        </div>
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-color-1/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg className="w-8 h-8 text-n-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="h6 mb-2 line-clamp-2 group-hover:text-color-1 transition-colors">
                                                        {video.title}
                                                    </h3>
                                                    <p className="body-2 text-n-3 text-xs">
                                                        {formatDate(video.publishedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    </SplideSlide>
                                ))}
                            </SplideTrack>
                        </Splide>

                        {/* Pagination dots for mobile */}
                        <div className="flex justify-center mt-8 -mx-2 md:hidden">
                            {videos.map((video, index) => (
                                <button
                                    className="relative w-6 h-6 mx-2"
                                    onClick={() => handleClick(index)}
                                    key={video.id}
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <span
                                        className={`absolute inset-0 bg-conic-gradient rounded-full transition-opacity ${
                                            index === activeIndex
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    ></span>
                                    <span className="absolute inset-0.25 bg-n-8 rounded-full">
                                        <span className="absolute inset-2 bg-n-1 rounded-full"></span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Section>
    );
};

export default YouTubeCarousel;

