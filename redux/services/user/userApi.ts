import { GetALlUserResponse, UpdateUserInput, UserResponse } from "./user";
import { baseQueryWithTokenHandling, UserBaseQuery } from "./userBaseQuery";
import {
  createApi,
  fetchBaseQuery,
  RootState,
} from "@reduxjs/toolkit/query/react";

export const httpUserApi = createApi({
  reducerPath: "httpUserApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse, { email: string }>({
      query: ({ email }) => {
        console.log(
          email,
          "calling get single useraaaaaaaaaaaaaaaaaaaaa",
          email
        );
        return {
          url: `users/getUser?email=${encodeURIComponent(email)}`,
          method: "GET",
          credentials: "include",
        };
      },
    }),

    updateUser: builder.mutation<
      UserResponse,
      { email: string; data: UpdateUserInput }
    >({
      query: ({ email, data }) => {
        console.log("Calling updateUser with:", { email, data });
        return {
          url: `/users/updateUser/${email}`,
          method: "PUT",
          body: data,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),

    getAllUser: builder.query<GetALlUserResponse, void>({
      query: () => ({
        url: `users/getAllUsers`,
        method: "GET",
        credentials: "include",
      }),
    }),

    blockUnblockUser: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: `/users/BlockOrUnblock${id}`,
        method: "PUT",
      }),
    }),

    createStreamerRequest: builder.mutation({
      query: ({ data }) => ({
        url: `/users/streamerrequests`,
        method: "POST",
        body: data,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }),
    }),

    updateStreamerRequest: builder.mutation<
      {
        success: boolean;
        message: string;
        request: {
          status: string;
        };
      },
      { id: string; data: Record<string, any> }
    >({
      query: ({ id, data }) => ({
        url: `users/streamer-requests/${id}`,
        method: "PUT",
        body: data,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getAllStreamerRequests: builder.query<
      { success: boolean; message: string; requests: unknown[] },
      void
    >({
      query: () => ({
        url: `users/streamer-requests`,
        method: "GET",
      }),
    }),

    getStreamerRequestById: builder.query<
      { success: boolean; message: string; request: unknown },
      { id: string }
    >({
      query: ({ id }) => {
        console.log("Fetching the streamer request", id);
        return {
          url: `users/streamer-requests/${id}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useGetAllUserQuery,
  useBlockUnblockUserMutation,
  useGetAllStreamerRequestsQuery,
  useCreateStreamerRequestMutation,
  useGetStreamerRequestByIdQuery,
  useUpdateStreamerRequestMutation,
} = httpUserApi;
