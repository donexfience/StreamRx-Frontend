import { useTrackInteractionMutation } from "@/redux/services/recommendation/recommendationApi";
import { useEffect, useRef, useState } from "react";

export function useOtherInteractionTracking(
  videoId: string,
  userId: string,
  interaction: "like" | "dislike" | "comment"
) {
  const [trackInteraction] = useTrackInteractionMutation();
  useEffect(() => {
    if (!userId || !videoId) return;

    const sendInteraction = async (type: "like" | "dislike" | "comment") => {
      const interactionData = {
        interactionType: type,
        duration: 0,
        timestamp: new Date(),
        watchedSegments: {},
        completionPercentage: 100,
        device: navigator.userAgent,
      };
      try {
        await trackInteraction({
          userId,
          videoId,
          interactionData,
        }).unwrap();
      } catch (error) {
        console.error("Failed to track interaction:", error);
      }
    };
    sendInteraction(interaction);
    return () => {};
  }, [videoId, userId, trackInteraction]);
}

export default useOtherInteractionTracking;
