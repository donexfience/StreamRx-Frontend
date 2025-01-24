"use client";

import { ChatSection } from "@/components/chats/chatArea";
import { MembersList } from "@/components/chats/Memberlist";
import { ServerSidebar } from "@/components/chats/SideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import * as React from "react";
import {
  Hash,
  Music,
  Users,
  Crown,
  Radio,
  Heart,
  Bell,
  GamepadIcon,
  Settings,
} from "lucide-react";

export default function Chat() {
  const [socket, setSocket] = useState<any>(null);
  const channels = [
    { label: "Announcement", icon: Bell },
    { label: "Support", icon: Heart },
    { label: "Mabar Santuy", icon: GamepadIcon },
    { label: "Just Music", icon: Music },
    { label: "General", icon: Hash },
    { label: "Live Stream", icon: Radio },
    { label: "Pro Player Only", icon: Crown },
    { label: "Party Santuy", icon: Users },
  ];

  useEffect(() => {
    const socket = io("http://localhost:4000");
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div
      className="flex h-screen bg-background justify-between ml-32
    "
    >
      <div className="w-96 h-screen bg-white shadow-lg ">
        <div className="py-6">
          {channels.map((channel, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-8 py-4 group ${
                index === 4 ? "bg-gray-200" : "hover:bg-gray-100"
              } rounded-lg transition`}
            >
              <div className="flex items-center gap-3">
                <channel.icon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  {channel.label}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition">
                <Settings className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="">
        <ChatSection />
      </div>
      <MembersList />
    </div>
  );
}
