import { UpdateUserInput, UserResponse } from "./user";
import { UserBaseQuery } from "./userBaseQuery";
import {
  createApi,
  fetchBaseQuery,
  RootState,
} from "@reduxjs/toolkit/query/react";

export const httpUserApi = createApi({
  reducerPath: "httpUserApi",
  baseQuery: UserBaseQuery,
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse, { email: string }>({
      query: ({ email }) => {
        console.log("Calling backend with email:", email);
        return {
          url: `users/getUser?email=${encodeURIComponent(email)}`,
          method: "GET",
          credentials: "include",
        };
      },
    }),

    updateUser: builder.mutation<
      UserResponse,
      { id: string; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
    }),

    deleteUser: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/user",
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } =
  httpUserApi;
