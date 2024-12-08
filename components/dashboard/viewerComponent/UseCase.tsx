import React from "react";

const UseCase = () => {
  return (
    <div className="w-full mt-2">
      <h1 className="text-blue-500 font-bold text-lg">Use cases</h1>
      <h1 className="text-3xl text-white font-bold">Creators Love StreamRx</h1>
      <div className="flex justify-center items-center gap-4">
        {/* Left Image */}
        <div
          className="w-1/4  rounded-lg
        "
        >
          <img
            src="assets/viewerDashboard/gceo.jpg"
            className="w-full h-60 rounded-xl"
            alt="Right"
          />
        </div>

        {/* Center Image */}
        <div className="w-1/2 ">
          <img
            src="assets/viewerDashboard/gceo2.jpg"
            className="w-full h-96 object-cover rounded-2xl"
            alt="Center"
          />
        </div>

        {/* Right Image */}
        <div className="w-1/4 rounded-xl">
          <img
            src="assets/viewerDashboard/gceo.jpg"
            className="w-full h-60 rounded-xl"
            alt="Right"
          />
        </div>
      </div>
    </div>
  );
};

export default UseCase;
