"use client";
import { clearAuthCookie } from "@/app/lib/action/auth";
import {
  Award,
  Copyright,
  FileText,
  LayoutDashboard,
  Play,
  Settings,
  Shield,
  Sun,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link"; // Import Link
import React, { useState } from "react";

const AdminNav = () => {
  const handleLogout = async () => {
    console.log("clicked logout");
    await clearAuthCookie("refreshToken");
    await clearAuthCookie("accessToken");
  };

  const [isDark, setIsDark] = useState(true);

  return (
    <div className="h-full">
      <div className="w-64 bg-[#1C1C27] p-6 space-y-8 h-screen">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-white text-black p-1 rounded">S</span>
          StreamRx
        </div>

        <nav className="space-y-2">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 text-purple-500 bg-purple-500/10 p-3 rounded-lg cursor-pointer">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>
          </Link>

          {[
            {
              icon: <Users size={20} />,
              text: "Streamers",
              navigate: "/streamers",
            },
            { icon: <Users2 size={20} />, text: "Users", navigate: "/users" },
            {
              icon: <Award size={20} />,
              text: "Achievements",
              navigate: "/achievements",
            },
            {
              icon: <Copyright size={20} />,
              text: "Copyrights",
              navigate: "/copyrights",
            },
            {
              icon: <Shield size={20} />,
              text: "Moderators & editors",
              navigate: "/moderators",
            },
            {
              icon: <Users2 size={20} />,
              text: "Multistream",
              navigate: "/multistream",
            },
            {
              icon: <FileText size={20} />,
              text: "Content Management",
              navigate: "/content-management",
            },
            {
              icon: <Play size={20} />,
              text: "Live streams",
              navigate: "/live-streams",
            },
            {
              icon: <Settings size={20} />,
              text: "Settings",
              navigate: "/settings",
            },
          ].map((item, index) => (
            <Link href={item.navigate} key={index}>
              <div className="flex items-center gap-4 text-gray-400 hover:bg-gray-800 p-4 rounded-lg cursor-pointer">
                {item.icon}
                <span>{item.text}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="flex gap-2 pl-4">
          <button
            className={`p-2 rounded ${
              !isDark ? "bg-purple-500" : "bg-gray-800"
            }`}
            onClick={() => setIsDark(false)}
          >
            <Sun size={16} />
          </button>
          <button
            className={`p-2 rounded ${
              isDark ? "bg-purple-500" : "bg-gray-800"
            }`}
            onClick={() => setIsDark(true)}
          >
            Light
          </button>
        </div>
        <button
          className={`p-2 rounded ${isDark ? "bg-purple-500" : "bg-gray-800"} ml-6`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
