import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { NextRouter } from "next/router";

interface HeaderProps {
  streamTitle: string;
  streamStatus: string;
  streamDate: string;
  role: "host" | "guest";
  isRecording: boolean;
  toggleRecording: () => void;
  saveLocally: boolean;
  setSaveLocally: (value: boolean) => void;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isLive: boolean;
  toggleLive: () => void;
  canGoLive: boolean;
  router: any;
}

export const Header: React.FC<HeaderProps> = ({
  streamTitle,
  streamStatus,
  streamDate,
  role,
  isRecording,
  toggleRecording,
  saveLocally,
  setSaveLocally,
  isCameraOn,
  isScreenSharing,
  isLive,
  toggleLive,
  canGoLive,
  router,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#0a152c] border-b border-[#1a2641] w-full">
      <motion.div
        initial={{ x: -20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center"
      >
        <Button
          onClick={() => router.replace("/dashboard/streamer/main")}
          variant="ghost"
          size="sm"
          className="text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {streamTitle} - {streamStatus}, {streamDate}
          {role === "host" && <Badge className="ml-2 bg-green-500">Host</Badge>}
        </Button>
      </motion.div>
      <motion.div
        initial={{ x: 20 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          className="text-white bg-[#3a1996] border-none hover:bg-[#4c22c0]"
        >
          GO PRO
        </Button>
        {role === "host" && (
          <div className="flex items-center gap-2 ml-4">
            <Switch
              id="recording"
              checked={isRecording}
              onCheckedChange={toggleRecording}
              disabled={!isCameraOn && !isScreenSharing}
            />
            <Label htmlFor="recording" className="text-white">
              Record
            </Label>
            <Switch
              id="save-locally"
              checked={saveLocally}
              onCheckedChange={setSaveLocally}
              disabled={isRecording}
            />
            <Label htmlFor="save-locally" className="text-white">
              {saveLocally ? "Save Locally" : "Save to Cloud"}
            </Label>
          </div>
        )}
        {role === "host" && (
          <Button
            variant="default"
            size="sm"
            className="bg-[#ff4d00] hover:bg-[#ff6b2c] text-white border-none"
            onClick={toggleLive}
            disabled={!isLive && !canGoLive}
          >
            {isLive ? "Stop Live" : "Go Live"}
          </Button>
        )}
      </motion.div>
    </div>
  );
};
