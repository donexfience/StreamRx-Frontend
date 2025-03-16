import { forwardRef } from "react";

interface ParticipantVideoProps {
  userId: string;
  stream: MediaStream;
}

export const ParticipantVideo = forwardRef<HTMLVideoElement, ParticipantVideoProps>(({ userId, stream }, ref) => {
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={false}
      className="w-full h-full object-cover"
      onLoadedMetadata={() => {
        if (ref && "current" in ref && ref.current) {
          ref.current.srcObject = stream;
          ref.current.play().catch((err) => console.error(`Error playing video for ${userId}:`, err));
        }
      }}
    />
  );
});