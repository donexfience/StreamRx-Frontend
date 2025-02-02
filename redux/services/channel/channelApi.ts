import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  ChannelCreationRequest,
  ChannelCreationResponse,
  getChannelResponse,
} from "./channel";

export const httpChannelApi = createApi({
  reducerPath: "httpChannelApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    createChannel: builder.mutation<
      ChannelCreationResponse,
      ChannelCreationRequest
    >({
      query: (channelData) => {
        console.log("Calling createChannel with:", channelData);
        return {
          url: "/channels",
          method: "POST",
          body: channelData,
        };
      },
    }),
    getChannelByEmail: builder.query<getChannelResponse, string>({
      query: (email) => {
        return {
          url: `/channels/${email}`,
          method: "GET",
        };
      },
    }),
    getChannelById: builder.query<getChannelResponse, string>({
      query: (id) => {
        return {
          url: `/channels/getchannel${id}`,
          method: "GET",
        };
      },
    }),
    getChannelByChannelId: builder.query<getChannelResponse, string>({
      query: (id) => {
        return {
          url: `/channels/channel/id/${id}`,
          method: "GET",
        };
      },
    }),

    editChannelById: builder.mutation<
      getChannelResponse,
      { channelId: string; channelData: any }
    >({
      query: ({ channelId, channelData }) => ({
        url: `/channels/${channelId}`,
        method: "PUT",
        body: channelData,
      }),
    }),

    subscribeToChannel: builder.mutation({
      query: ({ userId, channelId }) => ({
        url: "/channels/subscribe",
        method: "POST",
        body: { userId, channelId },
      }),
    }),
    unsubscribeFromChannel: builder.mutation({
      query: ({ userId, channelId }) => ({
        url: "/channels/unsubscribe",
        method: "POST",
        body: { userId, channelId },
      }),
    }),
    getSubscriptionStatus: builder.query({
      query: ({ userId, channelId }) =>
        `channels/subscribe/status?userId=${userId}&channelId=${channelId}`,
    }),

    getSubscriberCount: builder.query({
      query: (channelId) => `subscribe/count/${channelId}`,
    }),
  }),
});

export const {
  useCreateChannelMutation,
  useGetChannelByEmailQuery,
  useGetSubscriberCountQuery,
  useGetSubscriptionStatusQuery,
  useGetChannelByChannelIdQuery,
  useSubscribeToChannelMutation,
  useUnsubscribeFromChannelMutation,
  useGetChannelByIdQuery,
  useEditChannelByIdMutation,
} = httpChannelApi;
