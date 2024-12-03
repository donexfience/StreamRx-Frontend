import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    // const token = state.auth.tokens?.accessToken

    // if (token) {
    //   headers.set('Authorization', `Bearer ${token}`)
    // }

    // headers.set('Content-Type', 'application/json')
    // return headers
  },
});
