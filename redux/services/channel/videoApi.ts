import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllVideoUploadResponse,
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
        console.log("Query parameter in RTK Query:", query,encodeURIComponent(query)); 
        return {
          url: `/videoes/video`,
          method: "GET",
          params: { query: encodeURIComponent(query) },
        };
      },
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useGetAllVideosQuery,
  useGetVideoByQueryQuery,
} = httpVideoApi;
