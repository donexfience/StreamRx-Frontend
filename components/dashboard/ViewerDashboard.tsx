import React from "react";
import ViewerNavbar from "./navbar/VIewerNavbar";
import Streamvideo from "./viewerComponent/Streamvide";
import Usage from "./viewerComponent/Usage";
import YourunfairAdvantage from "./viewerComponent/YourunfairAdvantage";
import TakeControl from "./viewerComponent/TakeControl";
import UseCase from "./viewerComponent/UseCase";
import Reviews from "./viewerComponent/Reviews";
import GettingStartedTody from "./viewerComponent/GettingStartedTody";
import Footer from "../Home/LandingPages/Footer";

const ViewerDashboard: React.FC = () => {
  return (
    <div>
      <ViewerNavbar />
      <div
        style={{ backgroundColor: "#01010C" }}
        className="background z-100 relative"
      >
        <div className="w-full relative">
          <div
            className="absolute inset-0 bg-[url('/assets/viewerDashboard/bg.png')] 
            bg-cover bg-center opacity-50 
            mask-image-fade-bottom"
            style={{
              maskImage:
                "linear-gradient(to bottom, white 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, white 70%, transparent 100%)",
            }}
          />

          <div className="relative z-10 p-8">
            <Streamvideo />
          </div>
        </div>
        <div
          className="w-full px-8 py-12 h-full"
          style={{ backgroundColor: "#01010C" }}
        >
          <div className="container mx-auto">
            <Usage />
            <YourunfairAdvantage />
            <TakeControl />
            <UseCase />
            <Reviews />
            <GettingStartedTody />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;
