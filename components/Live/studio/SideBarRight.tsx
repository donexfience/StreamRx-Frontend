import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Music, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Caption {
  id: string;
  text: string;
  timestamp: Date;
}

interface SidebarRightProps {
  role: "host" | "guest";
  messages: { id: number; user: string; message: string; time: string }[];
  setMessages: (messages: any[]) => void;
  newMessage: string;
  setNewMessage: (value: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  musicUrl: string | null;
  setMusicUrl: (value: string | null) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (value: boolean) => void;
  handleMusicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playMusic: () => void;
  stopMusic: () => void;
  captions: Caption[];
  setCaptions: (captions: Caption[]) => void;
  newCaption: string;
  setNewCaption: (value: string) => void;
  addCaption: () => void;
  deleteCaption: (id: string) => void;
  channelId: string;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  role,
  messages,
  setMessages,
  newMessage,
  setNewMessage,
  sendMessage,
  musicUrl,
  setMusicUrl,
  isMusicPlaying,
  setIsMusicPlaying,
  handleMusicUpload,
  playMusic,
  stopMusic,
  captions,
  setCaptions,
  newCaption,
  setNewCaption,
  addCaption,
  deleteCaption,
  channelId,
}) => {
  return (
    <motion.div
      className="w-64 bg-[#0a152c] border-l border-[#1a2641] p-4 flex flex-col h-full"
      initial={{ width: 0 }}
      animate={{ width: 256 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-grow overflow-y-auto mb-4">
        <h3 className="text-white text-lg font-semibold mb-2">Chat</h3>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className="text-white text-sm">
              <span className="font-medium">{msg.user}:</span> {msg.message}{" "}
              <span className="text-gray-400 text-xs">({msg.time})</span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={sendMessage} className="flex gap-1 mb-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="bg-[#1a2641] text-white border-none"
        />
        <Button
          type="submit"
          size="sm"
          className="bg-[#ff4d00] hover:bg-[#e64500]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      {role === "host" && (
        <>
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2">Music</h3>
            <div className="flex gap-2 ">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-[#1a2641] hover:bg-[#1a2641]"
                asChild
              >
                <label>
                  <Music className="h-4 w-4 mr-2 text-black" />
                  Upload
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleMusicUpload}
                    className="hidden"
                  />
                </label>
              </Button>
              {musicUrl && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-black border-[#1a2641] hover:bg-[#1a2641]"
                    onClick={playMusic}
                    disabled={isMusicPlaying}
                  >
                    Play
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-[#1a2641] hover:bg-[#1a2641]"
                    onClick={stopMusic}
                    disabled={!isMusicPlaying}
                  >
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-2">Captions</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="flex justify-between items-center text-white text-sm"
                >
                  <span>{caption.text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => deleteCaption(caption.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <Input
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Add caption..."
                className="bg-[#1a2641] text-white border-none"
              />
              <Button
                size="sm"
                className="bg-[#ff4d00] hover:bg-[#e64500]"
                onClick={addCaption}
              >
                Add
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
