interface LayoutSelectorProps {
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
}

import React from "react";
import {
  Square,
  LayoutGrid,
  Columns,
  RectangleVertical,
  RectangleHorizontal,
  Monitor,
  Smartphone,
} from "lucide-react";

interface LayoutSelectorProps {
  currentLayout: string;
  onLayoutChange: (layout: string) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  const layouts = [
    {
      id: 1,
      icon: <Square size={18} />,
      type: "single",
      label: "Single Window",
    },
    {
      id: 2,
      icon: <RectangleHorizontal size={18} />,
      type: "grid-2",
      label: "Two Column Grid",
    },
    {
      id: 3,
      icon: <LayoutGrid size={18} />,
      type: "grid-4",
      label: "Four Grid",
    },
    {
      id: 4,
      icon: <RectangleVertical size={18} />,
      type: "vertical",
      label: "Vertical Layout",
    },
  ];

  return (
    <div className="flex gap-2 items-center">
      <div className="flex bg-[#192b4e] rounded-md p-1 border border-[#2d4271]">
        {layouts.map((layout) => (
          <button
            key={layout.id}
            className={`px-3 py-1 flex items-center ${
              layout.type === currentLayout
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white"
            } rounded`}
            onClick={() => onLayoutChange(layout.type)}
            title={layout.label}
          >
            {layout.icon}
          </button>
        ))}
      </div>
      <div className="bg-[#192b4e] rounded-md p-1 border border-[#2d4271] flex gap-1">
        <button className="p-1 bg-blue-600 rounded" title="Desktop View">
          <Monitor size={18} />
        </button>
        <button
          className="p-1 text-gray-400 hover:text-white rounded"
          title="Mobile View"
        >
          <Smartphone size={18} />
        </button>
      </div>
    </div>
  );
};

export default LayoutSelector;
