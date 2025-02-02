import { createApi } from "@reduxjs/toolkit/query/react";
import {
  AllVideoUploadResponse,
  SubscriptionResponse,
} from "../channel/channel";
import { baseQueryWithTokenHandling } from "./communityBaseQuery";

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
  }),
});

export const { useGetAllSubscribedChannelByUserIdQuery } = httpCommunityApi;
