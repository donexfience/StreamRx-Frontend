import { Button } from "@/components/ui/button";
import { Plus, User, Monitor, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: "webcam" | "screen" | "media";
  mediaUrl?: string;
  channelId?: string;
}

interface Participant {
  userId: string;
  name: string;
}

interface SidebarLeftProps {
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  role: "host" | "guest";
  isMediaModalOpen: boolean;
  setIsMediaModalOpen: (value: boolean) => void;
  participants: Participant[];
  generateInviteLink: () => void;
  inviteLink: string | null;
  selectScene: (id: string) => void;
  channelId: string;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  scenes,
  setScenes,
  role,
  isMediaModalOpen,
  setIsMediaModalOpen,
  participants,
  generateInviteLink,
  inviteLink,
  selectScene,
  channelId,
}) => {
  return (
    <motion.div
      className={`bg-[#0a152c] border-r border-[#1a2641] p-2 ${
        isMediaModalOpen ? "w-[34%] h-auto" : "w-64 h-full"
      }`}
      initial={{ width: 0 }}
      animate={{ width: isMediaModalOpen ? "100%" : 256 }}
      transition={{ duration: 0.3 }}
    >
      {role === "host" && (
        <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-center mb-3 text-black border-[#1a2641] hover:bg-[#1a2641]"
              onClick={() => setIsMediaModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Media Scene
            </Button>
          </DialogTrigger>
        </Dialog>
      )}
      <div className="space-y-2 h-full">
        {scenes.map((scene) => (
          <motion.div
            key={scene.id}
            className={`p-2 rounded cursor-pointer ${
              scene.isActive
                ? "bg-[#1a2641] border-l-2 border-[#ff4d00]"
                : "hover:bg-[#1a2641]"
            }`}
            onClick={() => selectScene(scene.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-full h-12 bg-gradient-to-br from-[#e91e63] to-[#2196f3] rounded mb-1 flex justify-center items-center">
                {scene.type === "webcam" && (
                  <User className="h-5 w-5 text-white" />
                )}
                {scene.type === "screen" && (
                  <Monitor className="h-5 w-5 text-white" />
                )}
                {scene.type === "media" && scene.mediaUrl && (
                  <ImageIcon className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="text-xs text-white">{scene.name}</span>
            </div>
          </motion.div>
        ))}
        <div className="w-64 bg-[#0a152c] border-l border-[#1a2641] p-4 flex flex-col items-start">
          <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Participants
          </h3>
          <div className="w-full">
            {participants.map((p:any) => (
              <div
                key={p.userId}
                className="text-white mb-2 flex items-center p-2 rounded-lg hover:bg-[#1a2641] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {p.name}{" "}
                  <span className="text-sm text-gray-400">({p.role})</span>
                </span>
              </div>
            ))}
          </div>
          {role === "host" && (
            <Button
              onClick={generateInviteLink}
              className="mt-4 bg-[#ff4d00] text-white hover:bg-[#e64500] transition-colors flex items-center justify-center w-full py-2 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Invite Guest
            </Button>
          )}
          {inviteLink && role === "host" && (
            <div className="mt-4 text-white text-sm p-2 bg-[#1a2641] rounded-lg w-full">
              <span className="font-medium">Link:</span> {inviteLink}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
