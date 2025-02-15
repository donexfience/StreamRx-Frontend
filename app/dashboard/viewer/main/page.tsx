import { MainContent } from "@/components/viewer-main/MainContent";
import Popular from "@/components/viewer-main/Popular";
import PopularShorts from "@/components/viewer-main/Popular-shorts";
import PopularVideo from "@/components/viewer-main/Popular-video";
import Recent from "@/components/viewer-main/Recent-video";
import ViewerHead from "@/components/viewer-main/ViewerHead";
import ViewerNavbar from "@/components/viewer-main/ViewerNavbar";
import { ThemeProvider } from "next-themes";
import React from "react";

const page: React.FC = () => {
  return (
    <div className="bg-black">
      <div className="w-full flex ">
        <ViewerNavbar />
        <MainContent />
      </div>
      <div className="ml-52 overflow-hidden w-[calc(100vw-240px)]">
        <Popular />
        <PopularShorts />
        <Recent />
        <PopularVideo />
      </div>
    </div>
  );
};

export default page;
