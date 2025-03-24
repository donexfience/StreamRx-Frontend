import { Copy, Maximize2, MoreVertical, Volume2 } from "lucide-react";
import React from "react";

const UserSelection: React.FC<{
  setActiveTool: (value: any) => void;
  activeTool: string;
}> = ({ setActiveTool, activeTool }) => {
  const sources = [
    { id: 1, name: "Donex fience", type: "Camera", active: true },
    { id: 2, name: "self", type: "Camera", active: false },
  ];
  return (
    <div>
      <div className="p-3 flex items-center justify-between border-b border-white/10">
        <h3 className="font-medium flex items-center gap-2">
          Sources
          <button className="text-gray-400 hover:text-white">
            <MoreVertical size={16} />
          </button>
        </h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setActiveTool(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-gray-400">Invite up to 6 guests</div>
          <button className="text-blue-400 hover:text-blue-300 text-sm">
            Upgrade for more
          </button>
        </div>
        <button className="w-full py-1.5 text-sm flex items-center justify-center gap-1 bg-[#192b4e] hover:bg-[#243860] rounded-md transition-colors">
          <Copy size={14} />
          <span>Copy Invite Link</span>
        </button>
      </div>

      {/* Sources list */}
      <div className="flex-1 overflow-y-auto p-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className="mb-3 bg-[#192b4e] rounded-md overflow-hidden gap-2"
          >
            <div className="relative h-16 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              {source.id === 1 && (
                <img
                  src="/lovable-uploads/a44d3825-7dc2-48e3-820a-59109792ebf4.png"
                  alt="Camera preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-1 right-1 flex gap-1">
                <button className="text-white/70 hover:text-white">
                  <MoreVertical size={14} />
                </button>
                <button className="text-white/70 hover:text-white">
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{source.name}</div>
                  <div className="text-xs text-gray-400">{source.type}</div>
                </div>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      source.active ? "bg-blue-500" : "bg-gray-500"
                    } mr-1`}
                  ></div>
                </div>
              </div>
              <div className="flex items-center mt-1 gap-1">
                <Volume2 size={14} />
                <div className="bg-[#243860] h-1 flex-1 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelection;
