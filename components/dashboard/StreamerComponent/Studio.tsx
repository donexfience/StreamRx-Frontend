"use client";
import Link from "next/link";
import React from "react";

interface StudioProps {
  onClose: () => void;
  hasChannel: boolean; // New prop to check if the streamer has a channel
}

const Studio: React.FC<StudioProps> = ({ onClose, hasChannel }) => {
  return (
    <div className="w-full mt-20 flex flex-col-reverse lg:flex lg:flex-row">
      {/* Left Section (Text) */}
      <div className="lg:w-1/2 w-full">
        <div className="mt-5 py-20 px-10 lg:py-40 lg:px-56">
          <h1 className="text-gray-500 text-xl font-bold">STREAMRX STUDIO</h1>
          <h1 className="w-full text-4xl lg:text-7xl font-medium mt-4">
            Supercharge your streaming
          </h1>
          <h3 className="text-black mt-5 w-full lg:w-[75%] font-medium">
            Everything you need for a successful live stream right in your
            browser
          </h3>
          <div className="mt-10">
            {hasChannel ? (
              <Link href="/dashboard/streamer/main">
                <div className="bg-green-600 w-40 font-bold text-white rounded-lg p-4 text-center cursor-pointer">
                  Go to Dashboard
                </div>
              </Link>
            ) : (
              <div
                className="bg-blue-600 w-40 font-bold text-white rounded-lg p-4 text-center cursor-pointer"
                onClick={() => onClose()}
              >
                Create Channel
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section (Shape + Image) */}
      <div className="lg:w-1/2 w-full">
        <div className="relative flex justify-center">
          <img src="/assets/StreamerDashboard/shape1.png" className="w-full" />
          <img
            src="/assets/StreamerDashboard/st1.png"
            className="absolute pt-14"
          />
        </div>
      </div>
    </div>
  );
};

export default Studio;
