import React from "react";
import { Maximize2 } from "lucide-react";
import LayoutSelector from "./LayoutController";

interface StreamView {
  streamSettings: any;
}

const StreamView: React.FC<StreamView> = ({ streamSettings }) => {
  const {
    background = "linear-gradient(to bottom right, #b9328d, #4b6ef7)",
    overlay = null,
    logo = null,
    font = "Default",
    theme = { bg: "bg-black/50", text: "text-white" },
  } = streamSettings || {};

  console.log(streamSettings, "stream settings got from the design options");

  return (
    <div className="flex-1 relative overflow-hidden mx-4 mt-4 mb-2">
      <div className="relative h-full rounded-md overflow-hidden border border-white/10">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: background?.startsWith("http")
              ? `url(${background})`
              : background || "none", 
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {overlay && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${overlay})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-3xl">
            <div className="absolute top-3 left-3 bg-black/50 rounded px-2 py-0.5 text-xs font-medium">
              720p
            </div>

            {logo && (
              <div className="absolute top-3 right-12">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            )}

            <div className="h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center text-4xl font-bold text-white">
                DF
              </div>

              <div
                className={`absolute bottom-5 left-5 rounded px-2 py-1 text-sm ${theme.bg} ${theme.text}`}
                style={{ fontFamily: font !== "Default" ? font : "inherit" }}
              >
                Donex fience
              </div>
            </div>

            <button className="absolute top-3 right-3 bg-black/50 rounded p-1 hover:bg-black/70">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <LayoutSelector />
      </div>
    </div>
  );
};

export default StreamView;
