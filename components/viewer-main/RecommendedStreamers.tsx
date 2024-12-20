import React from "react";
import { Circle } from "lucide-react";
import { GlowingBorderCard } from "../animations/GlowingBorderCard";

export const RecommendedStreamers = () => {
  const streamers = [
    { id: 1, name: "xxxcherry", isLive: true },
    { id: 2, name: "BKZINNFF", isLive: true },
    { id: 3, name: "Mariano_mr", isLive: true },
    { id: 4, name: "prokishan", isLive: true },
    { id: 5, name: "TMGameplay", isLive: true },
    { id: 6, name: "BellzitaTV", isLive: true },
    { id: 7, name: "PedroSetee", isLive: true },
    { id: 8, name: "vitin88", isLive: true },
    { id: 9, name: "lilacrew", isLive: true },
    { id: 10, name: "PH.TP_LIVES", isLive: true },
    { id: 11, name: "music_info_n", isLive: true }
  ];

  return (
    <div className="bg- px-4">
      <h2 className="text-white font-medium mb-4">Recommended streamers</h2>
      <div className="space-y-1">
        {streamers.map((streamer) => (
          <div 
            key={streamer.id} 
            className="flex items-center space-x-3 hover:bg-gray-800 rounded cursor-pointer p-1"
          >
            <GlowingBorderCard>
              <div className="w-8 h-8 rounded-xl bg-gray-700"></div>
            </GlowingBorderCard>
            <span className="text-gray-300 text-sm flex-1">{streamer.name}</span>
            {streamer.isLive && (
              <Circle className="w-2 h-2 text-red-500 fill-current flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};