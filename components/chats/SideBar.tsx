"use client";

import * as React from "react";
import {
  Hash,
  Music,
  Users,
  Volume2,
  Crown,
  GamepadIcon,
  Radio,
  Heart,
  Bell,
  Mic,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const textChannels = [
  { label: "Announcement", icon: Bell },
  { label: "Support", icon: Heart },
  { label: "Mabar Santuy", icon: GamepadIcon },
  { label: "Just Music", icon: Music },
  { label: "General", icon: Hash },
  { label: "Live Stream", icon: Radio },
  { label: "Pro Player Only", icon: Crown },
  { label: "Party Santuy", icon: Users },
];

const voiceChannels = [
  { label: "KillEveryone" },
  { label: "XanaFams" },
  { label: "Ratatuturu" },
  { label: "Popokuproy" },
];

export function ServerSidebar() {
  return (
    <Sidebar className="w-64 h-screen bg-gray-900 text-gray-300">
      {/* Header */}
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700"></div>
          <h2 className="text-lg font-semibold">OG Esport</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Text Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs text-gray-400 uppercase mt-4 mb-2">
            Text Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {textChannels.map((channel) => (
                <SidebarMenuItem
                  key={channel.label}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
                >
                  <channel.icon className="h-4 w-4 text-gray-500" />
                  <SidebarMenuButton>{channel.label}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Voice Channels */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs text-gray-400 uppercase mt-6 mb-2">
            Voice Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {voiceChannels.map((channel) => (
                <SidebarMenuItem
                  key={channel.label}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    🟣 {/* Placeholder for avatar */}
                  </div>
                  <div className="flex-1">{channel.label}</div>
                  <Mic className="h-4 w-4 text-gray-500" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
