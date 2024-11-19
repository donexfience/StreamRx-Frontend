import React from "react";
import LiveImageComponent from "./LiveImageComponent";
import "@/styles/userHome.css";
import Image from "next/image";
import Brand from "./Brand";
import Navbar from "./Navbar";
import Collabaration from "./Collabaration";
import WhyItMatters from "./WhyItMatters";
import HowPeopleUseIt from "./HowPeopleUseIt";
import WhatCustomersAreSaying from "./WhatCustomersAreSaying";
import Footer from "./Footer";


const UserHome: React.FC = () => {
  return (
    <div className="w-full h-full user-background sm:w-full">
      <Navbar />
      <LiveImageComponent />
      <div className="px-36">
        <Brand />
      </div>
      <Collabaration />
      <WhyItMatters />
      <HowPeopleUseIt />
      <WhatCustomersAreSaying/>
      <Footer/>
    </div>
  );
};

export default UserHome;
