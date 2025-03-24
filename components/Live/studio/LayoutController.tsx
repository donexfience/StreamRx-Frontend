import React from "react";
import { Monitor, Smartphone } from "lucide-react";

const LayoutSelector = () => {
  const layouts = [
    { id: 1, icon: "■", active: true },
    { id: 2, icon: "▣", active: false },
    { id: 3, icon: "▤", active: false },
    { id: 4, icon: "▦", active: false },
    { id: 5, icon: "▩", active: false },
    { id: 6, icon: "▧", active: false },
  ];

  return (
    <div className="flex gap-2 items-center">
      <div className="flex bg-[#192b4e] rounded-md p-1 border border-[#2d4271]">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className={`px-3 py-1 text-lg ${
              layout.active
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            } rounded`}
          >
            {layout.icon}
          </button>
        ))}
      </div>

      <div className="bg-[#192b4e] rounded-md p-1 border border-[#2d4271] flex gap-1">
        <button className="p-1 bg-blue-600 rounded">
          <Monitor size={18} />
        </button>
        <button className="p-1 text-gray-400 hover:text-white rounded">
          <Smartphone size={18} />
        </button>
      </div>
    </div>
  );
};

export default LayoutSelector;
