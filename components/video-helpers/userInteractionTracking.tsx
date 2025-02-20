import { useTrackInteractionMutation } from "@/redux/services/recommendation/recommendationApi";
import { useEffect, useRef, useState } from "react";

type InteractionType = "view" | "partial_view" | "like" | "dislike" | "comment";

interface WatchedSegment {
  start: number;
  end: number;
}

export function useVideoInteractionTracking(
  videoId: string,
  userId: string,
  videoRef: React.RefObject<HTMLVideoElement>
) {
  const [trackInteraction] = useTrackInteractionMutation();
  const watchedSegments = useRef<WatchedSegment[]>([]);
  const lastUpdateTime = useRef<number>(0);
  const isWatching = useRef<boolean>(false);
  const currentSegment = useRef<WatchedSegment | null>(null);
  const hasSentView = useRef<boolean>(false);
  const lastInteractionType = useRef<InteractionType | null>(null);

  const getCompletionPercentage = (): number => {
    const totalWatchedTime = watchedSegments.current.reduce(
      (total, segment) => total + (segment.end - segment.start),
      0
    );

    const percentage = videoRef.current?.duration
      ? (totalWatchedTime / videoRef.current.duration) * 100
      : 0;

    // Cap at 100% to match backend validation
    return Math.min(percentage, 100);
  };

  const sendInteraction = async (
    type: InteractionType,
    additionalData?: any
  ) => {
    // Don't send duplicate partial views
    if (
      type === "partial_view" &&
      lastInteractionType.current === "partial_view"
    ) {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime.current;
      if (timeSinceLastUpdate < 9000) {
        // Less than 9 seconds
        return;
      }
    }

    const completion = getCompletionPercentage();

    // Only send view if completion is significant (>30%)
    if (type === "view" && completion <= 30) {
      type = "partial_view";
    }

    const interactionData = {
      interactionType: type,
      duration: videoRef.current?.duration || 0,
      timestamp: new Date(),
      watchedSegments: watchedSegments.current,
      completionPercentage: completion,
      device: navigator.userAgent,
      ...additionalData,
    };

    try {
      await trackInteraction({
        userId,
        videoId,
        interactionData,
      }).unwrap();

      lastInteractionType.current = type;
      if (type !== "partial_view") {
        lastUpdateTime.current = Date.now();
      }
    } catch (error) {
      console.error("Failed to track interaction:", error);
    }
  };

  const trackLike = async () => {
    // If user previously disliked, send toggle info
    if (lastInteractionType.current === "dislike") {
      await sendInteraction("like", { toggle: true });
    } else {
      await sendInteraction("like");
    }
  };

  const trackDislike = async () => {
    // If user previously liked, send toggle info
    if (lastInteractionType.current === "like") {
      await sendInteraction("dislike", { toggle: true });
    } else {
      await sendInteraction("dislike");
    }
  };

  const trackComment = async () => {
    await sendInteraction("comment");
  };

  useEffect(() => {
    if (!videoRef.current || !userId || !videoId) return;

    const video = videoRef.current;
    let startTime = 0;

    const handlePlay = () => {
      isWatching.current = true;
      startTime = video.currentTime;
      currentSegment.current = { start: startTime, end: startTime };
    };

    const handlePause = () => {
      isWatching.current = false;
      if (currentSegment.current) {
        currentSegment.current.end = video.currentTime;
        watchedSegments.current.push(currentSegment.current);
        currentSegment.current = null;
      }

      // Only send partial_view if we haven't sent a full view
      if (!hasSentView.current) {
        sendInteraction("partial_view");
      }
    };

    const handleTimeUpdate = () => {
      if (!isWatching.current || !currentSegment.current) return;

      currentSegment.current.end = video.currentTime;

      // Send partial_view every 10 seconds if we haven't sent a full view
      if (
        !hasSentView.current &&
        video.currentTime - lastUpdateTime.current >= 10
      ) {
        sendInteraction("partial_view");
        lastUpdateTime.current = video.currentTime;
      }
    };

    const handleEnded = () => {
      isWatching.current = false;
      if (currentSegment.current) {
        currentSegment.current.end = video.duration;
        watchedSegments.current.push(currentSegment.current);
        currentSegment.current = null;
      }

      const completion = getCompletionPercentage();
      if (!hasSentView.current && completion > 30) {
        sendInteraction("view");
        hasSentView.current = true;
      } else if (!hasSentView.current) {
        sendInteraction("partial_view");
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);

      // Send final partial_view if still watching
      if (isWatching.current && !hasSentView.current) {
        sendInteraction("partial_view");
      }
    };
  }, [videoId, userId, trackInteraction]);

  return {
    trackLike,
    trackDislike,
    trackComment,
  };
}

export default useVideoInteractionTracking;
