import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllPlaylistResponse,
  PlaylistRequest,
  PlaylistResponse,
  PlaylistUpdateData,
  SinglePlaylistResponse,
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
      { page: number; limit: number; channelId: string; filters: any }
    >({
      query: ({ page, limit, channelId, filters }) => ({
        url: `/playlist/${channelId}/all`,
        method: "GET",
        params: { page, limit, ...filters },
      }),
    }),
    getPlaylistByQuery: builder.query<
      PlaylistResponse,
      { query: any; channelId: string }
    >({
      query: ({ query, channelId }) => {
        console.log(
          "Query parameter in RTK Query:",
          query,
          encodeURIComponent(query)
        );
        return {
          url: `/playlist/playlist/${channelId}`,
          method: "GET",
          params: { query: encodeURIComponent(query) },
        };
      },
    }),
    getPlaylistsByIds: builder.query<any[], string[]>({
      query: (ids) => ({
        url: `/playlist/multiple`,
        method: "GET",
        params: { ids: ids.join(",") },
      }),
    }),

    editPlaylist: builder.mutation<PlaylistResponse, PlaylistUpdateData>({
      query: (updateData) => ({
        url: `/playlist/${updateData.playlistId}`,
        method: "PUT",
        body: updateData.updates,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    getSinglePlaylist: builder.query<SinglePlaylistResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/playlist/${id}`,
        method: "GET",
      }),
    }),
    createInitialPlaylist: builder.mutation({
      query: (initialData) => ({
        url: "playlist/initialPlaylist",
        method: "POST",
        body: initialData,
      }),
    }),

    deletePlaylist: builder.mutation({
      query: ({ playlistId }) => ({
        url: `/playlist/${playlistId}`,
        method: "DELETE",
      }),
    }),

    // Update playlist with videos
    updatePlaylistVideos: builder.mutation({
      query: ({ playlistId, videos }) => {
        const payload = { videos };
        console.log("Updating playlist videos with payload:", {
          playlistId,
          ...payload,
        });

        return {
          url: `/playlist/${playlistId}/videos`,
          method: "PATCH",
          body: payload,
        };
      },
    }),
  }),
});

export const {
  useCreatePlaylistMutation,
  useGetAllPlaylistsQuery,
  useGetSinglePlaylistQuery,
  useGetPlaylistByQueryQuery,
  useEditPlaylistMutation,
  useGetPlaylistsByIdsQuery,
  useCreateInitialPlaylistMutation,
  useDeletePlaylistMutation,
  useUpdatePlaylistVideosMutation,
} = httpPlaylistApi;
