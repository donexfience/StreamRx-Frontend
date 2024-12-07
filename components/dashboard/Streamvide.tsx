import React from "react";
import { FaEye } from "react-icons/fa";
import StreamerChat from "./chat/StreamerChat";

const Streamvideo: React.FC = () => {
  return (
    <div className="live mt-16">
      <div className="flex flex-col items-center justify-center">
        <div
          className="flex items-center font-bold px-3 py-2 border-2 border-gray-300 text-white rounded-2xl w-28
                backdrop-blur-lg bg-white/10 hover:bg-blue-500 hover:text-white transition cursor-pointer"
        >
          Live videos
        </div>
        <h1 className="w-full text-5xl font-bold text-white mt-8 text-center">
          Be seen Everywhere
        </h1>
        <div className="mt-5 w-67 text-center">
          <h3 className="text-white font-medium">
            Watch stream of millions and share with each other
          </h3>
          <div className="mt-2">
            <h3 className="text-white font-medium">and show your support</h3>
          </div>
          <div className="mt-8 video section">
            <video
              autoPlay
              preload="auto"
              muted
              loop
              controls
              playsInline
              src="/assets/viewerDashboard/livevideo.mp4"
              className="rounded-lg"
            />
            <div className="lg:left-[32%] lg:top-[42%] left-16 top-[59%] mt-6  absolute text-white font-medium w-12 rounded-md flex items-center justify-end pr-2">
              <span className="bg-red-500 w-32 rounded-md px-1">Live</span>
              <img
                src="/assets/viewerDashboard/facebook.png"
                className="w-6 ml-2"
              />
            </div>
            <div className="gap-3 right-8 lg:right-[30%] lg:top-[42%] top-[59%] mt-6  absolute text-white font-medium w-12 text-sm rounded-md flex items-center justify-end pr-2">
              <div
                className="flex items-center px-3 py-2 border-2 border-gray-300 text-white rounded-2xl w-28
                backdrop-blur-lg bg-white/10 hover:bg-blue-500 hover:text-white transition cursor-pointer"
              >
                2332
                <FaEye />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-[80%] video overlay w-80 lg:right-[18%]">
          <div
            className="flex items-center px-3 py-2 border-2 border-gray-300 text-white rounded-2xl w-full
                backdrop-blur-lg bg-black/40 hover:bg-blue-500 hover:text-white transition cursor-pointer"
          >
            <div>
              <StreamerChat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streamvideo;
