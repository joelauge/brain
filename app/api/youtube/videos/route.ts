import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    duration: string;
    videoId: string;
}

/**
 * GET /api/youtube/videos
 * Fetches long-form videos from the brainmediaconsulting YouTube channel
 */
export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        
        if (!apiKey) {
            console.log('📺 [DEV] YouTube API Key not configured');
            // Return mock data for development
            return NextResponse.json({
                videos: [],
                error: 'YouTube API key not configured'
            });
        }

        // First, get the channel ID from the handle
        // Search for the channel
        const channelSearchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=brainmediaconsulting&type=channel&key=${apiKey}&maxResults=1`
        );

        if (!channelSearchResponse.ok) {
            throw new Error('Failed to search for channel');
        }

        const channelSearchData = await channelSearchResponse.json();
        const channelId = channelSearchData.items?.[0]?.id?.channelId;

        if (!channelId) {
            throw new Error('Channel not found');
        }

        // Get channel details to get uploads playlist
        const channelDetailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
        );

        if (!channelDetailsResponse.ok) {
            throw new Error('Failed to fetch channel details');
        }

        const channelDetails = await channelDetailsResponse.json();
        const uploadsPlaylistId = channelDetails.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) {
            throw new Error('Uploads playlist not found');
        }

        // Fetch videos from uploads playlist
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&key=${apiKey}&maxResults=50&order=date`
        );

        if (!videosResponse.ok) {
            throw new Error('Failed to fetch videos');
        }

        const videosData = await videosResponse.json();

        if (!videosData?.items || videosData.items.length === 0) {
            return NextResponse.json({ videos: [] });
        }
        
        // Get video IDs to fetch duration
        const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(',');
        
        // Fetch video details including duration
        const videoDetailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`
        );

        if (!videoDetailsResponse.ok) {
            throw new Error('Failed to fetch video details');
        }

        const videoDetails = await videoDetailsResponse.json();

        // Filter for long-form videos (duration > 10 minutes) and format
        const longFormVideos: YouTubeVideo[] = videoDetails.items
            .filter((video: any) => {
                const duration = video.contentDetails.duration;
                // Parse ISO 8601 duration (e.g., PT15M30S = 15 minutes 30 seconds)
                const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (!match) return false;
                
                const hours = parseInt(match[1] || '0', 10);
                const minutes = parseInt(match[2] || '0', 10);
                const seconds = parseInt(match[3] || '0', 10);
                const totalMinutes = hours * 60 + minutes + seconds / 60;
                
                // Consider videos longer than 10 minutes as long-form
                return totalMinutes >= 10;
            })
            .map((video: any) => ({
                id: video.id,
                videoId: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.maxres?.url || 
                           video.snippet.thumbnails.high?.url || 
                           video.snippet.thumbnails.medium?.url || 
                           video.snippet.thumbnails.default?.url || 
                           '',
                publishedAt: video.snippet.publishedAt,
                duration: video.contentDetails.duration,
            }))
            .slice(0, 10); // Limit to 10 most recent

        return NextResponse.json({
            videos: longFormVideos,
        });
    } catch (error: any) {
        console.error('Error fetching YouTube videos:', error);
        return NextResponse.json(
            {
                videos: [],
                error: error.message || 'Failed to fetch videos',
            },
            { status: 500 }
        );
    }
}

