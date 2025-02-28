import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./streamingBaseQuery";

interface StreamsResponse {
  data: Stream[];
}

interface Stream {
  id: string;
  title: string;
  description?: string;
  broadcastType: string;
  category: string;
  visibility: string;
  thumbnail?: string;
  fallbackVideo?: { [key: string]: { url: string; s3Key: string } };
  schedule: {
    dateTime: Date;
  };
  playlistId?: string;
  liveChat: {
    enabled: boolean;
    replay: boolean;
    participantMode: string;
    reactions: boolean;
    slowMode: boolean;
    slowModeDelay: string;
  };
  channel: {
    id: string;
  };
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  status: any;
}

interface EditStreamRequest {
  id: string;
  updateData: Partial<Stream>;
}

export const httpStreamingApi = createApi({
  reducerPath: "httpStreamingApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    createStream: builder.mutation<Stream, any>({
      query: (streamData) => ({
        url: "/api/streamer/",
        method: "POST",
        body: streamData,
      }),
    }),
    getStream: builder.query<Stream, string>({
      query: (id) => ({
        url: `/streaming/api/streamer/${id}`,
        method: "GET",
      }),
    }),
    getChannelStreams: builder.query<any, string>({
      query: (channelId) => ({
        url: `/api/streamer/channel/${channelId}`,
        method: "GET",
      }),
    }),
    editStream: builder.mutation<Stream, EditStreamRequest>({
      query: ({ id, updateData }) => ({
        url: `/api/streamer/${id}`,
        method: "PUT",
        body: { updateData },
      }),
    }),
  }),
});

export const {
  useCreateStreamMutation,
  useGetStreamQuery,
  useGetChannelStreamsQuery,
  useEditStreamMutation,
} = httpStreamingApi;
