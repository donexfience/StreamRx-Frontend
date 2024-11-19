import React from "react";

const WhatCustomersAreSaying = () => {
  return (
    <div>
      <div className="relative w-full h-auto">
        {/* Background Image */}
        <img
          className="opacity-67 w-full h-auto"
          src="/assets/LiveImageComponent/Gb.png"
          alt="Background"
        />

        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white px-4">
            Over 8 million users worldwide choose StreamRx
          </p>

          {/* Glass2 Image with Text Inside */}
          <div className="relative mt-8 w-[90%] md:w-3/4 lg:w-2/3">
            <img
              src="/assets/whatCustomersAreSaying/st.png"
              className="w-full opacity-65"
              alt="Glass Icon"
            />
            <p className="absolute inset-0 flex items-center justify-center text-center text-sm md:text-base lg:text-lg text-white lg:px-36 sm:px-4">
              “StreamRx is the tool of choice for us as it can be run for high
              productions as well as side-of-desk style outputs. It's a very
              robust tool for all our needs as a company.”
            </p>
          </div>
        </div>
      </div>
      <div className="w-full px-4 sm:px-64 flex flex-col sm:flex-row gap-8">
        <div
          className="w-full sm:w-1/3 px-8 pt-7 shadow-lg rounded-lg pb-8"
          style={{ backgroundColor: "#0B0B16" }}
        >
          <img
            src="/assets/whatCustomersAreSaying/monstercat.png"
            className=""
          />
          <p className=" px-2 pt-4 w-60 text-gray-400">
            “streamRx allows us to easily and creatively send video programming
            to all corners of the globe, regardless of the destination.”
          </p>
          <div className="flex pt-4">
            <img src="/assets/peoples/p.png" />
            <div className="">
              <p className="text-gray-500 font-bold">Dan Scarcelli</p>
              <p className="text-gray-600">Head of Live Programing</p>
            </div>
          </div>
        </div>
        <div
          className="w-full sm:w-1/3 px-8 pt-7"
          style={{ backgroundColor: "#0B0B16" }}
        >
          <img src="/assets/whatCustomersAreSaying/monstercat.png" />
          <p className=" px-2 pt-4 w-60 text-gray-400">
            “streamRx allows us to easily and creatively send video programming
            to all corners of the globe, regardless of the destination.”
          </p>
          <div className="flex pt-4">
            <img src="/assets/peoples/p.png" />
            <div className="">
              <p className="text-gray-500 font-bold">Dan Scarcelli</p>
              <p className="text-gray-600">Head of Live Programing</p>
            </div>
          </div>
        </div>
        <div
          className="w-full sm:w-1/3 px-8 pt-7"
          style={{ backgroundColor: "#0B0B16" }}
        >
          <img src="/assets/whatCustomersAreSaying/monstercat.png" />
          <p className=" px-2 pt-4 w-60 text-gray-400">
            “streamRx allows us to easily and creatively send video programming
            to all corners of the globe, regardless of the destination.”
          </p>
          <div className="flex pt-4">
            <img src="/assets/peoples/p.png" />
            <div className="">
              <p className="text-gray-500 font-bold">Dan Scarcelli</p>
              <p className="text-gray-600">Head of Live Programing</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative py-4 lg:py-1">
        <img
          className="w-full overflow-y-hidden "
          src="/assets/whatCustomersAreSaying/Link.png"
          alt="Customer feedback"
        />
        <p className="text-sm pt-5 px-8 sm:text-2xl md:text-3xl absolute top-[30%] md:top-[35%] left-[10%] md:left-[20%] text-white">
          Get Started Today
        </p>
        <p className="text-base pt-3 px-8 sm:text-lg md:text-2xl absolute top-[40%] md:top-[45%] left-[10%] md:left-[20%] text-white">
          Bring your recordings to life.
        </p>
        <button className="absolute top-[50%] md:top-[55%]  lg:left-[22%] left-[60%] md:left-[20%] px-2 py-2 md:px-6 md:py-3 text-sm md:text-base font-bold bg-white rounded-xl text-blue-500 shadow-lg">
          Try it for free
        </button>
      </div>
    </div>
  );
};

export default WhatCustomersAreSaying;
