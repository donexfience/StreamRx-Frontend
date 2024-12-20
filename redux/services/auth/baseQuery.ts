import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../../store";

export const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
});
  