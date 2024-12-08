import React from "react";

const YourunfairAdvantage: React.FC = () => {
  return (
    <div className="relative">
      <h1 className="text-blue-500 font-bold">Your unfair advantage </h1>
      <h1 className="text-white font-bold text-2xl pt-3 pb-3">
        Amplify your videos
      </h1>
      <h3 className="text-white">
        View Live Stream on your own device with full quality without any
        interception and access any live anywhere
      </h3>
      <div
        className="relative w-full min-h-screen 
        flex flex-col lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 p-4 mt-5"
      >
        {/* Background Image */}
        <img
          className="absolute inset-0 z-0  
          opacity-85 
          pointer-events-none 
          transform rotate-12 
          pl-80 mt-40
          w-[80%] h-[80%]"
          src="/assets/viewerDashboard/gg.png"
        />

        {/* Boxes */}
        <div
          className="relative z-10 font-bold px-3 py-2  text-white rounded-2xl w-full h-[40%] lg:h-full
          backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer "
        >
          <img
            className="mx-12"
            src="/assets/viewerDashboard/socailIcons.png"
          />
          <div className="px-4 space-y-3">
            <h3 className="text-white ">30M+ viewers</h3>
            <h5 className="text-sm">
              Get discovered on YouTube while finding leads on Linkedin and use
              each platform’s best features with a single live stream.
            </h5>
          </div>
        </div>
        <div
          className="relative z-10 font-bold px-3 py-2  text-white rounded-2xl w-full h-[40%] lg:h-full
          backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer "
        >
          <img
            className="mx-12"
            src="/assets/viewerDashboard/socailIcons.png"
          />
          <div className="px-4 space-y-3">
            <h3 className="text-white ">30M+ viewers</h3>
            <h5 className="text-sm">
              Get discovered on YouTube while finding leads on Linkedin and use
              each platform’s best features with a single live stream.
            </h5>
          </div>
        </div>
        <div
          className="relative z-10 font-bold px-3 py-2  text-white rounded-2xl w-full h-[40%] lg:h-full
          backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer "
        >
          <img
            className="mx-12"
            src="/assets/viewerDashboard/socailIcons.png"
          />
          <div className="px-4 space-y-3">
            <h3 className="text-white ">30M+ viewers</h3>
            <h5 className="text-sm">
              Get discovered on YouTube while finding leads on Linkedin and use
              each platform’s best features with a single live stream.
            </h5>
          </div>
        </div>
        <div
          className="relative z-10 font-bold px-3 py-2  text-white rounded-2xl w-full h-[40%] lg:h-full
          backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer "
        >
          <img
            className="mx-12"
            src="/assets/viewerDashboard/socailIcons.png"
          />
          <div className="px-4 space-y-3">
            <h3 className="text-white ">30M+ viewers</h3>
            <h5 className="text-sm">
              Get discovered on YouTube while finding leads on Linkedin and use
              each platform’s best features with a single live stream.
            </h5>
          </div>
        </div>
      </div>
      <div className="w-full lg:flex">
        <div className="mt-12 px-20 grid lg:grid-cols-3 lg:w-1/2 grid-cols-2 ">
          <div className="border-l-0 border-t-0  border border-gray-500 lg:border-t-0 lg:border-r-0 p-8 lg:border-l-0">
            {" "}
            {/* No top or right border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 1" />
          </div>
          <div className="border border-gray-500 border-t-0 p-8">
            {" "}
            {/* No top border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 2" />
          </div>
          <div className="border border-gray-500 border-t-0 border-r-0 p-8">
            {" "}
            {/* No top or left border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 3" />
          </div>
          <div className="border border-gray-500 border-l-0 p-8">
            {" "}
            {/* No left border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 4" />
          </div>
          <div className="border border-gray-500 p-8">
            <img src="/assets/companyBrandes/1.png" alt="Brand 5" />
          </div>
          <div className="border border-gray-500 p-8 border-r-0">
            <img src="/assets/companyBrandes/1.png" alt="Brand 6" />
          </div>
          <div className="border border-gray-500 border-l-0 p-8 border-b-0">
            {" "}
            {/* No left border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 7" />
          </div>
          <div className="border border-gray-500 p-8 border-b-0">
            <img src="/assets/companyBrandes/1.png" alt="Brand 8" />
          </div>
          <div className="border border-gray-500 border-b-0 p-8 border-r-0">
            {" "}
            {/* No bottom border */}
            <img src="/assets/companyBrandes/1.png" alt="Brand 9" />
          </div>
        </div>
        <div className="w-1/2 mt-12">
          <h2 className="text-blue-500 font-bold">Take control</h2>
          <h1 className="text-3xl text-white font-bold mt-3">
            Goes with your faviroute video
          </h1>
          <div className="w-80 mt-4">
            <h4 className="text-white">
              No need to change your steamless watching. Most integrations are
              seamless and simple.
            </h4>
            <h5 className="text-blue-500 mt-2">Learn more</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourunfairAdvantage;
