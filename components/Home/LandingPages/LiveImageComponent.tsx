import React from "react";
import "@/styles/userHome.css";

const LiveImageComponent: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden">
      <div className="w-full h-full md:h-[80vh] relative px-4 md:px-6 lg:w-full">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-12 object-contain ">
          <img
            src="/assets/LiveImageComponent/Gb.png"
            alt="background"
            className="h-full w-full object-fill opacity-60"
          />
        </div>

        {/* Overlay Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/LiveImageComponent/BlueLine.png"
            className="absolute bottom-0 left-0 w-full md:w-auto opacity-60 hidden sm:block"
          />
          <img
            src="/assets/LiveImageComponent/BOx.png"
            className="absolute bottom-12 right-0 w-full  sm: md:w-[40%] opacity-15 md:opacity-10 "
          />
        </div>

        {/* Video Container */}
        <div className="relative h-full">
          <div className="relative w-full h-full flex items-center justify-center md:justify-end">
            <div className="relative w-full md:w-[42.5%] h-[50vh] md:h-[76%] mt-2 overflow-hidden z-40">
              <img
                src="/assets/LiveImageComponent/LiveBox.png"
                className="absolute inset-0 z-40 w-full h-full object-contain opacity-34 lg:w-[86%] lg:pb-10 lg:h-[94%] sm:mr-3 sm:pb-6 sm:w-[72%]"
              />
              <video
                className="absolute top-1/2   left-1/2 transform  -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[35rem] rounded-3xl aspect-video lg:w-[85.5%] lg:h-[96%] lg:pb-20 lg:pr-32 sm:pb-5 sm:w-[72%] sm:h-[52%]"
                src="https://embed-ssl.wistia.com/deliveries/b9bacc2c4222345b70059f6ea87f077268965043.bin?disposition=attachment&filename=hero.mp4"
                autoPlay
                preload="auto"
                muted
                loop
                controls
                playsInline
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveImageComponent;
