import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllVideoUploadResponse,
  Comment,
  CommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
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
      query: ({ videourl, channelId, ...videoData }) => ({
        url: `/videoes/channel/${channelId}`,
        method: "POST",
        body: {
          videourl,
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
    getVideoByQuery: builder.query<AllVideoUploadResponse, { query: any }>({
      query: ({ query }) => {
        console.log(
          "Query parameter in RTK Query:",
          query,
          encodeURIComponent(query)
        );
        return {
          url: `/videoes/video`,
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
  }),
});

export const {
  useUploadVideoMutation,
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
} = httpVideoApi;
