import React from "react";
import { Plus, MoreVertical, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const Sidebar = () => {
  const scenes = [
    {
      id: 1,
      name: "Welcome",
      active: false,
      thumbnail: "bg-gradient-to-r from-purple-500 to-blue-500",
    },
    {
      id: 2,
      name: "Demo",
      active: false,
      thumbnail: "bg-gradient-to-r from-purple-500 to-blue-500",
      duration: "00:21",
    },
    {
      id: 3,
      name: "New scene",
      active: true,
      thumbnail: "bg-gradient-to-r from-purple-500 to-blue-500",
    },
  ];

  return (
    <div className="w-[140px] bg-[#0e1e3c] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="p-2">
        <button className="w-full text-sm flex items-center justify-center gap-1 p-2 bg-[#192b4e] hover:bg-[#243860] rounded-md transition-colors">
          <Plus size={16} />
          <span>Add Scene</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className={`group relative rounded-md overflow-hidden ${
              scene.active ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className={`h-20 ${scene.thumbnail} relative`}>
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                {scene.duration && (
                  <div className="absolute bottom-1 left-1 bg-black/70 text-xs px-1 rounded flex items-center">
                    <Clock size={10} className="mr-0.5" />
                    {scene.duration}
                  </div>
                )}
                <div className="absolute top-1 right-1">
                  <button className="text-white/70 hover:text-white">
                    <MoreVertical size={14} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-xs">👤</span>
                  </div>
                  {scene.id !== 2 && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-1 text-xs font-medium bg-[#0e1e3c]">
              {scene.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
