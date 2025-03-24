import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./streamingBaseQuery";
import { string } from "zod";

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
  createdBy: string;
}

interface EditStreamRequest {
  id: string;
  updateData: Partial<Stream>;
}

interface MessageResponse {
  message: string;
}

export const httpStreamingApi = createApi({
  reducerPath: "httpStreamingApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    // Existing streaming endpoints
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
    getStreamers: builder.query<
      any,
      {
        userId: string;
        page?: number;
        limit?: number;
        search?: string;
        startDate: any;
        endDate: any;
      }
    >({
      query: ({ userId, page = 1, limit = 10, search }) => ({
        url: `api/friends/users/${userId}/streamers`,
        method: "GET",
        params: { page, limit, search },
      }),
    }),
    sendFriendRequest: builder.mutation<
      MessageResponse,
      { userId: string; friendId: string }
    >({
      query: ({ userId, friendId }) => {
        console.log("Sending friend request to:", friendId);

        return {
          url: `/api/friends/users/${userId}/friend-request`,
          method: "POST",
          body: { friendId },
        };
      },
    }),

    getFrinedOfStreamer: builder.mutation<any, { userId: string }>({
      query: ({ userId }) => ({
        url: `/api/friends/user/${userId}/GetFriends`,
        method: "GET",
      }),
    }),
    acceptFriendRequest: builder.mutation<
      MessageResponse,
      { userId: string; friendId: string }
    >({
      query: ({ userId, friendId }) => ({
        url: `/api/friends/users/${userId}/accept-friend`,
        method: "POST",
        body: { friendId },
      }),
    }),

    blockFriend: builder.mutation<
      MessageResponse,
      { userId: string; friendId: string }
    >({
      query: ({ userId, friendId }) => ({
        url: `/api/friends/users/${userId}/block`,
        method: "POST",
        body: { friendId },
      }),
    }),
  }),
});

export const {
  useCreateStreamMutation,
  useGetStreamQuery,
  useGetChannelStreamsQuery,
  useEditStreamMutation,
  useGetStreamersQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useGetFrinedOfStreamerMutation,
  useBlockFriendMutation,
} = httpStreamingApi;
