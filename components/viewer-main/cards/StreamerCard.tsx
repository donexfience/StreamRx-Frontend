import React from "react";

interface StreamerCardProps {
  thumbnail: string;
  title: string;
  streamer: string;
  game: string;
}

export const StreamerCard: React.FC<StreamerCardProps> = ({
  thumbnail,
  title,
  streamer,
  game,
}) => {
  return (
    <div className="flex flex-col w-72 rounded-lg overflow-hidden cursor-pointer">
      <div className="relative">
        <img
          src={thumbnail || "/api/placeholder/300/200"}
          alt={title}
          className="w-full h-40 object-cover"
        />
        <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs rounded">
          LIVE
        </span>
      </div>
      <div className="p-3 bg-gray-800">
        <div className="flex items-center gap-2 mb-2">
          <img
            src="/api/placeholder/32/32"
            alt={streamer}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <h3 className="text-white font-medium">{streamer}</h3>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{game}</span>
      </div>
    </div>
  );
};
