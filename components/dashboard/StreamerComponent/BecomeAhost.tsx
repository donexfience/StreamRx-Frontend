import React from "react";

const BecomeAhost: React.FC = () => {
  return (
    <div>
      <div className="w-full lg:flex lg:items-center lg:justify-between">
        {/* Left Section */}
        <div className="lg:w-1/2 w-full lg:px-20 lg:my-20">
          <div className="w-2/3 lg:ml-64 ml-20 mt-6">
            <img src="/assets/streamerDashboard/padd.png" className="mb-2" />
            <h1 className="text-black font-bold text-3xl w-[55%]">
              Become a host of your live show
            </h1>
            <h4 className="text-black mt-6 text-lg font-medium lg:w-[65%]">
              Invite guests to your live streams and create an exciting
              experience for your audience.
            </h4>
          </div>
        </div>

        {/* Right Section */}
        <div className="lg:w-1/2 w-full flex justify-center items-center">
          <img
            src="/assets/streamerDashboard/golive.png"
            className="h-auto object-contain lg:mr-36"
            alt="Go Live"
          />
        </div>
      </div>
    </div>
  );
};

export default BecomeAhost;
