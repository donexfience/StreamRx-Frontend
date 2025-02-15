"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useGetAllSubscribersByChannelIdQuery } from "@/redux/services/community/communityApi";

interface Member {
  _id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
}

interface MemberlistProps {
  channelId: string;
  currentUser: any;
}

export function MembersList({ channelId, currentUser }: MemberlistProps) {
  const { communitySocket } = useSocket();
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { data: allSubscribers } = useGetAllSubscribersByChannelIdQuery({
    channelId: channelId,
  });
  console.log(currentUser, "current user");

  useEffect(() => {
    if (allSubscribers) {
      const formattedMembers = allSubscribers.map((sub: any) => ({
        _id: sub.userId?._id,
        name: sub.userId.username,
        avatar: sub.userId?.profileImageURL || "",
        status: onlineUsers.includes(sub.userId._id) ? "online" : "offline",
      }));
      setMembers(formattedMembers);
    }
  }, [allSubscribers, onlineUsers]);

  useEffect(() => {
    if (!communitySocket || !channelId) return;

    communitySocket.emit("join-channel", {
      channelId: channelId,
      userId: currentUser?._id || "",
    });

    const handleUserJoined = ({
      userId,
      onlineUsers: currentOnlineUsers,
    }: {
      userId: string;
      onlineUsers: string[];
    }) => {
      console.log("User joined:", userId, "Online users:", currentOnlineUsers);
      setOnlineUsers(currentOnlineUsers);
    };

    const handleUserLeft = ({
      userId,
      onlineUsers: currentOnlineUsers,
    }: {
      userId: string;
      onlineUsers: string[];
    }) => {
      console.log("User left:", userId, "Online users:", currentOnlineUsers);
      setOnlineUsers(currentOnlineUsers);
    };

    communitySocket.on("user-joined", handleUserJoined);
    communitySocket.on("user-left", handleUserLeft);

    communitySocket.emit("get-online-users", { channelId });

    return () => {
      communitySocket.off("user-joined", handleUserJoined);
      communitySocket.off("user-left", handleUserLeft);

      communitySocket.emit("leave-channel", {
        channelId: channelId,
        userId: currentUser?._id || "",
      });
    };
  }, [communitySocket, channelId, allSubscribers]);

  return (
    <div className="w-60 border-l h-screen">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <h3 className="font-semibold">Members ({members.length})</h3>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-3rem)]">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Server Info</h4>
            <p className="text-sm text-muted-foreground">
              A professional esports organization based in North America...
            </p>
            <Button variant="outline" className="w-full justify-between">
              Copy Link
              <Link className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Members</h4>
            {members.map((member) => (
              <div
                key={member?._id}
                className="flex items-center gap-2 group px-2 py-1 rounded hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member?.avatar} />
                  <AvatarFallback>{member?.name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm">{member.name}</span>
                <div
                  className={`h-2 w-2 rounded-full ${
                    onlineUsers.includes(member._id)
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
