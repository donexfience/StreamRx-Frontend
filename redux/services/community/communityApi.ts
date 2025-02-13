import { createApi } from "@reduxjs/toolkit/query/react";
import {
  AllVideoUploadResponse,
  SubscriptionResponse,
} from "../channel/channel";
import { baseQueryWithTokenHandling } from "./communityBaseQuery";

interface ChatMessage {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    username: string;
    profileImage: string;
  };
  channelId: string;
  createdAt: string;
  fileUrl?: string;
  messageType: "text" | "image";
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  replies: Array<ChatMessage>;
  replyTo?: {
    _id: string;
    content: string;
    senderId: {
      name: string;
    };
  };
  isEdited: boolean;
}

interface GetMessagesResponse {
  status: string;
  data: {
    messages: ChatMessage[];
    page: number;
    limit: number;
  };
}

export const httpCommunityApi = createApi({
  reducerPath: "httpCommunityApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getAllSubscribedChannelByUserId: builder.query<
      SubscriptionResponse,
      { userId: string }
    >({
      query: ({ userId }) => {
        console.log(userId, "user id got");
        return {
          url: `/subscription/subscriptions/${userId}`,
          method: "GET",
        };
      },
    }),
    getAllSubscribersByChannelId: builder.query({
      query: ({ channelId }) => {
        console.log(channelId, "channelId id got");
        return {
          url: `/subscription/subscriptions/allsub/${channelId}`,
          method: "GET",
        };
      },
    }),

    getChannelMessages: builder.query<
      GetMessagesResponse,
      { channelId: string; page?: number; limit?: number }
    >({
      query: ({ channelId, page = 1, limit = 50 }) => ({
        url: `community/channel/${channelId}/messages`,
        method: "GET",
        params: { page, limit },
      }),
    }),
  }),
});

export const {
  useGetAllSubscribedChannelByUserIdQuery,
  useGetAllSubscribersByChannelIdQuery,
  useGetChannelMessagesQuery,
} = httpCommunityApi;
