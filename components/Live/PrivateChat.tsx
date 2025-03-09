import React, { useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

interface PrivateMessage {
  id: number;
  user: string;
  message: string;
  time: string;
}

interface PrivateChatProps {
  privateMessages: PrivateMessage[];
  sendPrivateMessage: (e: React.FormEvent) => void;
  newPrivateMessage: string;
  setNewPrivateMessage: (value: string) => void;
  showPrivateChat: boolean;
}

export const PrivateChat: React.FC<PrivateChatProps> = React.memo(
  ({
    privateMessages,
    sendPrivateMessage,
    newPrivateMessage,
    setNewPrivateMessage,
    showPrivateChat,
  }) => {
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) =>
        setNewPrivateMessage(e.target.value),
      [setNewPrivateMessage]
    );

    return (
      <AnimatePresence>
        {showPrivateChat && (
          <motion.div
            className="absolute bottom-16 left-4 w-64 bg-[#0a152c] border border-[#1a2641] p-2 rounded-md shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-white text-lg font-semibold mb-2">
              Private Chat
            </h3>
            <div className="bg-black p-2 rounded-md h-48 overflow-y-auto">
              {privateMessages.map((message) => (
                <div key={message.id} className="text-white mb-2">
                  <span className="font-bold">{message.user}:</span>{" "}
                  {message.message}{" "}
                  <span className="text-gray-400">({message.time})</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendPrivateMessage} className="flex gap-2 mt-2">
              <Input
                value={newPrivateMessage}
                onChange={handleInputChange}
                placeholder="Type a private message..."
                className="bg-[#1a2641] text-white border-[#1a2641]"
              />
              <Button type="submit" className="bg-[#ff4d00] text-white">
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
