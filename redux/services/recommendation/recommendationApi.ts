import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./recommendationBaseQuery";
import { AllVideoUploadResponse } from "../channel/channel";

interface WatchedSegment {
  start: number;
  end: number;
}
interface InteractionData {
  interactionType: "view" | "partial_view" | "like" | "dislike" | "comment";
  duration: number;
  timestamp: Date;
  watchedSegments: WatchedSegment[];
  completionPercentage: number;
  device: string;
  toggle?: boolean;
}

interface InteractionResponse {
  _id: string;
  userId: string;
  videoId: string;
  interactionType: string;
  completionPercentage: number;
  duration: number;
  watchedSegments: WatchedSegment[];
  timestamp: Date;
  device: string;
}

export const httpRecommendationApi = createApi({
  reducerPath: "httpRecommendationApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getVideoRecommendation: builder.query<AllVideoUploadResponse, string>({
      query: (userId) => {
        return {
          url: `/recommendation/recommendations/${userId}`,
          method: "GET",
        };
      },
    }),
    getShortRecommendation: builder.query<AllVideoUploadResponse, string>({
      query: (email) => {
        return {
          url: `/recommendation/recommendations/shorts/${email}`,
          method: "GET",
        };
      },
    }),
    trackInteraction: builder.mutation<
      any,
      {
        userId: string;
        videoId: string;
        interactionData: InteractionData;
      }
    >({
      query: ({ userId, videoId, interactionData }) => ({
        url: `/recommendation/interaction/${userId}/${videoId}`,
        method: "POST",
        body: interactionData,
      }),
    }),
  }),
});

export const {
  useGetVideoRecommendationQuery,
  useGetShortRecommendationQuery,
  useTrackInteractionMutation,
} = httpRecommendationApi;
