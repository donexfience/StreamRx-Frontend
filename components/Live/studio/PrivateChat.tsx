import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface PrivateChatProps {
  showPrivateChat: boolean;
  setShowPrivateChat: (value: boolean) => void;
  privateMessages: { id: number; user: string; message: string; time: string }[];
  newPrivateMessage: string;
  setNewPrivateMessage: (value: string) => void;
  sendPrivateMessage: (e: React.FormEvent, targetUserId?: string) => void;
  participants: { userId: string; name: string }[];
  localUserId: string | null;
  role: "host" | "guest";
}

export const PrivateChat: React.FC<PrivateChatProps> = ({
  showPrivateChat,
  setShowPrivateChat,
  privateMessages,
  newPrivateMessage,
  setNewPrivateMessage,
  sendPrivateMessage,
  participants,
  localUserId,
  role,
}) => {
  const targetUserId = role === "host" 
    ? participants.find(p => p.userId !== localUserId)?.userId 
    : participants.find(p => p.userId !== localUserId)?.userId; 

  return (
    <motion.div
      className="absolute bottom-16 right-4 w-72 h-96 bg-[#1a2641] rounded-md p-2 flex flex-col z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: showPrivateChat ? 1 : 0, y: showPrivateChat ? 0 : 20 }}
      exit={{ opacity: 0, y: 20 }}
      style={{ display: showPrivateChat ? "flex" : "none" }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-semibold">Private Chat</span>
        <Button variant="ghost" size="sm" className="text-white" onClick={() => setShowPrivateChat(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto mb-2">
        {privateMessages.map((msg) => (
          <div key={msg.id} className="text-white text-sm mb-1">
            <span className="font-medium">{msg.user}:</span> {msg.message} 
            <span className="text-gray-400 text-xs"> ({msg.time})</span>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => sendPrivateMessage(e, targetUserId)} className="flex gap-1">
        <Input
          type="text"
          value={newPrivateMessage}
          onChange={(e) => setNewPrivateMessage(e.target.value)}
          className="flex-grow bg-[#2a3551] text-white rounded p-1"
          placeholder="Type a message..."
        />
        <Button type="submit" size="sm" className="bg-[#ff4d00] text-white hover:bg-[#e64500]">
          Send
        </Button>
      </form>
    </motion.div>
  );
};