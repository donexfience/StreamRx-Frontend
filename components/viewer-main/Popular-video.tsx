"use client";
import { ArrowRight, ArrowLeft, Clock, Eye, Heart } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { StreamerCard } from "./cards/StreamerCard";
import { useGetVideoRecommendationQuery } from "@/redux/services/recommendation/recommendationApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useRouter } from "next/navigation";
import { getPresignedUrl } from "@/app/lib/action/s3";
import {
  useGetMostPopularQuery,
  useGetMostRecentQuery,
} from "@/redux/services/channel/videoApi";

const PopularVideo = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const videoRowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [hoveredVideoUrl, setHoveredVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodeUser = await getUserFromCookies();
        setUsers(decodeUser.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const scrollVideos = (direction: "left" | "right") => {
    if (videoRowRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      videoRowRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      // Update arrows immediately after scrolling
      setTimeout(() => handleScroll(), 100);
    }
  };

  const handleScroll = () => {
    if (videoRowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = videoRowRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const videoRow = videoRowRef.current;
    if (videoRow) {
      videoRow.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
      return () => videoRow.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const {
    data: recentVideos,
    isLoading,
    isError,
  } = useGetMostPopularQuery(
    { page: 1, limit: 10 },
    {
      skip: !users?.email,
    }
  );

  const handleVideoHover = async (videoId: string, s3Key: string) => {
    setIsLoadingVideo(true);
    setHoveredVideoId(videoId);

    try {
      const url = await getPresignedUrl(s3Key);
      setHoveredVideoUrl(url);
    } catch (error) {
      console.error("Error fetching video URL:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleVideoLeave = () => {
    setHoveredVideoId(null);
    setHoveredVideoUrl(null);
  };

  const formatCount = (count: number) => {
    if (!count) return "0";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const streams = [
    {
      streamer: "BKZINNFF",
      title: "FINALZINHA DE CAMP CORUJÃO DO AON EXT",
      game: "Free Fire",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      streamer: "Big_Z",
      title: "Frifas de Cria e Cassino com Bet Real",
      game: "Free Fire",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      streamer: "Thzoficial",
      title: "VALEU NATALINA!!! - FREE FIRE",
      game: "Free Fire",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      streamer: "MMHATXx",
      title: "VEM COM O REI DO SOLO EM AÇÃO",
      game: "Free Fire",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Error loading recommendations</div>
      </div>
    );
  }

  return (
    <div className="bg-black dark:bg-white transition-all duration-500 ease-in-out px-4 max-w-full overflow-hidden">
      {/* Recommended Videos Section */}
      <div className="mb-8 max-w-[calc(100vw-240px)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center mt-3">
            <span className="text-orange-500 text-2xl">★</span>
            <h2 className="text-white dark:text-black text-xl font-bold ml-2">
              POPULAR VIDEOS
            </h2>
          </div>
          <button
            className="text-gray-400 hover:text-white dark:hover:text-black flex items-center gap-1"
            onClick={() => scrollVideos("right")}
          >
            SEE MORE
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scrollVideos("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-r-lg transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scrollVideos("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-l-lg transition-all"
            >
              <ArrowRight size={24} />
            </button>
          )}

          <div
            ref={videoRowRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth p-6 w-full"
          >
            {recentVideos?.data?.map((video: any) => (
              <div
                key={video._id}
                className="flex-none w-64 min-w-[256px] bg-gray-900 dark:bg-gray-100 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-200 cursor-pointer relative"
                onMouseEnter={() =>
                  handleVideoHover(video._id, video.qualities[0].s3Key)
                }
                onClick={() =>
                  router.push(`/dashboard/viewer/main/${video._id}`)
                }
                onMouseLeave={handleVideoLeave}
              >
                <div className="relative">
                  <img
                    src={video.thumbnailUrl || "/api/placeholder/320/180"}
                    alt={video.title}
                    className="w-full h-36 object-cover"
                  />
                  {video.metadata?.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs">
                      {formatDuration(video.metadata.duration)}
                    </div>
                  )}
                </div>

                {hoveredVideoId === video._id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    {isLoadingVideo ? (
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    ) : (
                      <video
                        src={hoveredVideoUrl || undefined}
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className="p-3 space-y-2">
                  <div className="flex items-start space-x-2">
                    <img
                      src={
                        video.channelId?.channelProfileImageUrl ||
                        "/api/placeholder/32/32"
                      }
                      alt={video.channelId?.channelName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white dark:text-black font-medium text-sm line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
                        {video.channelId?.channelName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-gray-400 dark:text-gray-600 text-xs">
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{formatCount(video.engagement?.viewCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{formatCount(video.engagement?.likeCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Streams Section */}
      <div className="max-w-[calc(100vw-240px)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white dark:text-black text-xl font-bold">
            TRENDING FREE FIRE LIVE STREAMS
          </h2>
          <button
            className="text-gray-400 hover:text-white dark:hover:text-black flex items-center gap-1"
            onClick={() => router.push("/dashboard/viewer/streams")}
          >
            SEE MORE
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 w-full">
          {streams.map((stream, index) => (
            <StreamerCard key={index} {...stream} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularVideo;
