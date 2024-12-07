import React from "react";

const TakeControl = () => {
  return (
    <div className="relative mt-20">
      <h1 className="text-blue-500 font-bold">Take control </h1>
      <h1 className="text-white font-bold text-2xl pt-3 pb-3">
        Everything at your fingertips
      </h1>
      <h3 className="text-white w-[40%]">
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
           
          pointer-events-none 
          transform hue-rotate-30 -rotate-65 
          pl-80 mt-40
          w-[80%] h-[80%]"
          src="/assets/viewerDashboard/gg.png"
        />

        {/* Boxes */}
        <div
          className="relative z-10 font-bold px-3 py-2  text-white rounded-2xl w-full h-[40%] lg:h-full
          backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer "
        >
          <img className="mx-12" src="/assets/viewerDashboard/LiveTime.png" />
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
          <img className="mx-12" src="/assets/viewerDashboard/LiveTime.png" />
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
          <img className="mx-12" src="/assets/viewerDashboard/LiveTime.png" />
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
          <img className="mx-12" src="/assets/viewerDashboard/LiveTime.png" />
          <div className="px-4 space-y-3">
            <h3 className="text-white ">30M+ viewers</h3>
            <h5 className="text-sm">
              Get discovered on YouTube while finding leads on Linkedin and use
              each platform’s best features with a single live stream.
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeControl;
