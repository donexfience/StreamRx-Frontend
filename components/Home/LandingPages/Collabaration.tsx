import React from "react";
import "@/styles/collabaration.css";
import Image from "next/image";
const Collabaration = () => {
  return (
    <div>
      <div className="px-44 pt-36">
        <div className="custom-line"></div>
        <h2 style={{ color: "#00bcd4" }} className="pt-4">
          Collabarations
        </h2>
        <h2 className="text-3xl pt-4 text-white">
          Invite your friends to watch videos and show support to creators
          <br />
          and show support to creators.
        </h2>
        <div className="items-center gap-52 sm:flex lg:flex-row flex-col">
          <div className="pt-16 items-center gap-24">
            <div className="flex gap-3">
              <Image
                src="/assets/collabarationIcons/3.png"
                alt="icon for colab"
                width={30}
                height={30}
              />
              <h2 className="text-white text-xl">Plalylists</h2>
            </div>
            <div>
              <h2 className="text-white text-xl">
                Queue, schedule, and loop your videos to stream binge-worthy
                live series.
              </h2>
            </div>
          </div>
          {/* 2 nd iamges */}

          <div className="flex items-center gap-32">
            <div className="pt-16  items-center gap-3">
              <div className="flex gap-3">
                <Image
                  src="/assets/collabarationIcons/2.png"
                  alt="icon for colab"
                  width={30}
                  height={30}
                />
                <h2 className="text-white text-xl">Plalylists</h2>
              </div>
              <div>
                <h2 className="text-white">
                  Queue, schedule, and loop your videos to stream binge-worthy
                  live series.
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-32">
            <div className="pt-16  items-center gap-3">
              <div className="flex gap-3">
                <Image
                  src="/assets/collabarationIcons/1.png"
                  alt="icon for colab"
                  width={30}
                  height={30}
                />
                <h2 className="text-white text-xl">Plalylists</h2>
              </div>
              <div>
                <h2 className="text-white">
                  Queue, schedule, and loop your videos to stream binge-worthy
                  live series.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" px-6 sm:px-12 lg:px-44 mt-9 flex flex-col lg:flex-row h-auto lg:h- user-background text-white">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-wrap lg:flex-nowrap gap-6">
          {/* Left Sidebar - Video Previews */}
          <div className="">
            <div className="bg-transparent text-xs h-10 flex flex-wrap gap-4 lg:flex-col pb-40 hidden sm:flex">
              <video
                src="https://embed-ssl.wistia.com/deliveries/c832ebcd2035caf85fa53a6841d290a9ac74d63a.bin?disposition=attachment&filename=collaboration_video_002_14sec_720p.mp4"
                autoPlay
                preload="auto"
                muted
                loop
                controls
                playsInline
                className="rounded-md w-full sm:w-40 lg:w-56 h-40 sm:h-56 lg:h-72 object-fill"
              ></video>
            </div>
            <div className="bg-transparent text-xs h-10 flex flex-wrap gap-4 lg:flex-col hidden sm:flex">
              <video
                src="https://embed-ssl.wistia.com/deliveries/c832ebcd2035caf85fa53a6841d290a9ac74d63a.bin?disposition=attachment&filename=collaboration_video_002_14sec_720p.mp4"
                autoPlay
                preload="auto"
                muted
                loop
                controls
                playsInline
                className="rounded-md w-full sm:w-40 lg:w-56 h-40 sm:h-56 lg:h-72 object-fill"
              ></video>
            </div>
          </div>

          <div className="bg-transparent text-xs max-h-fit flex flex-wrap gap-4 lg:flex-col">
            <video
              src="https://embed-ssl.wistia.com/deliveries/c832ebcd2035caf85fa53a6841d290a9ac74d63a.bin?disposition=attachment&filename=collaboration_video_002_14sec_720p.mp4"
              autoPlay
              preload="auto"
              muted
              loop
              controls
              playsInline
              className="rounded-md w-full sm:w-40 lg:w-56 h-40 sm:h-56 lg:h-72 object-fill"
            ></video>
          </div>

          {/* Center - Main Video Area */}
          <div className="flex-1 flex flex-col">
            <div className="bg-transparent p-4">
              <div className="aspect-video bg-transparent rounded-lg w-full">
                {/* <video
                  src="https://embed-ssl.wistia.com/deliveries/c832ebcd2035caf85fa53a6841d290a9ac74d63a.bin?disposition=attachment&filename=collaboration_video_002_14sec_720p.mp4"
                  autoPlay
                  preload="auto"
                  muted
                  loop
                  controls
                  playsInline
                  className="rounded-md w-full h-64 sm:h-80 lg:h-full object-fill"
                ></video> */}
                <img
                  className="rounded-md w-full h-64 sm:h-80 lg:h-full object-fill"
                  src="https://restream.io/_next/static/media/home-app.523dc932.webp"
                ></img>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Controls & Info */}
          <div className="w-full lg:w-80 bg-transparent rounded-lg border-gray-700 flex flex-col gap-4">
            <div className="bg-black border-[#26262F] border rounded-lg text-white flex flex-col p-3">
              <h3 className="mb-2">Captions</h3>
              <div className="font-medium border border-[#26262F] lower-third p-3">
                Lower Third
              </div>
              <div className="border border-[#26262F] lower-third rounded-lg p-3">
                We are live! Where're you from? Tell us in the chat.
              </div>
              <div className="p-3">Playlists are here!</div>
              <div className="p-3">We are launching a new feature...</div>
            </div>
          </div>

          {/* Extra Sidebar (if needed) */}
          <div className="hidden sm:block w-20 bg-transparent rounded-lg border-gray-700 flex flex-col pb-3 gap-4">
            <div className="bg-black border-[#26262F] border rounded-lg text-white flex flex-col p-3 gap-2">
              <div className="font-medium border border-[#26262F] lower-third">
                Lower Third
              </div>
              <div className="border border-[#26262F] lower-third rounded-lg">
                We are live
              </div>
              <div
                className="border border-[#26262F] lower-third rounded-lg p-3 flex justify-center
              "
              >
                Playlists
              </div>
              <div className="border border-[#26262F] lower-third rounded-lg p-3 flex justify-center overflow-hidden">
                Launching soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Collabaration;
