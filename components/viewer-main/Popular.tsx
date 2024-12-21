import { ArrowRight } from "lucide-react";
import React from "react";
import { FaStar } from "react-icons/fa";
import { StreamerCard } from "./cards/StreamerCard";
import { CategoryCard } from "./cards/CateogoryCard";

const Popular: React.FC = () => {
  const categories = [
    {
      title: "BGMI",
      viewers: 706.3,
      followers: 542.8,
      image: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Free Fire",
      viewers: 120.2,
      followers: 725,
      image: "/assets/viewermain/streamer1.png",
    },
    {
      title: "GTA 5",
      viewers: 317.7,
      followers: 216.5,
      image: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Valorant",
      viewers: 75,
      followers: 18.6,
      image: "/assets/viewermain/streamer1.png",
    },
    {
      title: "Call of Duty",
      viewers: 2.7,
      followers: 31.6,
      image: "/assets/viewermain/streamer1.png",
    },
  ];

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

  return (
    <div className="bg-black dark:bg-white transition-all duration-500 ease-in-out p-6 min-h-screen">
      {/* Popular Categories */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-2xl">★</span>
            <h2 className="text-white text-xl font-bold">POPULAR CATEGORIES</h2>
          </div>
          <button className="text-gray-400 hover:text-white flex items-center gap-1">
            SEE MORE
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              followers={category.followers}
              image={category.image}
              title={category.title}
              viewers={category.viewers}
            />
          ))}
        </div>
      </div>

      {/* Trending Streams */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">
            TRENDING FREE FIRE LIVE STREAMS
          </h2>
          <button className="text-gray-400 hover:text-white flex items-center gap-1">
            SEE MORE
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {streams.map((stream, index) => (
            <StreamerCard key={index} {...stream} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Popular;
