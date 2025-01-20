"use client";
import React, { useState } from "react";
import { StreamCard } from "./StreamerCard";

const GlowingBorderCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative rounded-2xl">
      <div className="absolute -inset-[2px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 rounded-2xl opacity-75" />
      <div className="absolute -inset-[2px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 rounded-2xl opacity-50 blur-sm" />
      <div className="relative rounded-2xl overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
};

export const MainContent: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const trendingStreams = [
    {
      id: 1,
      title: "1V1 TDM MATCH",
      streamer: "yabhirup",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      id: 2,
      title: "Music Info News",
      streamer: "music_info_news",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      id: 3,
      title: "Gaming Stream",
      streamer: "GamingPro",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      id: 4,
      title: "Forza Horizon",
      streamer: "RacingGamer",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
  ];

  const sideStreams = [
    {
      title: "1V1 TDM MATCH",
      streamer: "yabhirup",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Music Info News",
      streamer: "music_info_news",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Gaming Stream",
      streamer: "GamingPro",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Forza Horizon",
      streamer: "RacingGamer",
      thumbnail: "/assets/viewermain/streamer1.png",
    },
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingStreams.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + trendingStreams.length) % trendingStreams.length
    );
  };

  const featuredStream = trendingStreams[currentIndex];
  const sideStreamsToDisplay = sideStreams.slice(
    currentIndex,
    currentIndex + 2
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="flex-1 p-3 bg-gray-950 dark:bg-white transition-all duration-500 ease-in-out">
      {/* Top Section with Featured Stream and Side Streams */}
      <div className="flex gap-5 main-curousel">
        {/* Featured Stream */}
        <div className="flex-[3]">
          <GlowingBorderCard>
            <StreamCard
              title={featuredStream.title}
              streamer={featuredStream.streamer}
              thumbnail={featuredStream.thumbnail}
              size="large"
            />
          </GlowingBorderCard>
        </div>

        {/* Side Streams */}
        <div className="flex-1 flex flex-col gap-4">
          {sideStreamsToDisplay.map((stream, index) => (
            <div key={index} className="h-1/2">
              <StreamCard
                title={stream.title}
                streamer={stream.streamer}
                thumbnail={stream.thumbnail}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots and Arrow Buttons */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {/* Left Arrow Button */}
        <button
          className="bg-pink-600 text-white p-3 rounded-full"
          onClick={handlePrev}
        >
          &#8592;
        </button>

        {/* Navigation Dots */}
        {[...Array(trendingStreams.length)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? "bg-white" : "bg-gray-600"
            }`}
          />
        ))}
        {/* Right Arrow Button */}
        <button
          className="bg-pink-600 text-white p-3 font-bold rounded-full"
          onClick={handleNext}
        >
          &#8594;4
        </button>
      </div>

      {/* Trending Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-medium">TRENDING NOW</h2>
          <button className="text-gray-400 hover:text-white">SEE MORE</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {trendingStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              title={stream.title}
              streamer={stream.streamer}
              thumbnail={stream.thumbnail}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainContent;


