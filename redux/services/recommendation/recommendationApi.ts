import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./recommendationBaseQuery";
import { AllVideoUploadResponse } from "../channel/channel";

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
  }),
});

export const {
  useGetVideoRecommendationQuery,
  useGetShortRecommendationQuery,
} = httpRecommendationApi;
