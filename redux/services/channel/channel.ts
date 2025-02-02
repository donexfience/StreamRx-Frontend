export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface StreamSchedule {
  days: string[];
  times: string[];
}

export interface Integrations {
  youtube: boolean;
  twitch: boolean;
  discord: boolean;
}

// Channel Creation Request
export interface ChannelCreationRequest {
  channelName: string;
  channelAccessibility: "public" | "private";
  channelProfileImageUrl: string;
  channelBannerImageUrl?: string;
  ownerEmail: string;
  contentType: string;
  category: string[];
  integrations: Integrations;
  schedulePreference: string;
  streamSchedule: StreamSchedule;
  socialLinks: SocialLinks;
  email: string;
}

// Channel Creation Response
export interface ChannelCreationResponse {
  success: boolean;
  data: {
    _id: string;
    channelName: string;
    channelAccessibility: "public" | "private";
    channelProfileImageUrl: string;
    channelBannerImageUrl?: string;
    ownerEmail: string;
    contentType: string;
    email: string;
    category: string[];
    integrations: Integrations;
    schedulePreference: string;
    streamSchedule: StreamSchedule;
    socialLinks: SocialLinks;
    createdAt: string;
    updatedAt: string;
  };
}

// Channel Creation Response
export interface getChannelResponse {
  _id: string;
  channelName: string;
  channelAccessibility: "public" | "private";
  channelProfileImageUrl: string;
  channelBannerImageUrl?: string;
  ownerEmail: string;
  contentType: string;
  email: string;
  category: string[];
  subscribersCount: number;
  integrations: Integrations;
  schedulePreference: string;
  streamSchedule: StreamSchedule;
  socialLinks: SocialLinks;
  createdAt: string;
  updatedAt: string;
}

export interface VideoUploadRequest {
  channelId: string;
  title: string;
  description?: string;
  visibility: "private" | "unlisted" | "public";
  subtitles?: boolean;
  endScreen?: boolean;
  cards?: boolean;
  videourl: string;
  selectedPlaylist: string[];
  category: string;
  tags: string[];
  thumbnailUrl: string;
}

export interface VideoMetadata {
  originalFileName: string;
  mimeType: string;
  codec?: string;
  fps?: number;
  duration?: number;
}

export interface VideoQuality {
  resolution: string;
  bitrate: string;
  size: number;
}

export interface VideoUploadResponse {
  _id?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  visibility: "private" | "unlisted" | "public";
  status: "pending" | "processing" | "ready" | "failed";
  processingProgress?: number;
  processingError?: string;
  metadata?: VideoMetadata;
  quality?: VideoQuality;
  subtitles: boolean;
  endScreen: boolean;
  cards: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  originalFileName: string;
  mimeType: string;
  codec?: string;
  fps?: number;
  duration?: number;
}

export interface VideoEngagement {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  averageWatchDuration: number;
}

export interface VideoQuality {
  resolution: string;
  bitrate: string;
  size: number;
}

export interface VideoData {
  _id: string;
  channelId: any;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  fileUrl: string;
  metadata: VideoMetadata;
  processingProgress: number;
  quality: VideoQuality;
  s3Key: string;
  selectedPlaylist: string[];
  status: string;
  tags: string[];
  thumbnailUrl: string;
  title: string;
  visibility: string;
  __v: number;
  engagement: VideoEngagement;
  channelName: string;
  subscribers: number;
  length?: any;
}

export interface Comment {
  data: {
    _id: string;
    videoId: string;
    channelId: string;
    userId: string;
    text: string;
    parentCommentId?: string;
    replies?: Comment[];
    likes: number;
    dislikes: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface SubscriptionStatus {
  isSubscribed: boolean;
}

export interface CommentResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    page: number;
    limit: number;
  };
}

export interface CreateCommentRequest {
  videoId: string;
  text: string;
  parentId?: string;
  userId: string;
}

export interface UpdateCommentRequest {
  commentId: string;
  text: string;
}

export interface VideoItem {
  _id?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  visibility: "private" | "unlisted" | "public";
  status: "pending" | "processing" | "ready" | "failed";
  processingProgress?: number;
  processingError?: string;
  metadata?: VideoMetadata;
  quality?: VideoQuality;
  subtitles: boolean;
  endScreen: boolean;
  cards: boolean;
  createdAt: string;
  updatedAt: string;
  channelId?: Record<string, any>;
  channelName: string;
}

export interface AllVideoUploadResponse {
  data: VideoItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
  };
  success: boolean;
}

export interface PlaylistRequest {
  channelId: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  category: string;
  tags: string[];
  thumbnailUrl: string;
  status: string;
  videos: {
    videoId: string;
    next: string | null;
    prev: string | null;
  }[];
}

export interface PlaylistResponse {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  category: string;
  tags: string[];
  thumbnailUrl: string;
  status: string;
  videos: {
    videoId: string;
    next: string | null;
    prev: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SinglePlaylistResponse {
  playlist: {
    _id: string;
    channelId: {
      _id: string;
      channelName: string;
      ownerId: string;
      category: string[]; // Assuming category is an array
      channelAccessibility: "public" | "private" | "unlisted"; // Adjust if needed
    };
    name: string;
    description: string;
    visibility: "public" | "private" | "unlisted";
    category: string;
    tags: string[];
    thumbnailUrl: string;
    status: string;
    videos: {
      _id: string;
      videoId: {
        _id: string;
        title: string;
        url: string;
        duration: number;
      };
      next: string | null;
      prev: string | null;
    }[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

interface VideoNode {
  videoId: string;
  videoUrl: string;
  next: string | null;
  prev: string | null;
}

export interface PlaylistUpdateData {
  playlistId: string;
  updates: {
    name: string;
    description: string;
    visibility: "public" | "private" | "unlisted";
    category: string;
    tags: string[];
    thumbnailUrl: string;
    videos: VideoNode[];
  };
}

export interface Playlist {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  category: string;
  tags: string[];
  thumbnailUrl: string;
  selectedVideos: string[];
  videoUrls: string[];
  videoIds: string[];
  status: "active" | "deleted";
  createdAt: string;
  updatedAt: string;
  length?: any;
}

export interface SubscriptionResponse {
  success: boolean;
  data: SubscriptionData[];
  message: string;
}

interface SubscriptionData {
  _id: string;
  channelId: getChannelResponse;
  userId: string;
  __v: number;
  createdAt: string;
  notificationsEnabled: boolean;
  status: string;
  updatedAt: string;
}

export interface AllPlaylistResponse {
  data: {
    playlists: Playlist[];
    totalCount: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
