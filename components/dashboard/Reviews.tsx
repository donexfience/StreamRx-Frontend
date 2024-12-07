import React from "react";

const Reviews = () => {
  return (
    <div
      style={{
        maskImage: `radial-gradient(circle, white 40%, transparent 100%),
          linear-gradient(to top, white 70%, transparent 100%),
          linear-gradient(to bottom, white 90%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle, white 100%, transparent 100%),
          linear-gradient(to bottom, white 80%, transparent 100%)`,
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
      }}
      className="mt-8 mx-4 lg:mx-36 relative bg-[url('/assets/viewerDashboard/blueSpray.png')] bg-center bg-cover backdrop-blur-lg"
    >
      <div className="relative z-10 flex flex-col justify-center items-center pt-10 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl px-4">
          {/* Grid container */}
          {Array(9)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="font-bold p-4 text-white rounded-2xl w-full h-auto
                backdrop-blur-lg bg-white/5 hover:bg-blue-500 hover:text-white transition cursor-pointer flex flex-col justify-between"
              >
                <div className="text-sm">
                  Love multicasting live safaris from Kenya with StreamRx for
                  its simplicity, ease of use, and wide help options.
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <img
                    src="/assets/viewerDashboard/gceo.jpg"
                    className="rounded-full h-10 w-10"
                    alt="User Avatar"
                  />
                  <div>
                    <div className="text-white font-medium">Donex FIence</div>
                    <div className="text-gray-400 text-xs">CEO, Kenya Safaris</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
