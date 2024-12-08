import React from "react";

const Reachyour = () => {
  return (
    <div className="bg-[url('/assets/StreamerDashboard/shape2.png')] bg-cover min-h-screen px-20">
      <div className="lg:flex lg:flex-col py-40 justify-center items-center">
        <h1 className="text-black text-3xl font-bold mb-5">
          Reach your audience anywhere
        </h1>
        <h3 className="text-black font-medium">
          Stream live to Facebook, YouTube, Twitter, LinkedIn, and .
        </h3>
        <h3 className="font-medium">others – at the same time</h3>
        <img src="/assets/StreamerDashboard/s3.png" className="lg:w-1/2 " />
      </div>
    </div>
  );
};

export default Reachyour;
