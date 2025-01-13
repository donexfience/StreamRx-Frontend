import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import { ChannelCreationRequest, ChannelCreationResponse, getChannelResponse } from "./channel";

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
  }),
});

export const { useCreateChannelMutation, useGetChannelByEmailQuery } =
  httpChannelApi;
