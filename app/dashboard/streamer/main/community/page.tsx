"use client";
import { ChatSection } from "@/components/chats/chatArea";
import { MembersList } from "@/components/chats/Memberlist";
import { useEffect, useState } from "react";
import { Twitch, Youtube, Settings } from "lucide-react";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetAllSubscribersByChannelIdQuery } from "@/redux/services/community/communityApi";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";

interface Channel {
  label: string;
  icon: any;
  imageUrl: string;
  category: string;
  channelId: string;
  ownerId: string;
}

export default function Chat() {
  const [users, setUsers] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodeUser = await getUserFromCookies();
        setUsers(decodeUser.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const { data: userData } = useGetUserQuery(
    { email: users?.email },
    {
      skip: !users?.email,
    }
  );

  const {
    data: channelData,
    isLoading: channelLoading,
    isError: channelError,
  } = useGetChannelByEmailQuery(users?.email ?? "", {
    skip: !users?.email,
  });

  useEffect(() => {
    if (channelData) {
      const channel = {
        label: channelData.channelName,
        icon: channelData.integrations.twitch
          ? Twitch
          : channelData.integrations.youtube
          ? Youtube
          : Youtube, // Default to Youtube if neither Twitch nor Discord
        imageUrl: channelData.channelProfileImageUrl,
        category: channelData.category?.[0] || "Uncategorized",
        channelId: channelData._id,
        ownerId: channelData.ownerId,
      };
      setActiveChannel(channel);
    }
  }, [channelData]);

  const { data: allSubscribers } = useGetAllSubscribersByChannelIdQuery(
    {
      channelId: activeChannel?.channelId || "",
    },
    {
      skip: !activeChannel?.channelId || activeChannel.channelId === "",
      refetchOnMountOrArgChange: true,
    }
  );

  if (channelLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        Loading...
      </div>
    );
  }

  if (channelError) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        Error loading channel data.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 w-full ml-32 bg-white">
      <div className="flex-1 flex flex-col bg-white border-l border-r border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatSection
            currentChannel={activeChannel}
            currentUser={userData?.user}
          />
        </div>
      </div>

      <div className="w-72 h-full bg-white shadow-lg p-4 border-l border-gray-200">
        <MembersList
          currentUser={userData?.user}
          channelId={activeChannel?.channelId || ""}
        />
      </div>
    </div>
  );
}
