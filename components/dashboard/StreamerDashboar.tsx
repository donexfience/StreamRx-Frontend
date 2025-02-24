"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import StreamerNavbar from "./navbar/StreamerNavbar";
import Studio from "./StreamerComponent/Studio";
import BrandStreamer from "./StreamerComponent/BrandStreamer";
import Reachyour from "./StreamerComponent/Reachyour";
import BecomeAhost from "./StreamerComponent/BecomeAhost";
import Engagewith from "./StreamerComponent/Engagewith";
import Driveaction from "./StreamerComponent/DriveAction";
import MakeYourVidoe from "./StreamerComponent/MakeYourVidoe";
import WhatYoucan from "./StreamerComponent/WhatYouCan";
import Feedback from "./StreamerComponent/Feedback";
import Growur from "./StreamerComponent/Growur";
import StreamerFooter from "./StreamerComponent/StreamerFooter";
import ChannelCreationModal from "../modals/channelCreationModal";
import {
  useCreateChannelMutation,
  useGetChannelByEmailQuery,
} from "@/redux/services/channel/channelApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import toast from "react-hot-toast";

const StreamerDashboard = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const [isModalOpen, setIsOpenModal] = useState(false);

  const {
    data: channelData,
    isLoading,
    isError,
  } = useGetChannelByEmailQuery(users?.email, { skip: !users?.email });

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      console.log(decodeUser, "decoded user");
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const [channelCreation] = useCreateChannelMutation();

  const handleChannelSubmit = async (channelData: any) => {
    try {
      const channelLastData = { email: users.email, ...channelData };
      console.log("Channel data:", channelLastData);
      const response = await channelCreation(channelLastData).unwrap();
      console.log(response, "response");
      if (response.success) {
        toast.success("channel created successfully");
        router.replace("/dashboard/streamer/main");
      }
      console.log("Channel created successfully:", response);
      setIsOpenModal(false);
    } catch (error: any) {
      toast.error(error?.data?.error);
    }
  };

  return (
    <div>
      <StreamerNavbar />
      <Studio
        hasChannel={!!channelData}
        onClose={() => setIsOpenModal(!isModalOpen)}
      />
      <BrandStreamer />
      <Reachyour />
      <BecomeAhost />
      <Driveaction />
      <Engagewith />
      <MakeYourVidoe />
      <WhatYoucan />
      <Feedback />
      <Growur />

      <StreamerFooter />

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160">
        <path
          fill="#a2d9ff"
          fillOpacity="0.42"
          d="M0,96L16,104C32,112,64,128,96,138.7C128,149,160,154.5,192,157.3C224,160,256,160,288,141.3C320,122.5,352,85.5,384,85.3C416,85.5,448,122.5,480,136C512,149.5,544,138.5,576,112C608,85.5,640,42.5,672,40C704,37.5,736,74.5,768,93.3C800,112,832,112,864,104C896,96,928,80,960,82.7C992,85.5,1024,106.5,1056,101.3C1088,96,1120,64,1152,69.3C1184,74.5,1216,117.5,1248,130.7C1280,144,1312,128,1344,109.3C1376,90.5,1408,69.5,1424,58.7L1440,48L1440,160L1424,160C1408,160,1376,160,1344,160C1312,160,1280,160,1248,160C1216,160,1184,160,1152,160C1120,160,1088,160,1056,160C1024,160,992,160,960,160C928,160,896,160,864,160C832,160,800,160,768,160C736,160,704,160,672,160C640,160,608,160,576,160C544,160,512,160,480,160C448,160,416,160,384,160C352,160,320,160,288,160C256,160,224,160,192,160C160,160,128,160,96,160C64,160,32,160,16,160L0,160Z"
        ></path>
      </svg>

      {isModalOpen && (
        <ChannelCreationModal
          onClose={() => setIsOpenModal(false)}
          onSubmit={handleChannelSubmit}
        />
      )}
    </div>
  );
};

export default StreamerDashboard;
