"use client";
import React, { useState } from "react";
import { FaHome, FaPlay, FaVideo } from "react-icons/fa";
import { RecommendedStreamers } from "./RecommendedStreamers";
import { GlowingBorderCard } from "../animations/GlowingBorderCard";
const ViewerNavbar: React.FC<{}> = ({}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const navItems = [
    { id: "home", label: "Home", icon: <FaHome className="h-5 w-5" /> },
    { id: "live", label: "Live stream", icon: <FaPlay className="h-5 w-5" /> },
    { id: "videos", label: "Videos", icon: <FaVideo className="h-5 w-5" /> },
  ];

  const handleClick = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div
      className={`w-64 bg-black transition-all duration-500 ease-in-out p-4 dark:bg-white`}
    >
      <div className="flex flex-col gap-y-4">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center ml-6   text-gray-300 hover:bg-gray-800 rounded cursor-pointer`}
          >
            {selectedId === item.id ? (
              <GlowingBorderCard>
                <div className="flex items-center space-x-2">
                  <span>{item.icon}</span>
                  <span className="truncate font-bold text-white">
                    {item.label}
                  </span>
                </div>
              </GlowingBorderCard>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="font-bold ">{item.icon}</span>
                <span className="truncate font-bold text-lg">{item.label}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="border border-gray-600 mt-4 mb-4"></div>
      <RecommendedStreamers />
    </div>
  );
};

export default ViewerNavbar;
