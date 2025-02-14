"use client";
import { ArrowRight, ArrowLeft, Eye, Heart } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetShortRecommendationQuery } from "@/redux/services/recommendation/recommendationApi";
import { getPresignedUrl } from "@/app/lib/action/s3";

const PopularShorts = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const shortsRowRef = useRef<HTMLDivElement>(null);
  const [showShortsLeftArrow, setShowShortsLeftArrow] = useState(false);
  const [showShortsRightArrow, setShowShortsRightArrow] = useState(true);
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
  const {
    data: shortsRecommendations,
    isLoading: isShortsLoading,
    isError: isShortsError,
  } = useGetShortRecommendationQuery(users?.email, {
    skip: !users?.email,
  });

  const scrollContent = (
    direction: "left" | "right",
    ref: React.RefObject<HTMLDivElement>,
    setLeft: Function,
    setRight: Function
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      setTimeout(() => handleScroll(ref, setLeft, setRight), 100);
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setLeft: Function,
    setRight: Function
  ) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setLeft(scrollLeft > 5);
      setRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const shortsRow = shortsRowRef.current;
    if (shortsRow) {
      shortsRow.addEventListener("scroll", () =>
        handleScroll(
          shortsRowRef,
          setShowShortsLeftArrow,
          setShowShortsRightArrow
        )
      );
      handleScroll(
        shortsRowRef,
        setShowShortsLeftArrow,
        setShowShortsRightArrow
      );
    }

    return () => {
      if (shortsRow) {
        shortsRow.removeEventListener("scroll", () =>
          handleScroll(
            shortsRowRef,
            setShowShortsLeftArrow,
            setShowShortsRightArrow
          )
        );
      }
    };
  }, []);

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

  if (isShortsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isShortsError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">Error loading content</div>
      </div>
    );
  }

  return (
    <div className="bg-black px-4 max-w-full overflow-hidden">
      {/* Shorts Section */}
      <div className="mb-8 max-w-[calc(100vw-240px)]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center mt-3">
            <span className="text-red-500 text-2xl">▶</span>
            <h2 className="text-white text-xl font-bold ml-2">SHORTS</h2>
          </div>
          <button
            className="text-gray-400 hover:text-white flex items-center gap-1"
            onClick={() =>
              scrollContent(
                "right",
                shortsRowRef,
                setShowShortsLeftArrow,
                setShowShortsRightArrow
              )
            }
          >
            SEE MORE
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="relative">
          {showShortsLeftArrow && (
            <button
              onClick={() =>
                scrollContent(
                  "left",
                  shortsRowRef,
                  setShowShortsLeftArrow,
                  setShowShortsRightArrow
                )
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-r-lg transition-all"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          {showShortsRightArrow && (
            <button
              onClick={() =>
                scrollContent(
                  "right",
                  shortsRowRef,
                  setShowShortsLeftArrow,
                  setShowShortsRightArrow
                )
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-l-lg transition-all"
            >
              <ArrowRight size={24} />
            </button>
          )}

          <div
            ref={shortsRowRef}
            className="flex gap-4 overflow-x-hidden scroll-smooth p-6 w-full"
          >
            {shortsRecommendations?.data?.map((short: any) => (
              <div
                key={short._id}
                className="flex-none w-44 min-w-[176px] bg-gray-900 rounded-lg overflow-hidden group hover:transform hover:scale-105 transition-all duration-200 cursor-pointer relative"
                onMouseEnter={() =>
                  handleVideoHover(short._id, short.qualities[0].s3Key)
                }
                onMouseLeave={handleVideoLeave}
              >
                <img
                  src={short.thumbnailUrl || "/api/placeholder/176/312"}
                  alt={short.title}
                  className="w-44 h-[312px] object-cover"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                  <h3 className="text-white text-sm font-medium line-clamp-2">
                    {short.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center space-x-1 text-gray-300 text-xs">
                      <Eye size={12} />
                      <span>{formatCount(short.engagement?.viewCount)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-300 text-xs">
                      <Heart size={12} />
                      <span>{formatCount(short.engagement?.likeCount)}</span>
                    </div>
                  </div>
                </div>

                {hoveredVideoId === short._id && (
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularShorts;
