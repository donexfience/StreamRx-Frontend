// ParticipantVideo.tsx
import React, { forwardRef, useEffect } from "react";

interface ParticipantVideoProps {
  userId: string;
  stream: MediaStream;
}
export const ParticipantVideo = forwardRef<
  HTMLVideoElement,
  ParticipantVideoProps
>(({ userId, stream }, ref) => {
  useEffect(() => {
    if (ref && "current" in ref && ref.current) {
      const video = ref.current;
      video.srcObject = stream;
      video.play().catch((err) => console.error("Error playing video:", err));
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
});
