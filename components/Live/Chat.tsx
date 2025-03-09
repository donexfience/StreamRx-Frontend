import React, { useCallback } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Message {
  id: number;
  user: string;
  message: string;
  time: string;
}

interface ChatProps {
  messages: Message[];
  sendMessage: (e: React.FormEvent) => void;
  newMessage: string;
  setNewMessage: (value: string) => void;
}

export const Chat: React.FC<ChatProps> = React.memo(
  ({ messages, sendMessage, newMessage, setNewMessage }) => {
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value),
      [setNewMessage]
    );

    return (
      <div className="space-y-2">
        <h3 className="text-white text-lg font-semibold">Chat</h3>
        <div className="bg-black p-2 rounded-md h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="text-white mb-2">
              <span className="font-bold">{message.user}:</span>{" "}
              {message.message}{" "}
              <span className="text-gray-400">({message.time})</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="bg-[#1a2641] text-white border-[#1a2641]"
          />
          <Button type="submit" className="bg-[#ff4d00] text-white">
            Send
          </Button>
        </form>
      </div>
    );
  }
);
