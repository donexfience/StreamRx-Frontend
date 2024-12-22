import { UpdateUserInput, UserResponse } from "./user";
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
