import { getAuthCookies, setAuthCookies } from "@/app/lib/action/auth";
import {
  fetchBaseQuery,
  createApi,
  BaseQueryFn,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

export const StreamingBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_STREAMING_URL,
  credentials: "include",
  prepareHeaders: async (headers) => {
    try {
      const { accessToken, refreshToken } = await getAuthCookies();
      if (accessToken) {
        headers.set("accessToken", accessToken);
      }
      if (refreshToken) {
        headers.set("refreshToken", refreshToken);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    } catch (error) {
      console.error("Error preparing headers:", error);
      return headers;
    }
  },
});

export const baseQueryWithTokenHandling: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  try {
    const result = await StreamingBaseQuery(args, api, extraOptions);

    if (result.meta?.response) {
      const response = result.meta.response;
      const accessToken = response.headers.get("accessToken");
      const refreshToken = response.headers.get("refreshToken");

      // If tokens exist, save them
      if (accessToken && refreshToken) {
        await setAuthCookies(accessToken, refreshToken);
      }
    }
    return result;
  } catch (error) {
    console.error("Token handling error:", error);
    return {
      error: { status: 500, data: "Failed to process authentication tokens" },
    };
  }
};
