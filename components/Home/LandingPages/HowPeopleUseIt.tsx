import React from "react";
import "@/styles/HowPeople.css";
import Image from "next/image";

const HowPeopleUseIt = () => {
  return (
    <div className="items-center w-full">
      <div className="px-6 md:px-20 lg:px-44 pt-16 md:pt-24 lg:pt-36">
        {/* Heading Section */}
        <div className="custom-line"></div>
        <h2 style={{ color: "#00bcd4" }} className="pt-4 text-xl md:text-2xl">
          How People Use It
        </h2>
        <h2 className="text-lg md:text-2xl lg:text-3xl pt-4 text-white">
          Loved by users who support creators users and companies
          <br />
          and our lively creators who show their supports.
        </h2>

        {/* Image and Content Section */}
        <div className="relative">
          {/* Main Background Image (hidden on small screens) */}
          <img
            src="/assets/HowPeopleUseIT/v1.png"
            className="hidden md:block object-cover max-h-[56%] pt-20 w-full"
          />

          {/* Content Blocks */}
          <div className="pt-56 grid sm:grid-cols-1 gap-8 md:absolute md:top-0 md:left-12 lg:left-20 w-full sm:block">
            {/* Block 1 */}
            <div className="flex flex-col sm:items-center md:flex-row md:gap-x-6 lg:gap-x-28">
              <div className="text-center md:text-left">
                <h2 style={{ color: "#00bcd4" }} className="text-sm md:text-base">
                  clafsafd
                </h2>
                <p className="text-white text-xs md:text-sm lg:text-base w-full md:w-48">
                  Make your product premieres and company announcements a grand
                  spectacle. Turn heads and spark conversations.
                </p>
              </div>
              <img
                src="/assets/HowPeopleUseIt/Benz.png"
                className="w-full sm:w-full md:w-28 lg:w-auto"
              />
            </div>

            {/* Block 2 */}
            <div className="flex flex-col sm:items-center md:flex-row md:gap-x-6 lg:gap-x-28 pt-56">
              <img
                src="/assets/HowPeopleUseIt/DonexLive.png"
                className="w-full sm:w-full md:w-28 lg:w-auto space-y-7"
              />
              <div className="text-center md:text-left ">
                <h2 style={{ color: "#00bcd4" }} className="text-sm md:text-base">
                  clafsafd
                </h2>
                <p className="text-white text-xs md:text-sm lg:text-base w-full md:w-48">
                  Make your product premieres and company announcements a grand
                  spectacle. Turn heads and spark conversations.
                </p>
              </div>
            </div>

            {/* Block 3 */}
            <div className="flex flex-col sm:items-center md:flex-row md:gap-x-6 lg:gap-x-28 lg:pt-56">
            <div className="text-center md:text-left ">
                <h2 style={{ color: "#00bcd4" }} className="text-sm md:text-base">
                  clafsafd
                </h2>
                <p className="text-white text-xs md:text-sm lg:text-base w-full md:w-48">
                  Make your product premieres and company announcements a grand
                  spectacle. Turn heads and spark conversations.
                </p>
              </div>
              <img
                src="/assets/HowPeopleUseIt/Benz.png"
                className="w-full sm:w-full md:w-28 lg:w-auto"
              />
            </div>

            {/* Block 4 */}
            <div className="flex flex-col sm:items-center md:flex-row md:gap-x-6 lg:gap-x-28 pt-64">
              <img
                src="/assets/HowPeopleUseIt/Benz.png"
                className="w-full sm:w-full md:w-28 lg:w-auto"
              />
              <div className="text-center md:text-left ">
                <h2 style={{ color: "#00bcd4" }} className="text-sm md:text-base">
                  clafsafd
                </h2>
                <p className="text-white text-xs md:text-sm lg:text-base w-full md:w-48">
                  Make your product premieres and company announcements a grand
                  spectacle. Turn heads and spark conversations.
                </p>
              </div>
            </div>

            {/* Block 5 */}
            <div className="flex flex-col sm:items-center md:flex-row md:gap-x-6 lg:gap-x-28 pt-72">
            <div className="text-center md:text-left ">
                <h2 style={{ color: "#00bcd4" }} className="text-sm md:text-base">
                  clafsafd
                </h2>
                <p className="text-white text-xs md:text-sm lg:text-base w-full md:w-48">
                  Make your product premieres and company announcements a grand
                  spectacle. Turn heads and spark conversations.
                </p>
              </div>
              <img
                src="/assets/HowPeopleUseIt/Benz.png"
                className="w-full sm:w-full md:w-28 lg:w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowPeopleUseIt;
