import { Search } from "lucide-react";
import React from "react";

const ViewerHead: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black">
      {/* Logo */}
      <div className="text-2xl font-bold text-white pl-4">StreamRx</div>
      <div className="flex-1 mx-8">
        <div className="relative w-full max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search for streamers, games"
            className="w-full px-4 py-2 bg-gray-800 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring focus:ring-orange-500"
          />
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-orange-500 text-white font-bold  rounded-lg hover:bg-orange-600 transition">
          Streamer Sign Up
        </button>
        <div className="flex gap-2 justify-center items-center">
        <div className="w-10 h-10 rounded-lg bg-gray-700"></div>
        <h4 className="text-white">donex fience</h4>
        </div>
        
      </div>
    </header>
  );
};

export default ViewerHead;
