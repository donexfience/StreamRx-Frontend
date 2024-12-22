import { getAuthCookies, setAuthCookies } from "@/app/lib/action/auth";
import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

export const UserBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
  credentials: "include",
  prepareHeaders: async (headers, { getState }) => {
    const { accessToken, refreshToken } = await getAuthCookies();
    if (accessToken) {
      headers.set("access-token", accessToken);
    }
    if (refreshToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
      headers.set("refresh-token", refreshToken);
    }

    return headers;
  },
});

export const  baseQueryWithTokenHandling = async (
  args: any,
  api: any,
  extraOptions: any
) => {
  const result = await UserBaseQuery(args, api, extraOptions);

  if (result.meta?.response) {
    const accessToken = result.meta.response.headers.get("access-Token");
    const refreshToken = result.meta.response.headers.get("refresh-token");
    console.log("hello ssss");

    if (accessToken && refreshToken) {
      console.log("access and refresh", accessToken, refreshToken);
      setAuthCookies(accessToken, refreshToken);
    }
  }
  return result;
};
