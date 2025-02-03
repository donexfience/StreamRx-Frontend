"use client";
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { useGetAllSubscribedChannelByUserIdQuery } from "@/redux/services/community/communityApi";
import { getUserFromCookies } from "@/app/lib/action/auth";

const SubscriptionList = () => {
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

  return (
    <div className="min-h-screen bg-black text-white p-8 w-full">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All subscriptions</h1>
          <div className="relative">
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              Most relevant
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {channelData?.data.map((channel: any, index: number) => (
            <div
              key={channel._id}
              className="flex items-start gap-4 p-4 hover:bg-zinc-800/50 rounded-lg transition-colors"
            >
              <img
                src={
                  channel.channelId.channelProfileImageUrl ||
                  "/api/placeholder/80/80"
                }
                alt={`${channel.channelId.channelName}'s avatar`}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium flex items-center gap-1">
                      {channel.channelId.channelName}
                      {channel.channelId.contentType === "verified" && (
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{channel.channelId.email}</span>
                      <span>•</span>
                      <span>
                        {channel.channelId.subscribersCount || 0} subscribers
                      </span>
                    </div>
                  </div>

                  <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-full text-sm font-medium">
                    <Bell className="w-4 h-4" />
                    {channel.notificationsEnabled
                      ? "Notifications On"
                      : "Notifications Off"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  {channel.channelId.category} • {channel.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionList;
