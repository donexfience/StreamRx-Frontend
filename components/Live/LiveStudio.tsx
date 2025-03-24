import { useSocket } from "@/hooks/useSocket";
import React, { FC, useState, useEffect, useCallback } from "react";
import Header from "./studio/Header";
import StreamView from "./studio/StreamPreview";
import ControlBar from "./studio/ControllBar";
import SourcePanel from "./studio/SourcePanel";
import Sidebar from "./studio/SideBar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface LIVESTUDIOProps {
  role: "host" | "guest";
  user: any;
  channelData?: any;
  streams?: any[];
}

const LIVESTUDIO: React.FC<LIVESTUDIOProps> = ({
  role,
  user,
  channelData,
  streams,
}) => {
  const { streamingSocket } = useSocket();
  const [streamSettings, setStreamSettings] = useState({
    background: "linear-gradient(to bottom right, #b9328d, #4b6ef7)",
    overlay: null,
    logo: null,
    font: "Default",
    theme: { bg: "bg-black/50", text: "text-white" },
  });
  const [streamId, setStreamId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [guestRequests, setGuestRequests] = useState<any[]>([]);

  const handleSettingsChange = useCallback(
    (newSettings: any) => {
      const newSettingsStr = JSON.stringify(newSettings);
      const currentSettingsStr = JSON.stringify(streamSettings);

      if (newSettingsStr !== currentSettingsStr) {
        console.log("Updating stream settings in LIVESTUDIO:", newSettings);
        setStreamSettings(newSettings);
      }
    },
    [streamSettings]
  );

  useEffect(() => {
    if (streamingSocket) {
      console.log("Streaming socket is connected in liveStudio");

      streamingSocket.emit("joinStudio", { role, user, channelData });

      const handleStreamUpdate = (data: any) => {
        console.log("Stream update received:", data);

        setStreamId(data?.id);
        setIsJoined(true);
      };

      const handleStreamSettings = (settings: any) => {
        console.log("Stream settings received in LIVESTUDIO:", settings);
        handleSettingsChange(settings);
      };

      const handleError = (error: any) => {
        console.error("Streaming socket error:", error);
      };

      const handleGuestRequest = (request: any) => {
        if (role === "host") {
          setGuestRequests((prev) => [...prev, request]);
        }
      };

      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);
      streamingSocket.on("error", handleError);
      streamingSocket.on("guestRequest", handleGuestRequest);

      return () => {
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("streamSettings", handleStreamSettings);
        streamingSocket.off("error", handleError);
        streamingSocket.off("guestRequest", handleGuestRequest);
      };
    }
  }, [streamingSocket, role, user, channelData, handleSettingsChange]);

  useEffect(() => {
    if (streamingSocket && isJoined && streamId) {
      streamingSocket.emit("getStreamSettings", streamId);
    }
  }, [streamingSocket, isJoined, streamId]);

  const handleApproveGuest = (request: any) => {
    if (streamingSocket && role === "host") {
      streamingSocket.emit("approveGuest", {
        token: request.token,
        username: request.username,
        channelId: request.channelId,
        socketId: request.socketId,
        approverId: user._id,
      });
      setGuestRequests((prev) =>
        prev.filter((r) => r.socketId !== request.socketId)
      );
    }
  };

  const handleDenyGuest = (request: any) => {
    if (streamingSocket && role === "host") {
      streamingSocket.emit("denyGuest", {
        socketId: request.socketId,
        approverId: user._id,
        channelId: request.channelId,
      });
      setGuestRequests((prev) =>
        prev.filter((r) => r.socketId !== request.socketId)
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const channelOwner: any = channelData.ownerId;

  return (
    <div>
      <div className="flex flex-col h-screen bg-[#0a172b] text-white overflow-hidden w-full">
        <Header streams={streams} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <StreamView streamSettings={streamSettings} />
            <ControlBar channelId={channelData._id} streamerId={channelOwner} />
          </div>
          <SourcePanel
            onSettingsChange={handleSettingsChange}
            streamId={streamId}
          />
        </div>
        {/* Guest Request UI for Host */}
        {role === "host" && guestRequests.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 bg-zinc-800 p-4 w-96 rounded-lg border border-zinc-700">
            <h3 className="text-white font-bold mb-2">Guest Requests</h3>
            <AnimatePresence>
              {guestRequests.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2"
                >
                  {guestRequests.map((request: any) => (
                    <motion.div
                      key={request.socketId}
                      variants={itemVariants}
                      className="flex items-center justify-between bg-zinc-800 p-3 rounded-md border border-zinc-700 shadow-sm"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-gray-300"
                        >
                          {request.username[0].toUpperCase()}
                        </motion.span>
                        <span className="text-gray-300 font-medium">
                          {request.username}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApproveGuest(request)}
                          className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>Approve</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDenyGuest(request)}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                        >
                          <span>Deny</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LIVESTUDIO;
