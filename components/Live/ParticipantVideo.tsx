import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

interface ParticipantVideoProps {
  userId: string;
  stream: MediaStream;
}

export const ParticipantVideo = forwardRef<
  HTMLVideoElement,
  ParticipantVideoProps
>(({ userId, stream }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

  useEffect(() => {
    console.log(stream.getTracks(), "stream got in the pariticipantVideo");
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((error: Error) => console.error("Play error:", error));
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
});
