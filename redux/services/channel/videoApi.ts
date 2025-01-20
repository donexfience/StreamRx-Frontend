import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllVideoUploadResponse,
  VideoData,
  VideoUploadRequest,
  VideoUploadResponse,
} from "./channel";
import build from "next/dist/build";
import { url } from "inspector";

export const httpVideoApi = createApi({
  reducerPath: "httpVideoApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    uploadVideo: builder.mutation<VideoUploadResponse, VideoUploadRequest>({
      query: ({ videourl, channelId, ...videoData }) => ({
        url: `/videoes/channel/${channelId}`,
        method: "POST",
        body: {
          videourl,
          ...videoData,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getAllVideos: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: `/videoes/all`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    getVideoByQuery: builder.query<AllVideoUploadResponse, { query: any }>({
      query: ({ query }) => {
        console.log(
          "Query parameter in RTK Query:",
          query,
          encodeURIComponent(query)
        );
        return {
          url: `/videoes/video`,
          method: "GET",
          params: { query: encodeURIComponent(query) },
        };
      },
    }),
    getVideoById: builder.query<VideoData, { id: any }>({
      query: ({ id }) => {
        console.log("Query parameter in RTK Query:", id);
        return {
          url: `/videoes/${id}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useGetAllVideosQuery,
  useGetVideoByQueryQuery,
  useGetVideoByIdQuery,
} = httpVideoApi;
