'use client';
import React from "react";
import {
  LayoutGrid,
  MapPin,
  Music2,
  Thermometer,
  Timer,
  Bell,
  Settings,
  User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function StreamerNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: <LayoutGrid size={20} />, path: "/dashboard", label: "Dashboard" },
    { icon: <MapPin size={20} />, path: "/dashboard/streamer/main/videoes", label: "Locations" },
    { icon: <Music2 size={20} />, path:"/dashboard/streamer/main/playlists", label: "Music" },
    { icon: <Thermometer size={20} />, path: "/temperature", label: "Temperature" },
    { icon: <Timer size={20} />, path: "/timer", label: "Timer" },
    { icon: <Bell size={20} />, path: "/notifications", label: "Notifications" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-[122px] flex flex-col bg-white shadow-lg py-6">
      {/* Logo */}
      <div className="mb-8 px-10">
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-2xl font-bold">S</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center justify-center space-y-4">
        {navItems.map((item, index) => (
          <div key={item.path} className="flex flex-col items-center w-full">
            <button
              onClick={() => router.push(item.path)}
              className={`w-full px-4 py-2 flex items-center justify-center group relative`}
              title={item.label}
            >
              <div
                className={`p-2 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "text-black bg-gray-100"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {item.icon}
              </div>
              {pathname === item.path && (
                <div className="absolute left-0 w-1 h-6 bg-black rounded-r-full" />
              )}
            </button>
            {/* Divider */}
            {index < navItems.length - 1 && (
              <div className="w-8 h-px bg-gray-200 my-2" />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-6 px-10">
        <button
          onClick={() => router.push("/settings")}
          className="w-full flex justify-center text-gray-400 hover:text-gray-600"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={() => router.push("/dashboard/streamer/main/profile")}
          className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-gray-200"
        >
          <img
            src="/assets/avathar/avatar.png"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}
