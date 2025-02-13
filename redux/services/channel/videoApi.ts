import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllVideoUploadResponse,
  Comment,
  CommentResponse,
  CreateCommentRequest,
  CreatePlaylistUserRequest,
  UpdateCommentRequest,
  UserPlaylist,
  VideoData,
  VideoUploadRequest,
  VideoUploadResponse,
} from "./channel";
import build from "next/dist/build";
import { url } from "inspector";

export const httpVideoApi = createApi({
  reducerPath: "httpVideoApi",
  baseQuery: baseQueryWithTokenHandling,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    uploadVideo: builder.mutation<VideoUploadResponse, VideoUploadRequest>({
      query: ({ channelId, ...videoData }) => ({
        url: `/videoes/channel/${channelId}`,
        method: "POST",
        body: {
          ...videoData,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getAllVideos: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number; channelId: string }
    >({
      query: ({ page, limit, channelId }) => ({
        url: `/videoes/${channelId}/all`,
        method: "GET",
        params: { page, limit },
      }),
    }),
    getVideoByQuery: builder.query<
      AllVideoUploadResponse,
      { query: any; channelId: string }
    >({
      query: ({ query, channelId }) => {
        console.log(
          "Query parameter in RTK Query:",
          query,
          encodeURIComponent(query)
        );
        return {
          url: `/videoes/video/${channelId}`,
          method: "GET",
          params: { query: encodeURIComponent(query) },
        };
      },
    }),
    getVideoById: builder.query<VideoData, { id: any }>({
      query: ({ id }) => {
        console.log("Query parameter in RTK Query:", id);
        return {
          url: `/videoes/${id}`,
          method: "GET",
        };
      },
    }),

    getVideoesBychannelId: builder.query<VideoData, { id: any }>({
      query: ({ id }) => {
        console.log("Query parameter in RTK Query:", id);
        return {
          url: `/videoes/channel/${id}`,
          method: "GET",
        };
      },
    }),

    updateVideoPlaylist: builder.mutation({
      query: ({ videoId, playlistId }) => ({
        url: `/videos/${videoId}/playlist`,
        method: "PATCH",
        body: { playlistId },
      }),
    }),

    bulkUpdateVideosPlaylist: builder.mutation<
      VideoData[],
      { videoIds: string[]; playlistId: string }
    >({
      query: ({ videoIds, playlistId }) => ({
        url: `/videoes/bulkupdate`,
        method: "PATCH",
        body: { videoIds, playlistId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (response: { success: boolean; data: VideoData[] }) =>
        response.data,
    }),

    deleteVideo: builder.mutation({
      query: ({ videoId }) => ({
        url: `/videoes/${videoId}`,
        method: "DELETE",
      }),
    }),

    createComment: builder.mutation<Comment, CreateCommentRequest>({
      query: ({ videoId, text, parentId, userId }) => ({
        url: `comments/video/${videoId}`,
        method: "POST",
        body: { text, parentId, userId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    toggleCommentLike: builder.mutation<
      Comment,
      { commentId: string; userId: string }
    >({
      query: ({ commentId, userId }) => ({
        url: `comments/${commentId}/like`,
        method: "POST",
        body: { userId },
      }),
    }),

    toggleCommentDislike: builder.mutation<
      Comment,
      { commentId: string; userId: string }
    >({
      query: ({ commentId, userId }) => ({
        url: `comments/${commentId}/dislike`,
        method: "POST",
        body: { userId },
      }),
    }),

    getCommentInteraction: builder.query<
      { liked: boolean; disliked: boolean },
      { commentId: string; userId: string }
    >({
      query: ({ commentId, userId }) =>
        `comments/${commentId}/interaction?userId=${userId}`,
    }),

    getVideoComments: builder.query<Comment[], { videoId: string }>({
      query: ({ videoId }) => ({
        url: `comments/comment/${videoId}`,
        method: "GET",
      }),
      transformResponse: (response: CommentResponse) => response.data,
    }),

    getReplies: builder.query<Comment[], { commentId: string }>({
      query: ({ commentId }) => {
        console.log("comment id got for replay", commentId);
        return {
          url: `comments/replies/${commentId}`,
          method: "GET",
        };
      },
      transformResponse: (response: CommentResponse) => response.data,
    }),

    updateComment: builder.mutation<Comment, UpdateCommentRequest>({
      query: ({ commentId, text }) => ({
        url: `comments/${commentId}`,
        method: "PUT",
        body: { text },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    deleteComment: builder.mutation<void, { commentId: string }>({
      query: ({ commentId }) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
      }),
    }),
    toggleLike: builder.mutation<
      { liked: boolean },
      { videoId: string; userId: string }
    >({
      query: ({ videoId, userId }) => ({
        url: `/videoes/${videoId}/like`,
        method: "POST",
        body: {
          userId,
        },
      }),
    }),

    toggleDisLike: builder.mutation<
      { disliked: boolean },
      { videoId: string; userId: string }
    >({
      query: ({ videoId, userId }) => ({
        url: `/videoes/${videoId}/dislike`,
        method: "POST",
        body: {
          userId,
        },
      }),
    }),

    getInteractionStatus: builder.query<
      { liked: boolean; disliked: boolean },
      { videoId: string; userId: string }
    >({
      query: ({ videoId, userId }) => ({
        url: `videoes/${videoId}/interaction-status`,
        body: {
          userId,
        },
        method: "GET",
      }),
    }),
    editVideo: builder.mutation<
      VideoData,
      { videoId: string; updateData: Partial<VideoData> }
    >({
      query: ({ videoId, updateData }) => ({
        url: `/videoes/${videoId}`,
        method: "PUT",
        body: updateData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    addToHistory: builder.mutation({
      query: ({ userId, videoData }) => ({
        url: `videocollection/history/${userId}`,
        method: "POST",
        body: videoData,
      }),
    }),
    getHistory: builder.query({
      query: ({ userId, page = 1, limit = 10, searchQuery = "" }) => ({
        url: `videocollection/history/${userId}`,
        method: "GET",
        params: { page, limit, search: searchQuery },
      }),
    }),
    removeFromHistory: builder.mutation({
      query: ({ userId, videoId }) => ({
        url: `videocollection/history/${userId}/${videoId}`,
        method: "DELETE",
      }),
    }),

    addToWatchLater: builder.mutation({
      query: ({ userId, videoId }) => ({
        url: `videocollection/watch-later/${userId}`,
        method: "POST",
        body: { videoId },
      }),
    }),
    getWatchLater: builder.query({
      query: ({ userId, page = 1, limit = 10, searchQuery = "" }) => ({
        url: `videocollection/watch-later/${userId}`,
        method: "GET",
        params: { page, limit, search: searchQuery },
      }),
    }),
    removeFromWatchLater: builder.mutation({
      query: ({ userId, videoId }) => ({
        url: `videocollection/watch-later/${userId}/${videoId}`,
        method: "DELETE",
      }),
    }),

    createUserPlaylist: builder.mutation<
      UserPlaylist,
      CreatePlaylistUserRequest
    >({
      query: ({ userId, ...playlistData }) => ({
        url: `/user-playlist/${userId}`,
        method: "POST",
        body: playlistData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getUserPlaylists: builder.query<UserPlaylist[], { userId: string }>({
      query: ({ userId }) => ({
        url: `user-playlist/user/${userId}`,
        method: "GET",
      }),
    }),

    getUserPlaylistById: builder.query<UserPlaylist, { playlistId: string }>({
      query: ({ playlistId }) => ({
        url: `user-playlist/${playlistId}`,
        method: "GET",
      }),
    }),

    addUserVideoToPlaylist: builder.mutation<
      UserPlaylist,
      { playlistId: string; videoId: string }
    >({
      query: ({ playlistId, videoId }) => ({
        url: `user-playlist/${playlistId}/videos`,
        method: "POST",
        body: { videoId },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    removeUserVideoFromPlaylist: builder.mutation<
      UserPlaylist,
      { playlistId: string; videoId: string }
    >({
      query: ({ playlistId, videoId }) => ({
        url: `user-playlist/${playlistId}/videos/${videoId}`,
        method: "DELETE",
      }),
    }),

    deleteUserPlaylist: builder.mutation<void, { playlistId: string }>({
      query: ({ playlistId }) => ({
        url: `user-playlist/${playlistId}`,
        method: "DELETE",
      }),
    }),
    getRelatedVideos: builder.query<
      {
        playlistVideos: VideoData[];
        relatedVideos: VideoData[];
        currentPlaylist?: {
          _id: string;
          name: string;
          thumbnailUrl: string;
        };
      },
      { videoId: string }
    >({
      query: ({ videoId }) => ({
        url: `videoes/videos/${videoId}/related`,
        method: "GET",
      }),
      transformResponse: (response: {
        success: boolean;
        data: {
          playlistVideos: VideoData[];
          relatedVideos: VideoData[];
          currentPlaylist?: {
            _id: string;
            name: string;
            thumbnailUrl: string;
          };
        };
      }) => response.data,
    }),
  }),
});

export const {
  useUploadVideoMutation,
  useGetUserPlaylistByIdQuery,
  useGetUserPlaylistsQuery,
  useCreateCommentMutation,
  useEditVideoMutation,
  useDeleteCommentMutation,
  useGetRepliesQuery,
  useGetVideoCommentsQuery,
  useDeleteVideoMutation,
  useUpdateCommentMutation,
  useBulkUpdateVideosPlaylistMutation,
  useUpdateVideoPlaylistMutation,
  useGetAllVideosQuery,
  useGetVideoByQueryQuery,
  useGetVideoByIdQuery,
  useGetVideoesBychannelIdQuery,
  useGetInteractionStatusQuery,
  useToggleDisLikeMutation,
  useToggleLikeMutation,
  useGetCommentInteractionQuery,
  useToggleCommentDislikeMutation,
  useToggleCommentLikeMutation,
  useAddToHistoryMutation,
  useAddToWatchLaterMutation,
  useGetHistoryQuery,
  useGetWatchLaterQuery,
  useRemoveFromWatchLaterMutation,
  useAddUserVideoToPlaylistMutation,
  useCreateUserPlaylistMutation,
  useDeleteUserPlaylistMutation,
  useRemoveUserVideoFromPlaylistMutation,
  useRemoveFromHistoryMutation,
  useGetRelatedVideosQuery,
} = httpVideoApi;
