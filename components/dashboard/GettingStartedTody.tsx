import React from "react";

const GettingStartedTody = () => {
  return (
    <div>
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

export default GettingStartedTody;
