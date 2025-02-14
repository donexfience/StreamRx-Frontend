"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Settings,
  Subtitles,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  Download,
  MoreVertical,
  Copy,
  Lock,
  Plus,
  Globe,
} from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  useAddToHistoryMutation,
  useAddToWatchLaterMutation,
  useAddUserVideoToPlaylistMutation,
  useCreateCommentMutation,
  useCreateUserPlaylistMutation,
  useDeleteCommentMutation,
  useGetCommentInteractionQuery,
  useGetInteractionStatusQuery,
  useGetRepliesQuery,
  useGetUserPlaylistsQuery,
  useGetVideoByIdQuery,
  useGetVideoCommentsQuery,
  useToggleCommentDislikeMutation,
  useToggleCommentLikeMutation,
  useToggleDisLikeMutation,
  useToggleLikeMutation,
  useUpdateCommentMutation,
} from "@/redux/services/channel/videoApi";
import { getPresignedUrl } from "@/app/lib/action/s3";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { timeAgo } from "@/lib/utils";
import {
  useGetChannelByIdQuery,
  useGetSubscriptionStatusQuery,
  useSubscribeToChannelMutation,
  useUnsubscribeFromChannelMutation,
} from "@/redux/services/channel/channelApi";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import useVideoHistoryTracking from "@/components/video-helpers/useVideoHistroyTracking";
import RelatedVideos from "@/components/dashboard/viewerComponent/RelatedVideoComponent";

interface Comment {
  _id: string;
  text: string;
  userId: {
    email: string;
    username: string;
    profileImageURL: string;
    _id: string;
  };
  likes: number;
  dislikes: number;
  createdAt: string;
  timestamp: string;
  parentCommentId?: string;
}

interface VideoActionsProps {
  videoId: string;
  videoUrl: string;
  userId: string;
  onAddToWatchLater: () => void;
}

