import { useState, useEffect, useCallback } from "react";

export const useMediaDevices = () => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const enumerateDevices = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to access media devices")
      );
      setIsLoading(false);
      console.error("Error enumerating devices:", err);
    }
  }, []);

  useEffect(() => {
    enumerateDevices();

    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [enumerateDevices]);

  const getDeviceStream = useCallback(
    async (deviceId: string, kind: "video" | "audio") => {
      try {
        const constraints = {
          [kind]: { deviceId: { exact: deviceId } },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error(`Failed to get ${kind} stream`)
        );
        console.error(`Error getting ${kind} stream:`, err);
        return null;
      }
    },
    []
  );

  return {
    videoDevices,
    audioDevices,
    isLoading,
    error,
    getDeviceStream,
  };
};
