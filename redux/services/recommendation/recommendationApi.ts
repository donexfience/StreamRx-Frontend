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
  }),
});

export const { useGetVideoRecommendationQuery } = httpRecommendationApi;
