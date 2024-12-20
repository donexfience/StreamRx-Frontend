import { MainContent } from "@/components/viewer-main/MainContent";
import Popular from "@/components/viewer-main/Popular";
import ViewerHead from "@/components/viewer-main/ViewerHead";
import ViewerNavbar from "@/components/viewer-main/ViewerNavbar";
import React from "react";

const page: React.FC = () => {
  return (
    <div className="">
      <MainContent />
      <Popular/>
    </div>
  );
};

export default page;
