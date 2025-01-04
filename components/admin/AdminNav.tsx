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
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import React, { useState } from "react";

const AdminNav = () => {
  const handleLogout = async () => {
    console.log("clicked logout");
    await clearAuthCookie("refreshToken");
    await clearAuthCookie("accessToken");
  };

  const [isDark, setIsDark] = useState(true);
  const pathname = usePathname();

  // Helper function to check if a path is active
  const isActiveLink = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    return pathname !== "/dashboard" && pathname.includes(path);
  };

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      text: "Dashboard",
      navigate: "/dashboard",
    },
    { icon: <Users size={20} />, text: "Streamers", navigate: "/dashboard/admin/streamers" },
    {
      icon: <Users2 size={20} />,
      text: "Users",
      navigate: "/dashboard/admin/users",
    },
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
  ];

  return (
    <div className="h-full">
      <div className="w-64 bg-[#1C1C27] p-6 space-y-8 h-screen">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span className="bg-white text-black px-2 rounded">S</span>
          <h1 className="text-lg text-white">StreamRx</h1>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item, index) => (
            <Link href={item.navigate} key={index}>
              <div
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer ${
                  pathname === item.navigate
                    ? "bg-purple-500 text-white"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
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
          className={`p-2 rounded ${
            isDark ? "bg-purple-500" : "bg-gray-800"
          } ml-6`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNav;
