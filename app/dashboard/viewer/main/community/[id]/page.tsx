"use client";
import { ChatSection } from "@/components/chats/chatArea";
import { MembersList } from "@/components/chats/Memberlist";
import { useEffect, useState } from "react";
import { Hash, Twitch, Youtube, Settings } from "lucide-react";
import { getUserFromCookies } from "@/app/lib/action/auth";
import {
  useGetAllSubscribedChannelByUserIdQuery,
  useGetAllSubscribersByChannelIdQuery,
} from "@/redux/services/community/communityApi";
import { useGetUserQuery } from "@/redux/services/user/userApi";

interface Channel {
  label: string;
  icon: any;
  imageUrl: string;
  category: string;
  channelId: string;
  ownerId: string;
}

export default function Chat() {
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<any>(null);

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

  const { data: channelData } = useGetAllSubscribedChannelByUserIdQuery(
    { userId: userData?.user._id || "" },
    {
      skip: !userData?.user._id,
    }
  );

  const subscribedChannels: Channel[] =
    channelData?.data?.map((channel: any) => ({
      label: channel.channelId.channelName,
      icon: channel.channelId.integrations.twitch
        ? Twitch
        : channel.channelId.integrations.youtube
        ? Youtube
        : channel.channelId.integrations.discord
        ? Youtube
        : Hash,
      imageUrl: channel.channelId.channelProfileImageUrl,
      category: channel.channelId.category?.[0],
      channelId: channel.channelId._id,
      ownerId: channel.channelId.ownerId,
    })) || [];

  useEffect(() => {
    // Only set active channel if we have channels and no active channel
    if (subscribedChannels && subscribedChannels.length > 0 && !activeChannel) {
      setActiveChannel(subscribedChannels[0]);
    }
  }, [subscribedChannels, activeChannel]);

  const { data: allSubscribers } = useGetAllSubscribersByChannelIdQuery(
    {
      channelId: activeChannel?.channelId || "",
    },
    {
      skip: !activeChannel?.channelId || activeChannel.channelId === "",
      refetchOnMountOrArgChange: true,
    }
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-300 w-full">
      <div className="w-80 h-full bg-gray-950 shadow-lg p-4 flex flex-col border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Channels</h2>

        {subscribedChannels && subscribedChannels.length > 0 && (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-400 px-4 mb-2">
              Subscribed Channels
            </h3>
            {subscribedChannels.map((channel: Channel, index) => (
              <button
                key={`subscribed-${index}`}
                onClick={() => setActiveChannel(channel)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full 
                ${
                  activeChannel?.channelId === channel.channelId
                    ? "bg-gray-700 text-white shadow-md border-l-4 border-purple-500"
                    : "hover:bg-gray-800 text-gray-400 hover:scale-105"
                }`}
              >
                {channel.imageUrl ? (
                  <img
                    src={channel.imageUrl}
                    alt={channel.label}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <channel.icon className="h-5 w-5" />
                )}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{channel.label}</span>
                  <span className="text-xs text-gray-500">
                    {channel.category}
                  </span>
                </div>
                {activeChannel?.channelId === channel.channelId && (
                  <Settings className="h-4 w-4 ml-auto opacity-70 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col bg-gray-950 border-l border-r border-gray-800 backdrop-blur-lg bg-opacity-80 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <ChatSection
            currentChannel={activeChannel}
            currentUser={userData?.user}
          />
        </div>
      </div>

      <div className="w-72 h-full bg-gray-950 shadow-lg p-4 border-l border-gray-700">
        <MembersList channelId={activeChannel?.channelId || ""} />
      </div>
    </div>
  );
}
