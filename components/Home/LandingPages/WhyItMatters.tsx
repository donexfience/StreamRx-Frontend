import React from "react";
import "@/styles/collabaration.css";
import Image from "next/image";

const WhyItMatters = () => {
  return (
    <div className="flex items-center w-full">
      <div className="px-6 md:px-20 lg:px-44 pt-16 md:pt-24 lg:pt-36">
        <div className="custom-line"></div>
        <h2 style={{ color: "#00bcd4" }} className="pt-4 text-lg md:text-xl lg:text-2xl">
          Why it matters
        </h2>
        <h2 className="text-lg md:text-2xl lg:text-3xl pt-4 text-white">
          Invite your friends to watch videos and show support to creators
          <br />
          and show support to creators.
        </h2>

        {/* Content Section */}
        <div className="flex flex-col md:flex-row md:gap-x-12 lg:gap-x-56 items-center md:items-start pt-8">
          {/* Block 1 */}
          <div className="flex flex-col items-center md:items-start pt-8 md:pt-16 w-full md:w-auto">
            <img className="pt-0 w-full md:w-auto" src="/assets/WhyItMatters/1.png" />
            <div className="flex items-center gap-3 pt-4">
              <Image
                src="/assets/collabarationIcons/3.png"
                alt="icon for colab"
                width={40}
                height={40}
              />
              <h2 className="text-white text-lg md:text-xl lg:text-2xl">Playlists</h2>
            </div>
            <div>
              <h2 className="text-white text-sm md:text-base lg:text-lg pt-2 text-center md:text-left">
                Queue, schedule, and loop your videos to
                <br />
                stream binge-worthy live series.
              </h2>
            </div>
          </div>

          {/* Block 2 */}
          <div className="flex flex-col items-center md:items-start pt-8 md:mt-12 w-full md:w-auto">
            <img className="w-full md:w-auto" src="/assets/WhyItMatters/2.png" />
            <div className="flex items-center gap-3 pt-4">
              <Image
                src="/assets/collabarationIcons/2.png"
                alt="icon for colab"
                width={40}
                height={40}
              />
              <h2 className="text-white text-lg md:text-xl lg:text-2xl">Playlists</h2>
            </div>
            <div>
              <h2 className="text-white text-sm md:text-base lg:text-lg pt-2 text-center md:text-left">
                Queue, schedule, and loop your videos to
                <br />
                stream binge-worthy live series.
              </h2>
            </div>
          </div>

          {/* Block 3 */}
          <div className="flex flex-col items-center md:items-start pt-8 md:pt-16 w-full md:w-auto">
            <img className="w-full md:w-auto" src="/assets/WhyItMatters/3.png" />
            <div className="flex items-center gap-3 pt-4">
              <Image
                src="/assets/collabarationIcons/1.png"
                alt="icon for colab"
                width={40}
                height={40}
              />
              <h2 className="text-white text-lg md:text-xl lg:text-2xl">Playlists</h2>
            </div>
            <div>
              <h2 className="text-white text-sm md:text-base lg:text-lg pt-2 text-center md:text-left">
                Queue, schedule, and loop your videos to
                <br />
                stream binge-worthy live series.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyItMatters;
