import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllPlaylistResponse,
  PlaylistRequest,
  PlaylistResponse,
} from "./channel";

export const httpPlaylistApi = createApi({
  reducerPath: "httpPlaylistApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    createPlaylist: builder.mutation<PlaylistResponse, PlaylistRequest>({
      query: (playlist) => {
        console.log("Form data for creating playlist:", playlist);
        return {
          url: "/playlist",
          method: "POST",
          body: playlist,
        };
      },
    }),
    getAllPlaylists: builder.query<
      AllPlaylistResponse,
      { channelId: string; page: number; limit: number }
    >({
      query: ({ channelId, page, limit }) => ({
        url: `/playlist/${channelId}/all`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    getPlaylistByQuery: builder.query<PlaylistResponse, { query: any }>({
      query: ({ query }) => {
        console.log(
          "Query parameter in RTK Query:",
          query,
          encodeURIComponent(query)
        );
        return {
          url: `/playlist/playlist`,
          method: "GET",  
          params: { query: encodeURIComponent(query) },
        };
      },
    }),
  }),
});

export const {
  useCreatePlaylistMutation,
  useGetAllPlaylistsQuery,
  useGetPlaylistByQueryQuery,
  } = httpPlaylistApi;
