import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./channelBaseQuery";
import {
  AllVideoUploadResponse,
  Comment,
  CommentResponse,
  CreateCommentRequest,
  CreatePlaylistUserRequest,
  LikeDislikeResponse,
  UpdateCommentRequest,
  UserPlaylist,
  VideoData,
  VideoDataStreamerByChannelId,
  VideoUploadRequest,
  VideoUploadResponse,
} from "./channel";

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
      { page: number; limit: number; channelId: string; filters: any }
    >({
      query: ({ page, limit, channelId, filters }) => {
        console.log("Filters received in query function:", filters);

        return {
          url: `/videoes/${channelId}/all`,
          method: "GET",
          params: { page, limit, ...filters },
        };
      },
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

    getVideoesBychannelId: builder.query<
      VideoDataStreamerByChannelId,
      { id: any; page: number; limit: number }
    >({
      query: ({ id, page, limit }) => {
        console.log("Query parameter in RTK Query:", id);
        return {
          url: `/videoes/channel/${id}`,
          method: "GET",
          params: { page: page, limit: limit },
        };
      },
    }),

    getVideoesBychannelIdViewer: builder.query<
      VideoDataStreamerByChannelId,
      {
        id: any;
        page: number;
        limit: number;
        userId: string;
        channelId: string;
      }
    >({
      query: ({ page, limit, userId, channelId }) => ({
        url: `/videoes/channel/viewer/${channelId}`,
        method: "GET",
        params: {
          page,
          limit,
          userId,
        },
      }),
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
    toggleLike: builder.mutation<any, { videoId: string; userId: string }>({
      query: ({ videoId, userId }) => ({
        url: `/videoes/${videoId}/like`,
        method: "POST",
        body: {
          userId,
        },
      }),
    }),

    toggleDisLike: builder.mutation<any, { videoId: string; userId: string }>({
      query: ({ videoId, userId }) => ({
        url: `/videoes/${videoId}/dislike`,
        method: "POST",
        body: {
          userId,
        },
      }),
    }),

    getInteractionStatus: builder.query<
      any,
      { videoId: string; userId: string }
    >({
      query: ({ videoId, userId }) => {
        console.log(
          "Fetching interaction status for video:",
          videoId,
          "and user:",
          userId
        );

        return {
          url: `videoes/${videoId}/interaction-status`,
          body: {
            userId,
          },
          method: "POST",
        };
      },
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
    getMostPopular: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number; userId: string }
    >({
      query: ({ page, limit, userId }) => {
        return {
          url: `/videoes/videos/popular`,
          method: "GET",
          params: { page: page, limit: limit, userId: userId },
        };
      },
    }),
    getMostLiked: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number; userId: string }
    >({
      query: ({ page, limit, userId }) => {
        return {
          url: `/videoes/videos/mostliked`,
          method: "GET",
          params: { page: page, limit: limit, userId: userId },
        };
      },
    }),
    getMostViewed: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number; userId: string }
    >({
      query: ({ page, limit, userId }) => {
        return {
          url: `/videoes/videos/mostviewed`,
          method: "GET",
          params: { page: page, limit: limit, userId: userId },
        };
      },
    }),
    getMostRecent: builder.query<
      AllVideoUploadResponse,
      { page: number; limit: number; userId: string }
    >({
      query: ({ page, limit, userId }) => {
        return {
          url: `/videoes/videos/recent`,
          method: "GET",
          params: { page: page, limit: limit, userId: userId },
        };
      },
    }),
    searchVideos: builder.query<
      AllVideoUploadResponse,
      {
        searchQuery?: string;
        status?: string;
        visibility?: string;
        category?: string;
        videoType?: string;
        tags?: string[];
        dateRange?: { start: Date; end: Date };
        page?: number;
        limit?: number;
      }
    >({
      query: ({
        searchQuery,
        status,
        visibility,
        category,
        videoType,
        tags,
        dateRange,
        page = 1,
        limit = 10,
      }) => {
        const params: any = {
          searchQuery,
          status,
          visibility,
          category,
          videoType,
          page,
          limit,
        };

        if (tags) {
          params.tags = tags.join(",");
        }

        if (dateRange) {
          params.dateRange = JSON.stringify({
            start: dateRange.start.toISOString(),
            end: dateRange.end.toISOString(),
          });
        }

        return {
          url: `/videoes/videos/search`,
          method: "GET",
          params,
        };
      },
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
  useSearchVideosQuery,
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
  useGetMostLikedQuery,
  useGetMostPopularQuery,
  useGetMostRecentQuery,
  useGetMostViewedQuery,
  useGetVideoesBychannelIdViewerQuery,
} = httpVideoApi;