const ReplyInput = React.memo(
  ({
    onSubmit,
    onCancel,
    initialValue = "",
    autoFocus = false,
    isEditing = false,
  }: {
    onSubmit: (text: string) => void;
    onCancel: () => void;
    initialValue?: string;
    autoFocus?: boolean;
    isEditing?: boolean;
  }) => {
    const [text, setText] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const [sessionUser, setSessionUser] = useState<any>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);

    useEffect(() => {
      const fetchSessionUser = async () => {
        try {
          const user = await getUserFromCookies();
          setSessionUser(user?.user);
        } catch (error) {
        } finally {
          setIsLoadingSession(false);
        }
      };
      fetchSessionUser();
    }, []);

    const { data: userData } = useGetUserQuery(
      { email: sessionUser?.email },
      {
        skip: isLoadingSession || !sessionUser?.email,
      }
    );

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    return (
      <div className="flex gap-4 mt-4">
        <img
          src={userData?.user.profileImageURL ?? "/api/placeholder/32/32"}
          alt="Current user"
          className="w-8 h-8 rounded-full"
        />
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isEditing ? "Edit your comment..." : "Add a comment..."
            }
            className="w-full bg-transparent text-white border-b border-gray-700 focus:border-blue-500 outline-none pb-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-white hover:bg-gray-800 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (text.trim()) {
                  onSubmit(text);
                  setText("");
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              disabled={!text.trim()}
            >
              {isEditing ? "Save" : "Comment"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ReplyInput.displayName = "ReplyInput";

const SingleComment = React.memo(
  ({
    comment,
    videoId,
    currentUserId,
    onCommentUpdate,
  }: {
    comment: Comment;
    videoId: string;
    currentUserId: string;
    onCommentUpdate: () => void;
  }) => {
    const [createComment] = useCreateCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const { data: replies = [], refetch: refetchReplies } = useGetRepliesQuery(
      { commentId: comment?._id },
      { skip: !showReplies, refetchOnMountOrArgChange: true }
    );

    const [sessionUser, setSessionUser] = useState<any>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    useEffect(() => {
      const fetchSessionUser = async () => {
        try {
          const user = await getUserFromCookies();
          setSessionUser(user?.user);
        } catch (error) {
        } finally {
          setIsLoadingSession(false);
        }
      };
      fetchSessionUser();
    }, []);

    const { data: userData } = useGetUserQuery(
      { email: sessionUser?.email },
      {
        skip: isLoadingSession || !sessionUser?.email,
      }
    );

    const [toggleLike] = useToggleCommentLikeMutation();
    const [toggleDislike] = useToggleCommentDislikeMutation();

    const { data: interactionStatus } = useGetCommentInteractionQuery(
      { commentId: comment._id, userId: currentUserId },
      { skip: !currentUserId }
    );
    const handleReply = async (text: string) => {
      try {
        if (userData?.user?._id && videoId) {
          await createComment({
            videoId,
            text,
            parentId: comment._id,
            userId: userData?.user?._id,
          }).unwrap();
        }

        setIsReplying(false);
        refetchReplies();
        onCommentUpdate();
      } catch (error) {}
    };

    const handleLike = async () => {
      try {
        if (currentUserId) {
          if (interactionStatus?.disliked) {
            // If currently disliked, remove dislike first
            await toggleDislike({
              commentId: comment._id,
              userId: currentUserId,
            }).unwrap();
          }
          await toggleLike({
            commentId: comment._id,
            userId: currentUserId,
          }).unwrap();
          onCommentUpdate();
        }
      } catch (error) {
        console.error("Failed to toggle like:", error);
      }
    };

    const handleDislike = async () => {
      try {
        if (currentUserId) {
          if (interactionStatus?.liked) {
            // If currently liked, remove like first
            await toggleLike({
              commentId: comment._id,
              userId: currentUserId,
            }).unwrap();
          }
          await toggleDislike({
            commentId: comment._id,
            userId: currentUserId,
          }).unwrap();
          onCommentUpdate();
        }
      } catch (error) {
        console.error("Failed to toggle dislike:", error);
      }
    };

    const handleEdit = async (text: string) => {
      try {
        await updateComment({
          commentId: comment._id,
          text,
        }).unwrap();
        setIsEditing(false);
        onCommentUpdate();
      } catch (error) {}
    };

    const handleDelete = async () => {
      try {
        const response = await deleteComment({
          commentId: comment._id,
        }).unwrap();
        if (comment.parentCommentId) {
          refetchReplies();
        }
        onCommentUpdate();
        refetchReplies();
      } catch (error) {}
    };
    const userName = comment.userId?.username || "Anonymous";
    const userAvatar =
      comment.userId?.profileImageURL || "/api/placeholder/32/32";
    const userId = comment.userId?._id || "";
    return (
      <div className="flex gap-4 mt-4">
        <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
        <div className="flex-1 text-white">
          <div className="flex items-center gap-2">
            <span className="font-medium">{userName}</span>
            <span className="text-gray-400 text-sm">
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <ReplyInput
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialValue={comment.text}
              autoFocus
              isEditing
            />
          ) : (
            <>
              <p className="mt-1">{comment.text}</p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 p-2 rounded-full ${
                    interactionStatus?.liked
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <ThumbsUp
                    size={16}
                    fill={interactionStatus?.liked ? "currentColor" : "none"}
                  />
                  {comment.likes}
                </button>

                <button
                  onClick={handleDislike}
                  className={`flex items-center gap-1 p-2 rounded-full ${
                    interactionStatus?.disliked
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  <ThumbsDown
                    size={16}
                    fill={interactionStatus?.disliked ? "currentColor" : "none"}
                  />
                  {comment.dislikes}
                </button>
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full"
                >
                  Reply
                </button>
                {comment?.userId?._id === currentUserId && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-gray-400 hover:text-white hover:bg-gray-800 p-2 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {isReplying && (
            <ReplyInput
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          )}

          {replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1 text-gray-400 hover:text-white mt-2"
            >
              {showReplies ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              {replies.length} replies
            </button>
          )}

          {showReplies && (
            <div className="ml-8 mt-4">
              {replies &&
                Array.isArray(replies) &&
                replies.map((reply: any) => (
                  <SingleComment
                    key={reply.id}
                    comment={reply}
                    videoId={videoId}
                    currentUserId={currentUserId}
                    onCommentUpdate={onCommentUpdate}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

SingleComment.displayName = "SingleComment";

const CommentSection = React.memo(({ videoId }: { videoId: string }) => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const { data: comments = [], refetch: refetchComments } =
    useGetVideoCommentsQuery({ videoId }, { refetchOnMountOrArgChange: true });
  console.log(comments, "comments got");
  const [createComment] = useCreateCommentMutation();

  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const user = await getUserFromCookies();
        setSessionUser(user?.user);
      } catch (error) {
      } finally {
        setIsLoadingSession(false);
      }
    };
    fetchSessionUser();
  }, []);

  const { data: userData } = useGetUserQuery(
    { email: sessionUser?.email },
    {
      skip: isLoadingSession || !sessionUser?.email,
    }
  );

  userData?.user._id;
  const handleAddComment = async (text: string) => {
    try {
      if (userData?.user._id && videoId) {
        await createComment({
          videoId,
          text,
          userId: userData?.user?._id,
        }).unwrap();
      }
      refetchComments();
    } catch (error) {}
  };

  if (!userData?.user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to comment on this video.
        </AlertDescription>
      </Alert>
    );
  }
  const currentUserId = userData.user._id || "";
  return (
    <div className="p-4">
      <h3 className="text-white text-lg font-bold mb-4">
        {comments.length} Comments
      </h3>

      <ReplyInput onSubmit={handleAddComment} onCancel={() => {}} />

      <div className="space-y-4">
        {comments &&
          Array.isArray(comments) &&
          comments.map((comment: any) => (
            <SingleComment
              key={comment._id}
              comment={comment}
              videoId={videoId}
              currentUserId={currentUserId}
              onCommentUpdate={refetchComments}
            />
          ))}
      </div>
    </div>
  );
});

CommentSection.displayName = "CommentSection";

const VideoActions: React.FC<VideoActionsProps> = ({
  videoId,
  videoUrl,
  userId,
}) => {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [newPlaylistData, setNewPlaylistData] = useState({
    title: "",
    description: "",
  });

  // API Hooks
  const [addToWatchLater, { isLoading: isAddingToWatchLater }] =
    useAddToWatchLaterMutation();
  const {
    data: userPlaylists,
    isLoading: isLoadingPlaylists,
    refetch: UserPlaylistRefetch,
  } = useGetUserPlaylistsQuery({ userId });
  const [createUserPlaylist, { isLoading: isCreatingPlaylist }] =
    useCreateUserPlaylistMutation();
  const [addVideoToPlaylist, { isLoading: isAddingToPlaylist }] =
    useAddUserVideoToPlaylistMutation();

  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleAddToWatchLater = async () => {
    try {
      await addToWatchLater({ userId, videoId }).unwrap();
    } catch (error) {
      console.error("Failed to add to watch later:", error);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      const newPlaylist = await createUserPlaylist({
        userId,
        name: newPlaylistData.title,
        description: newPlaylistData.description,
      }).unwrap();

      // Add video to the newly created playlist
      await addVideoToPlaylist({
        playlistId: newPlaylist._id,
        videoId,
      }).unwrap();

      setShowNewPlaylistModal(false);
      setNewPlaylistData({
        title: "",
        description: "",
      });
      UserPlaylistRefetch();
      toast.success("video added to playlist");
    } catch (error: any) {
      toast.error(error?.data?.error);
      console.error("Failed to create playlist:", error);
    }
  };

  const handleAddToPlaylist = async (playlistId: any) => {
    try {
      await addVideoToPlaylist({
        playlistId,
        videoId,
      }).unwrap();
      setShowPlaylistModal(false);
    } catch (error) {
      console.error("Failed to add to playlist:", error);
    }
  };

  const handleOpenNewPlaylist = () => {
    setShowPlaylistModal(false);
    setTimeout(() => {
      setShowNewPlaylistModal(true);
    }, 100);
  };

  return (
    <>
      <DropdownMenuContent className="min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-1">
        <DropdownMenuItem
          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={() => setShowPlaylistModal(true)}
        >
          Save to Playlist
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={handleAddToWatchLater}
          disabled={isAddingToWatchLater}
        >
          {isAddingToWatchLater ? "Adding..." : "Save to Watch Later"}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 px-4 py-2 text-white hover:bg-gray-800 rounded-md cursor-pointer"
          onClick={handleDownload}
        >
          Download
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Playlist Modal */}
      <Dialog open={showPlaylistModal} onOpenChange={setShowPlaylistModal}>
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white rounded-lg max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg pb-2">
              Save video to...
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoadingPlaylists ? (
              <div className="text-center py-4">Loading playlists...</div>
            ) : userPlaylists && userPlaylists.length > 0 ? (
              <div className="space-y-2">
                {userPlaylists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="flex items-center justify-between p-2 hover:bg-gray-800 rounded cursor-pointer"
                    onClick={() => handleAddToPlaylist(playlist._id)}
                  >
                    <span>{playlist.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No playlists found.
              </div>
            )}

            <button
              onClick={handleOpenNewPlaylist}
              className="w-full mt-2 flex items-center justify-center text-black hover:bg-gray-800 rounded-lg bg-white p-3 font-medium  "
            >
              <Plus className="" />
              Create new playlist
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Playlist Modal */}
      <Dialog
        open={showNewPlaylistModal}
        onOpenChange={setShowNewPlaylistModal}
      >
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white border border-gray-700 rounded-lg max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg pb-3">
              New playlist
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newPlaylistData.title}
              onChange={(e) =>
                setNewPlaylistData({
                  ...newPlaylistData,
                  title: e.target.value,
                })
              }
              className="bg-gray-800 border-gray-700 text-white"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                className="text-white hover:bg-gray-800"
                onClick={() => setShowNewPlaylistModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistData.title.trim() || isCreatingPlaylist}
              >
                {isCreatingPlaylist ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const VideoPlayer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("1080p");
  const [isBuffering, setIsBuffering] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [buffered, setBuffered] = useState<any>([]);
  const [addToWatchLater] = useAddToWatchLaterMutation();

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (!videoRef.current) return;

    const handleProgress = () => {
      const video = videoRef.current;
      const bufferedRanges = [];
      for (let i = 0; video && i < video.buffered.length; i++) {
        bufferedRanges.push({
          start: (video.buffered.start(i) / video.duration) * 100,
          end: (video.buffered.end(i) / video.duration) * 100,
        });
      }
      setBuffered(bufferedRanges);
    };

    videoRef.current.addEventListener("progress", handleProgress);
    return () =>
      videoRef.current?.removeEventListener("progress", handleProgress);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const downloadVideo = () => {
    if (!videoData?.qualities?.[0].s3Key) {
      alert("Video URL not found!");
      return;
    }

    const link = document.createElement("a");
    link.href = videoData?.qualities?.[0].s3Key;
    link.download = `video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToWatchLater = async () => {
    try {
      await addToWatchLater({
        userId: userData?.user?._id,
        videoId: id,
      }).unwrap();
      toast.success("Added to Watch Later");
    } catch (error) {
      toast.error("Failed to add to Watch Later");
    }
  };

  const formatTime = useCallback((time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const {
    data: videoData,
    refetch: GetVideoRefetch,
    isLoading,
  } = useGetVideoByIdQuery({ id }, { skip: !id });
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  console.log(videoData, "vidoedata");

  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<
    Array<{
      resolution: string;
      bitrate: string;
      s3Key: string;
    }>
  >([]);
  const [isQualityChanging, setIsQualityChanging] = useState(false);
  const currentTimeRef = useRef(0);
  const networkSpeedRef = useRef(0);

  const measureNetworkSpeed = useCallback(async () => {
    const startTime = performance.now();
    try {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const speed = (32 * 32 * 4) / (duration / 1000);
      networkSpeedRef.current = speed;
    } catch (error) {
      console.error("Error measuring network speed:", error);
    }
  }, []);

  // Get appropriate quality based on network speed
  const getOptimalQuality = useCallback(() => {
    const speed = networkSpeedRef.current;
    console.log(speed, "speed");
    if (speed < 1000000) return "360p";
    if (speed < 2500000) return "480p";
    if (speed < 5000000) return "720p";
    return "1080p";
  }, []);

  const loadQualityUrl = useCallback(async (s3Key: string) => {
    try {
      const url = await getPresignedUrl(s3Key);
      return url;
    } catch (error) {
      console.error("Error getting presigned URL:", error);
      return null;
    }
  }, []);

  const handleQualityChange = useCallback(
    async (quality: string) => {
      if (!videoData?.qualities || quality === selectedQuality) return;

      setIsQualityChanging(true);
      currentTimeRef.current = videoRef.current?.currentTime || 0;

      const selectedQualityData =
        quality === "auto"
          ? videoData.qualities.find(
              (q: any) => q.resolution === getOptimalQuality()
            )
          : videoData.qualities.find((q: any) => q.resolution === quality);

      if (selectedQualityData) {
        const newUrl = await loadQualityUrl(selectedQualityData.s3Key);
        if (newUrl) {
          setVideoUrl(newUrl);
          setSelectedQuality(quality);
        }
      }
    },
    [videoData, selectedQuality, getOptimalQuality, loadQualityUrl]
  );

  // Handle video load after quality change
  useEffect(() => {
    if (videoRef.current && isQualityChanging) {
      const handleCanPlay = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTimeRef.current;
          if (isPlaying) videoRef.current.play();
          setIsQualityChanging(false);
        }
      };

      videoRef.current.addEventListener("canplay", handleCanPlay);
      return () =>
        videoRef.current?.removeEventListener("canplay", handleCanPlay);
    }
  }, [isQualityChanging, isPlaying]);

  // Initialize available qualities
  useEffect(() => {
    if (videoData?.qualities) {
      setAvailableQualities([
        { resolution: "auto", bitrate: "Adaptive", s3Key: "" },
        ...videoData.qualities,
      ]);
    }
  }, [videoData]);

  // Monitor network speed periodically
  useEffect(() => {
    if (selectedQuality === "auto") {
      const intervalId = setInterval(() => {
        measureNetworkSpeed().then(() => {
          const optimalQuality = getOptimalQuality();
          console.log(optimalQuality, "quality");
          const currentQuality = videoData?.qualities.find(
            (q: any) => q.resolution === optimalQuality
          );
          if (currentQuality && videoUrl !== currentQuality.s3Key) {
            handleQualityChange("auto");
          }
        });
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [
    selectedQuality,
    measureNetworkSpeed,
    getOptimalQuality,
    handleQualityChange,
    videoData,
    videoUrl,
  ]);

  console.log(videoData, "vidoedata");

  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const user = await getUserFromCookies();
        setSessionUser(user?.user);
      } catch (error) {
      } finally {
        setIsLoadingSession(false);
      }
    };
    fetchSessionUser();
  }, []);

  const { data: userData } = useGetUserQuery(
    { email: sessionUser?.email },
    {
      skip: isLoadingSession || !sessionUser?.email,
    }
  );
  const userId = userData?.user?._id || "";
  useVideoHistoryTracking(id, userId, videoRef);
  const [toggleLike] = useToggleLikeMutation();
  const [toggleDislike] = useToggleDisLikeMutation();
  const { data: interactionStatus, refetch: refetchInteraction } =
    useGetInteractionStatusQuery(
      { videoId: id, userId: userId },
      { skip: !id }
    );

  const [isVideoLoading, setIsVideoLoading] = useState(true);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsVideoLoading(true);
      if (videoData?.qualities?.[0].s3Key) {
        const url = await getPresignedUrl(videoData?.qualities?.[0].s3Key);
        setVideoUrl(url);
      }
    };
    fetchVideoUrl();
  }, [videoData?.qualities?.[0].s3Key]);

  const handleLike = async () => {
    try {
      if (userId && !interactionStatus?.liked) {
        await toggleLike({
          videoId: id,
          userId: userId,
        }).unwrap();

        refetchInteraction();
        GetVideoRefetch();
      }
    } catch (error) {}
  };

  const handleDislike = async () => {
    try {
      if (userId && !interactionStatus?.liked) {
        await toggleDislike({ videoId: id, userId: userId }).unwrap();
        refetchInteraction();
        GetVideoRefetch();
      }
    } catch (error) {}
  };
  const channelId = videoData?.channelId?._id || "";
  const {
    data: subscriptionStatus,
    refetch: subscriptionStatusfetch,
    isLoading: statusLoading,
  } = useGetSubscriptionStatusQuery(
    {
      userId,
      channelId,
    },
    { refetchOnMountOrArgChange: true }
  );
  console.log(subscriptionStatus, "substatus");

  const [subscribe, { isLoading: subscribeLoading }] =
    useSubscribeToChannelMutation();
  const [unsubscribe, { isLoading: unsubscribeLoading }] =
    useUnsubscribeFromChannelMutation();
  const isLoadings = statusLoading || subscribeLoading || unsubscribeLoading;

  const handleSubscriptionToggle = async () => {
    try {
      if (subscriptionStatus?.isSubscribed) {
        await unsubscribe({ userId, channelId }).unwrap();
      } else {
        await subscribe({ userId, channelId }).unwrap();
      }

      // Force refetch both subscription status and video data
      await Promise.all([subscriptionStatusfetch(), GetVideoRefetch()]);
      console.log(subscriptionStatus.isSubscribed, "status of susbription");
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
    }
  };
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!videoRef.current) return;
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    },
    []
  );

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !videoRef.current) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";
      if (isInput) return;
      if (!videoRef.current) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowleft":
          e.preventDefault();
          videoRef.current.currentTime -= 5;
          break;
        case "arrowright":
          e.preventDefault();
          videoRef.current.currentTime += 5;
          break;
      }
    },
    [togglePlay, isMuted]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const VideoControls = useMemo(() => {
    return (
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-2 transition-opacity duration-300 ${
          showControls || !isPlaying || isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="relative h-1 group cursor-pointer mb-3"
        >
          <div className="absolute inset-0 bg-gray-600 rounded-full">
            {/* Buffered regions */}
            {buffered.map((range: any, index: any) => (
              <div
                key={index}
                className="absolute h-full bg-white/30 rounded-full"
                style={{
                  left: `${range.start}%`,
                  width: `${range.end - range.start}%`,
                }}
              />
            ))}
            {/* Progress bar */}
            <div
              className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:bg-gray-800 p-2 rounded-full"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white hover:bg-gray-800 p-2 rounded-full"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <div
                className={`absolute left-0 bottom-full mb-2 bg-black/90 p-2 rounded transition-opacity ${
                  showVolumeSlider
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <input
                  type="range"
                  className="w-24 appearance-none bg-gray-600 h-1 rounded-full"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </div>
            </div>

            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="text-white hover:bg-gray-800 p-2 rounded-full">
              <Subtitles size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="text-white hover:bg-gray-800 p-2 rounded-full"
              >
                <Settings size={20} />
              </button>
              {showQualityMenu && (
                <div className="absolute right-0 bottom-full mb-2 bg-black/90 rounded p-2 min-w-[200px]">
                  <div className="text-white text-sm p-2">Quality</div>
                  {availableQualities.map((quality) => (
                    <button
                      key={quality.resolution}
                      className={`w-full text-left p-2 text-sm hover:bg-gray-800 ${
                        selectedQuality === quality.resolution
                          ? "text-blue-500"
                          : "text-white"
                      }`}
                      onClick={() => {
                        handleQualityChange(quality.resolution);
                        setShowQualityMenu(false);
                      }}
                    >
                      {quality.resolution}
                      {quality.resolution === "auto" &&
                        ` (${getOptimalQuality()})`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleFullscreen}
              className="text-white hover:bg-gray-800 p-2 rounded-full"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }, [
    showControls,
    isPlaying,
    isHovering,
    currentTime,
    duration,
    volume,
    isMuted,
    showVolumeSlider,
    showQualityMenu,
    currentQuality,
    formatTime,
    handleProgressBarClick,
    handleVolumeChange,
    togglePlay,
    toggleFullscreen,
  ]);
  const channelName = videoData?.channelId?.channelName;
  const subscribers = videoData?.channelId?.subscribersCount;
  console.log(subscribers, "subscribers");

  const handleNavigateToCommunity = () => {
    const newPath = pathname.split("/").slice(0, -1).join("/") + "/community";
    router.push(newPath);
  };

  return (
    <div className="flex flex-col lg:flex-row bg-black/95 min-h-screen w-full">
      <div className="flex-1 pb-20 flex justify-center items-center border">
        <div className="relative group w-full max-w-xl h-screen">
          <div
            ref={containerRef}
            className="relative"
            onMouseMove={() => {
              setShowControls(true);
              setIsHovering(true);
              if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
              }
              controlsTimeoutRef.current = setTimeout(() => {
                if (isPlaying) {
                  setShowControls(false);
                  setIsHovering(false);
                }
              }, 3000);
            }}
            onMouseLeave={() => {
              setIsHovering(false);
              setShowControls(false);
            }}
          >
            {/* Like controls positioned at top right */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/50 rounded-full"></div>

            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-red-600 rounded-full animate-spin" />
                  <p className="text-gray-400">Loading video...</p>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              className="w-full aspect-[9/16] bg-black cursor-pointer  "
              src={videoUrl || undefined}
              poster={videoData?.thumbnailUrl}
              onClick={togglePlay}
              onLoadStart={() => setIsVideoLoading(true)}
              onCanPlay={() => setIsVideoLoading(false)}
              onTimeUpdate={() =>
                setCurrentTime(videoRef.current?.currentTime || 0)
              }
              onLoadedMetadata={() => {
                setDuration(videoRef.current?.duration || 0);
                setIsVideoLoading(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsVideoLoading(false);
              }}
            />

            {/* Rearranged channel info and subscription button */}
            <div className="absolute bottom-20 left-4 right-4">
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg">
                <div className="flex flex-col">
                  <h3 className="text-white font-medium text-lg">
                    {channelName || "Channel Name"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {`${subscribers} subscribers` || "1M subscribers"}
                  </p>
                </div>
                <Button
                  onClick={handleSubscriptionToggle}
                  disabled={isLoading}
                  variant={
                    subscriptionStatus?.isSubscribed ? "secondary" : "default"
                  }
                  className={`rounded-full font-medium px-6 py-2 ${
                    subscriptionStatus?.isSubscribed
                      ? "bg-gray-800 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {isLoading
                    ? "Loading..."
                    : subscriptionStatus?.isSubscribed
                    ? "Subscribed"
                    : "Subscribe"}
                </Button>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-center gap-2">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 hover:bg-gray-700 rounded-l-full ${
                  interactionStatus?.liked ? "text-blue-500" : "text-white"
                }`}
                onClick={handleLike}
                disabled={interactionStatus?.liked}
              >
                <ThumbsUp
                  size={16}
                  fill={interactionStatus?.liked ? "currentColor" : "none"}
                />
                <span className="text-sm text-white">
                  {videoData?.engagement?.likeCount || "0"}
                </span>
              </button>
              <button
                className={`flex items-center gap-1 px-3 py-1.5 hover:bg-gray-700 rounded-r-full border-l border-gray-700 ${
                  interactionStatus?.disliked ? "text-blue-500" : "text-white"
                }`}
                onClick={handleDislike}
              >
                <ThumbsDown
                  size={16}
                  fill={interactionStatus?.disliked ? "currentColor" : "none"}
                />
                <span className="text-sm text-white">
                  {videoData?.engagement?.dislikeCount || "0"}
                </span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-700 px-4 py-2 rounded-full">
                <Share2 className="text-white" size={20} />
                <span className="text-white" onClick={copyToClipboard}>
                  Share
                </span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-700 px-4 py-2 rounded-full">
                <Save className="text-white" size={20} />
                <span className="text-white">Save</span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-700 px-4 py-2 rounded-full">
                <Download className="text-white" size={20} />
                <span className="text-white" onClick={downloadVideo}>
                  Download
                </span>
              </button>
            </div>

            {/* Play/Pause overlay button */}
            {!isVideoLoading && (
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${
                  !isPlaying && (showControls || isHovering)
                    ? "opacity-100"
                    : "opacity-0"
                }`}
              >
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 bg-black/50 rounded-full p-4"
                >
                  <Play size={48} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-black p-4">
        <CommentSection videoId={id} />
      </div>
    </div>
  );
};

export default VideoPlayer;
