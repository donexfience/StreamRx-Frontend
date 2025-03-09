import React, { useCallback } from "react";
import { Play, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface MusicControlProps {
  musicUrl: string | null;
  isMusicPlaying: boolean;
  handleMusicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playMusic: () => void;
  stopMusic: () => void;
}

export const MusicControl: React.FC<MusicControlProps> = React.memo(
  ({ musicUrl, isMusicPlaying, handleMusicUpload, playMusic, stopMusic }) => {
    const onPlayMusic = useCallback(() => playMusic(), [playMusic]);
    const onStopMusic = useCallback(() => stopMusic(), [stopMusic]);

    return (
      <div className="space-y-2">
        <h3 className="text-white text-lg font-semibold">Music</h3>
        <Input
          type="file"
          accept="audio/*"
          onChange={handleMusicUpload}
          className="bg-[#1a2641] text-white border-[#1a2641]"
        />
        <Button
          onClick={onPlayMusic}
          className="w-full bg-[#3a1996] text-white hover:bg-[#4c22c0]"
          disabled={isMusicPlaying || !musicUrl}
        >
          <Play className="h-4 w-4 mr-2" /> Play Music
        </Button>
        <Button
          onClick={onStopMusic}
          className="w-full bg-[#ff4d00] text-white hover:bg-[#ff6b2c]"
          disabled={!isMusicPlaying}
        >
          <X className="h-4 w-4 mr-2" /> Stop Music
        </Button>
      </div>
    );
  }
);
