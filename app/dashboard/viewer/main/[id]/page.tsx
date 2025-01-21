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
} from "lucide-react";
import { useParams } from "next/navigation";
import {
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetRepliesQuery,
  useGetVideoByIdQuery,
  useGetVideoCommentsQuery,
  useUpdateCommentMutation,
} from "@/redux/services/channel/videoApi";
import { getPresignedUrl } from "@/app/lib/action/s3";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { timeAgo } from "@/lib/utils";

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
  createdAt: string;
  timestamp: string;
  parentCommentId?: string;
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
          console.error("Error fetching session:", error);
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
    console.log(comment, "in the singleComponent", comment._id);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const { data: replies = [], refetch: refetchReplies } = useGetRepliesQuery(
      { commentId: comment?._id },
      { skip: !showReplies }
    );
    console.log(replies, "replies in the single commponent");
    const [sessionUser, setSessionUser] = useState<any>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    useEffect(() => {
      const fetchSessionUser = async () => {
        try {
          const user = await getUserFromCookies();
          setSessionUser(user?.user);
        } catch (error) {
          console.error("Error fetching session:", error);
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
    const handleReply = async (text: string) => {
      try {
        console.log("something got for hadleREplay");
        if (userData?.user?._id && videoId) {
          console.log("user data", "dd", comment._id, userData?.user?._id);
          await createComment({
            videoId,
            text,
            parentId: comment._id,
            userId: userData?.user?._id,
          }).unwrap();
        }

        setIsReplying(false);
        if (showReplies) {
          refetchReplies();
        } else {
          setShowReplies(true);
        }
        onCommentUpdate();
      } catch (error) {
        console.error("Failed to create reply:", error);
      }
    };

    const handleEdit = async (text: string) => {
      try {
        console.log(comment._id, "deleting comment id");
        await updateComment({
          commentId: comment._id,
          text,
        }).unwrap();
        setIsEditing(false);
        onCommentUpdate();
      } catch (error) {
        console.error("Failed to update comment:", error);
      }
    };

    const handleDelete = async () => {
      try {
        const response = await deleteComment({
          commentId: comment._id,
        }).unwrap();
        console.log(response, "response after delete");
        refetchReplies();
        onCommentUpdate();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
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
                <button className="flex items-center gap-1 hover:bg-gray-800 p-2 rounded-full">
                  <ThumbsUp size={16} />
                  {comment.likes}
                </button>
                <button className="flex items-center gap-1 hover:bg-gray-800 p-2 rounded-full">
                  <ThumbsDown size={16} />
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

  const [createComment] = useCreateCommentMutation();

  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const user = await getUserFromCookies();
        setSessionUser(user?.user);
      } catch (error) {
        console.error("Error fetching session:", error);
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
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
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
  console.log(comments, "comments got");
  console.log(currentUserId, "current user");
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

const VideoPlayer = () => {
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressBarRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const id = params.id as string;

  const { data: videoData, isLoading } = useGetVideoByIdQuery(
    { id },
    { skip: !id }
  );

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (videoData?.s3Key) {
        const url = await getPresignedUrl(videoData.s3Key);
        setVideoUrl(url);
      }
    };
    fetchVideoUrl();
  }, [videoData?.s3Key]);
  console.log(videoData, videoUrl, "all video data");

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
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
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
          className="relative h-1 group cursor-pointer mb-3"
          onClick={handleProgressBarClick}
        >
          <div className="absolute inset-0 bg-gray-600 rounded-full">
            <div
              className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="absolute inset-0 -top-2 bottom-[-8px] opacity-0 group-hover:opacity-100">
            <div
              className="absolute h-[14px] w-[14px] bg-red-600 rounded-full -ml-[7px] top-[-5px]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
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
                  {["1080p", "720p", "480p", "360p"].map((quality) => (
                    <button
                      key={quality}
                      className={`w-full text-left p-2 text-sm hover:bg-gray-800 ${
                        currentQuality === quality
                          ? "text-blue-500"
                          : "text-white"
                      }`}
                      onClick={() => {
                        setCurrentQuality(quality);
                        setShowQualityMenu(false);
                      }}
                    >
                      {quality}
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

  return (
    <div className="flex flex-col lg:flex-row bg-black min-h-screen w-full">
      <div className="flex-1 xl:max-w-[calc(100%-400px)]">
        <div className="relative group">
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
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black cursor-pointer"
              src={videoUrl}
              poster={videoData?.thumbnailUrl}
              onClick={togglePlay}
              onTimeUpdate={() =>
                setCurrentTime(videoRef.current?.currentTime || 0)
              }
              onLoadedMetadata={() =>
                setDuration(videoRef.current?.duration || 0)
              }
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => setIsBuffering(false)}
            />

            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}

            {VideoControls}

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
          </div>

          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white mb-4">
              {videoData?.title || "Loading..."}
            </h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src="/api/placeholder/48/48"
                  alt="Channel avatar"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-white font-medium">
                    {videoData?.channelName || "Channel Name"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {videoData?.subscribers || "1M subscribers"}
                  </p>
                </div>
                <button className="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200">
                  Subscribe
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-800 rounded-full">
                  <button className="flex items-center gap-1 px-4 py-2 hover:bg-gray-700 rounded-l-full">
                    <ThumbsUp size={20} />
                    <span className="text-white">
                      {videoData?.likes || "10K"}
                    </span>
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 hover:bg-gray-700 rounded-r-full border-l border-gray-700">
                    <ThumbsDown size={20} />
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full">
                  <Share2 size={20} />
                  <span className="text-white">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <CommentSection videoId={id} />
      </div>

      <div className="w-full xl:w-[400px] bg-black p-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-2 mb-4 cursor-pointer hover:bg-gray-900 p-2 rounded group"
          >
            <div className="relative">
              <img
                src={`/api/placeholder/180/100`}
                alt="Thumbnail"
                className="w-40 h-24 object-cover rounded"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                10:30
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-500">
                Recommended Video {index + 1}
              </h3>
              <p className="text-gray-400 text-sm mt-1">Channel Name</p>
              <div className="flex text-gray-400 text-sm mt-1">
                <span>100K views</span>
                <span className="mx-1">•</span>
                <span>2 days ago</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
