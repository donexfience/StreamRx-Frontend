import React, { useState, useEffect, useCallback } from "react";
import { MoreVertical, Copy, Volume2, Maximize2 } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import DesignOptions from "./sourceOptions/DesignOptions";
import UserSelection from "./sourceOptions/UserSelection";

interface SourcePanelProps {
  onSettingsChange: (settings: any) => void;
  streamId: string | null;
}

const SourcePanel: React.FC<SourcePanelProps> = ({
  onSettingsChange,
  streamId,
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [streamSettings, setStreamSettings] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const { streamingSocket } = useSocket();
  const [closeModal, setCloseModal] = useState(false);

  useEffect(() => {
    if (streamingSocket) {
      const handleStreamUpdate = () => {
        setIsJoined(true);
      };

      const handleStreamSettings = (settings: any) => {
        console.log("Stream settings received in SourcePanel:", settings);
        setStreamSettings(settings);
        onSettingsChange(settings);
      };

      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);

      return () => {
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("streamSettings", handleStreamSettings);
      };
    }
  }, [streamingSocket, onSettingsChange]);

  useEffect(() => {
    if (streamingSocket && isJoined && streamId) {
      streamingSocket.emit("getStreamSettings", streamId);
    }

    console.log(activeTool, "acative tool ");
  }, [streamingSocket, isJoined, streamId]);

  const handleSettingsChange = useCallback(
    (newSettings: any) => {
      const newSettingsStr = JSON.stringify(newSettings);
      const currentSettingsStr = JSON.stringify(streamSettings);

      if (newSettingsStr !== currentSettingsStr) {
        console.log("Updating stream settings in SourcePanel:", newSettings);
        setStreamSettings(newSettings);
        if (streamingSocket && streamId) {
          streamingSocket.emit("updateStreamSettings", {
            streamId,
            settings: newSettings,
          });
        }
        onSettingsChange(newSettings);
      }
    },
    [streamingSocket, onSettingsChange, streamSettings, streamId]
  );

  const tools = [
    { id: "user", icon: "👤", title: "User" },
    { id: "design", icon: "🎨", title: "Design" },
    { id: "captions", icon: "💬", title: "Captions" },
    { id: "qr", icon: "📱", title: "QR Codes" },
    { id: "music", icon: "🎵", title: "Music" },
    { id: "notes", icon: "📝", title: "Notes" },
    { id: "chat", icon: "💭", title: "Chat" },
  ];

  return (
    <div className="w-96 bg-[#0e1e3c] border-l border-white/10 flex flex-col relative">
      {/* Header */}

      {/* Tools sidebar */}
      <div className="w-14 absolute right-0 top-16 bottom-0 bg-[#0c1a32] border-l border-white/10 flex flex-col items-center py-4">
        {tools.map((tool) => (
          <div key={tool.id} className="mb-5 flex flex-col items-center">
            <button
              className={`w-10 h-10 rounded-md flex items-center justify-center text-gray-300 hover:bg-[#192b4e] hover:text-white ${
                activeTool === tool.id ? "bg-[#192b4e] text-white" : ""
              }`}
              onClick={() =>
                setActiveTool(activeTool === tool.id ? null : tool.id)
              }
            >
              <span>{tool.icon}</span>
            </button>
            <span className="text-[10px] text-gray-400 mt-1">{tool.title}</span>
          </div>
        ))}
      </div>

      {activeTool === "design" && (
        <div className="absolute inset-0 bg-[#0e1e3c] z-10">
          <DesignOptions
            onSettingsChange={handleSettingsChange}
            savedSettings={streamSettings}
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        </div>
      )}
      {activeTool === "user" && (
        <div className="absolute inset-0 bg-[#0e1e3c] z-10">
          <UserSelection
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
        </div>
      )}
    </div>
  );
};

export default SourcePanel;
