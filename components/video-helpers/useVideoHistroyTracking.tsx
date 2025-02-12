import { useEffect, useRef } from 'react';
import { useAddToHistoryMutation } from "@/redux/services/channel/videoApi";

const useVideoHistoryTracking = (
  videoId: string,
  userId: string,
  videoRef: React.RefObject<HTMLVideoElement>
) => {
  const [addToHistory] = useAddToHistoryMutation();
  const watchStartTime = useRef<Date | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);

  const updateHistory = async (duration: number, completed: boolean) => {
    if (!userId || !videoId) return;

    try {
      await addToHistory({
        userId,
        videoData: {
          videoId,
          watchDuration: Math.floor(duration),
          completedWatching: completed,
          watchedAt: watchStartTime.current || new Date()
        }
      }).unwrap();
    } catch (error) {
      console.error('Failed to update watch history:', error);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (!watchStartTime.current) {
        watchStartTime.current = new Date();
      }

      //updates every 30 seconds
      updateInterval.current = setInterval(() => {
        const currentTime = video.currentTime;
        if (currentTime > lastUpdateTime.current) {
          updateHistory(currentTime, false);
          lastUpdateTime.current = currentTime;
        }
      }, 30000); 
    };

    const handlePause = () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      updateHistory(video.currentTime, false);
    };

    const handleEnded = () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      updateHistory(video.duration, true);
    };

    const handleTimeUpdate = () => {
      lastUpdateTime.current = video.currentTime;
    };

    // Event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      if (video) {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('timeupdate', handleTimeUpdate);

        // Final update when component unmounts
        if (lastUpdateTime.current > 0) {
          updateHistory(lastUpdateTime.current, false);
        }
      }
    };
  }, [videoId, userId]);
};

export default useVideoHistoryTracking;