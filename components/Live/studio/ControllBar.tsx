import React, { useState, useEffect } from "react";
import {
  Mic,
  Video,
  MonitorSmartphone,
  Users,
  Plus,
  Settings,
  UserCircle2,
  VideoOff,
  MicOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/hooks/useSocket";
import { useGetFrinedOfStreamerMutation } from "@/redux/services/streaming/streamingApi";
import toast from "react-hot-toast";

interface ControlBarProps {
  channelId?: string;
  streamerId: string;

}

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status?: "online" | "offline" | "busy";
}

const ControlBar = ({ channelId, streamerId }: ControlBarProps) => {
  const { streamingSocket } = useSocket();
  const [showFriends, setShowFriends] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [getFriends, { data: friends, isLoading }] =
    useGetFrinedOfStreamerMutation();

  console.log(friends?.user, "friends got in the controllbar for debug");

  useEffect(() => {
    if (showFriends) {
      getFriends({ userId: streamerId });
    }
  }, [showFriends, getFriends, streamerId]);

  const handleInvite = (friendId: string) => {
    if (!channelId) {
      console.error("Channel ID is not provided.");
      return;
    }
    if (!streamingSocket) {
      return;
    }
    streamingSocket.emit("generateInvite", {
      channelId,
      userId: friendId,
    });
  };

  useEffect(() => {
    console.log(streamingSocket, "socekt of stream");
    if (streamingSocket) {
      streamingSocket.on("inviteLink", ({ link }: { link: string }) => {
        console.log("Received inviteLink:", link);
        setInviteLink(link);
        navigator.clipboard.writeText(link);
        toast.success(`Invite link copied to clipboard: ${link}`);
      });

      streamingSocket.on("error", (error: any) => {
        console.error("Socket error:", error);
      });
      return () => {
        streamingSocket.off("inviteLink");
        streamingSocket.off("error");
      };
    }
  }, [streamingSocket]);

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="h-20 flex items-center justify-center gap-3 mb-2 relative">
      {/* Control Buttons */}
      <div className="bg-[#192b4e] rounded-full p-2 flex items-center gap-3">
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center`}
        >
          <Mic size={20} />
        </button>
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center`}
        >
          <Video size={20} />
        </button>
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center`}
        >
          <MonitorSmartphone size={20} />
        </button>
        <button
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
            showFriends ? "bg-blue-600" : "bg-[#243860] hover:bg-[#2f4a7a]"
          }`}
          onClick={() => setShowFriends(!showFriends)}
        >
          <Users size={20} />
        </button>
        <button className="w-11 h-11 rounded-full flex items-center justify-center bg-[#243860] hover:bg-[#2f4a7a] transition-colors">
          <Plus size={20} />
        </button>
        <button className="w-11 h-11 rounded-full flex items-center justify-center bg-[#243860] hover:bg-[#2f4a7a] transition-colors">
          <Settings size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showFriends && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-[#192b4e] p-4 rounded-lg shadow-lg w-72 z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-3 text-white flex items-center">
                <Users size={18} className="mr-2" />
                Invite a Friend
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : friends && friends.user && friends.user.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto pr-1">
                  {friends.user.map((friend: Friend, index: number) => (
                    <motion.li
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={friend.id}
                      className="flex items-center justify-between p-2 mb-2 rounded-lg hover:bg-[#243860] transition-colors"
                    >
                      <div className="flex items-center">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center ${getAvatarColor(
                              friend.id
                            )}`}
                          >
                            <span className="text-white text-xs font-bold">
                              {friend.username?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <span className="text-white text-sm truncate max-w-24">
                          {friend.username || "Unnamed Friend"}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        onClick={() => handleInvite(friend.id)}
                      >
                        Invite
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white text-center py-4 flex flex-col items-center"
                >
                  <UserCircle2 size={40} className="mb-2 text-gray-400" />
                  <p>No friends found.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ControlBar;
