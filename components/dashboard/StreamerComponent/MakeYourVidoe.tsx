import React from "react";

const MakeYourVideo = () => {
  return (
    <div className="w-full lg:flex lg:items-center lg:justify-between py-10">
      {/* Left Section (Text) */}
      <div className="lg:w-1/2 w-full flex justify-center items-center">
        <img
          src="/assets/streamerDashboard/S.png"
          className="h-auto w-[80%] lg:w-full object-contain"
          alt="Go Live"
        />
      </div>
      <div className="lg:w-1/2 w-full lg:pl-20 px-5 lg:my-20">
        <div className="w-full lg:w-3/4">
          {/* Icon */}
          <img
            src="/assets/streamerDashboard/heart.png"
            className="mb-4"
            alt="Heart Icon"
          />
          {/* Heading */}
          <h1 className="text-black font-bold text-3xl mb-4 w-[50%]">
            Become a host of your live show
          </h1>
          {/* Description */}
          <h4 className="text-black text-lg font-medium w-[50%]">
            Invite guests to your live streams and create an exciting experience
            for your audience.
          </h4>
        </div>
      </div>

      {/* Right Section (Image) */}
    </div>
  );
};

export default MakeYourVideo;
