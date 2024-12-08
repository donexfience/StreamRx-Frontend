import React from "react";

const Driveaction: React.FC = () => {
  return (
    <div className="w-full lg:flex lg:items-center lg:justify-between  py-10">
      {/* Left Section */}
      <div className="relative lg:w-1/2 w-full flex justify-center items-center">
        {/* Blue Shape */}
        <img
          src="/assets/streamerDashboard/shape4.png"
          className="w-full lg:w-[50%] lg:h-[150%] absolute -z-10 lg:left-4"
          alt="Blue Shape"
        />
        {/* Streamer Image */}
        <img
          src="/assets/streamerDashboard/zoomed.png"
          className="h-auto w-[95%] lg:w-[110%] lg:h-full object-cover mt-7 lg:mr-16"
          alt="Streamer Image"
        />
      </div>

      {/* Right Section */}
      <div className="lg:w-1/2 w-full lg:pl-36 mt-10 lg:mt-0">
        <div className="w-full lg:w-3/4">
          {/* Icon */}
          <img src="/assets/streamerDashboard/star.png" className="mb-4" />
          {/* Heading */}
          <h1 className="text-black font-bold text-3xl w-[50%]">
            Drive action into your real stream
          </h1>
          {/* Description */}
          <h4 className="text-black mt-6 text-lg font-medium w-[50%]">
            Highlight messages from all your channels to drive engagement.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default Driveaction;
