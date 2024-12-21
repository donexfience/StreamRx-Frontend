import { getAuthCookies } from "@/app/lib/action/auth";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const UserBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
  credentials: "include",
  prepareHeaders: async (headers, { getState }) => {
    const { accessToken, refreshToken } = await getAuthCookies();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    if (refreshToken) {
      headers.set("Refresh-Token", refreshToken);
    }

    return headers;
  },
});
