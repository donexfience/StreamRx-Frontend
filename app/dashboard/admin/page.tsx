"use client";
import { useState } from "react";
import {
  Search,
  Sun,
  Bell,
  LayoutDashboard,
  Users,
  Award,
  Copyright,
  Shield,
  Users2,
  FileText,
  Play,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);

  const recentActivities = [
    {
      name: "Papaya",
      action: "Purchase by you for 0.05 ETH",
      time: "12 mins ago",
    },
    { name: "Papaya", action: "0.05 ETH Received", time: "12 mins ago" },
    { name: "Papaya", action: "Started Following you", time: "12 mins ago" },
    {
      name: "Papaya",
      action: "has been sold by 12.75ETH",
      time: "12 mins ago",
    },
    {
      name: "Papaya",
      action: "Purchase by you for 0.05 ETH",
      time: "12 mins ago",
    },
  ];

  const creators = Array(4).fill({ name: "Papaya", items: "60 Items" });
  const users = Array(4).fill({ name: "Papaya", items: "60 Items" });

  return (
    <div className="flex min-h-screen bg-[#14141F] text-white w-full">

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search Here"
              className="bg-[#1C1C27] pl-10 pr-4 py-2 rounded-lg w-64"
            />
          </div>
          <div className="flex items-center gap-4">
            <Bell size={20} />
            <img
              src="/api/placeholder/32/32"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>

        {/* Content Grid - Restructured */}
        <div className="space-y-6">
          {/* First Row - All Graphs */}
          <div className="grid grid-cols-3 gap-6">
            {/* Trending Streams */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-6">Trending Streams</h2>
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">
                    Channels on Top
                  </div>
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="mb-4">
                      <div className="text-sm mb-1">channel name</div>
                      <div
                        className={`h-1 rounded-full ${
                          i === 0
                            ? "bg-purple-500"
                            : i === 1
                            ? "bg-green-500"
                            : "bg-blue-500"
                        } w-${[10, 8, 6][i]}/12`}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trending Content Graph */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-6">Trending content</h2>
              <div className="h-48 flex items-center justify-center">
                <div className="text-gray-400">Graph Placeholder</div>
              </div>
            </div>

            {/* Active Channels */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-6">Active Channels</h2>
              <div className="relative w-32 h-32 mx-auto">
                <div className="w-full h-full rounded-full border-8 border-purple-500"></div>
                <div className="absolute top-0 right-0 w-full h-full rounded-full border-8 border-gray-700 border-r-transparent transform -rotate-45"></div>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Artwork Sold
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                  Artwork Cancel
                </div>
              </div>
            </div>
          </div>

          {/* Second Row - Lists */}
          <div className="grid grid-cols-3 gap-6">
            {/* Recent Multistreams */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm font-medium">Recent multistreams</div>
                <ChevronRight size={20} className="text-purple-500" />
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img
                      src="/api/placeholder/32/32"
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm">{activity.action}</div>
                      <div className="text-xs text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Creators */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-4">Top Creators</h2>
              <div className="space-y-4">
                {creators.map((creator, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="/api/placeholder/32/32"
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {creator.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {creator.items}
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-1 rounded-full bg-purple-500 text-xs">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Users */}
            <div className="bg-[#1C1C27] p-6 rounded-2xl">
              <h2 className="text-lg font-semibold mb-4">Top users</h2>
              <div className="space-y-4">
                {users.map((user, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src="/api/placeholder/32/32"
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-medium">{user.name}</div>
                        <div className="text-xs text-gray-400">
                          {user.items}
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-1 rounded-full bg-purple-500 text-xs">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
