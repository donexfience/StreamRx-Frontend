import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  X,
  FileVideo,
  Check,
  AlertCircle,
  Search,
  ChevronDown,
  Loader2,
  Trash2,
  Play,
  Pause,
  VolumeX,
  Volume2,
  Subtitles,
  Settings,
  Maximize,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MdVideoCall } from "react-icons/md";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useGetPlaylistByQueryQuery,
  useGetPlaylistsByIdsQuery,
} from "@/redux/services/channel/plalylistApi";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { getPresignedUrl } from "@/app/lib/action/s3";
import { useParams } from "next/navigation";

interface EditVideoFlowProps {
  videoData: {
    _id: string;
    title: string;
    description: string;
    visibility: "private" | "unlisted" | "public";
    thumbnailUrl: string;
    tags: string[];
    category: string;
    selectedPlaylist: string[];
    subtitles: boolean;
    endScreen: boolean;
    cards: boolean;
    qualities: any;
    s3Key: string;
  };
  onClose: () => void;
  onSuccess: (updatedData: any) => void;
  channelId: string | undefined;
  maxFileSize?: number;
  refetch: any;
}

const EditVideoFlow: React.FC<EditVideoFlowProps> = ({
  videoData,
  refetch,
  onClose,
  onSuccess,
  channelId,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaylistSearchOpen, setIsPlaylistSearchOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    videoData.category || ""
  );
  const [initialPlaylistIds] = useState<string[]>(() => {
    return Array.isArray(videoData.selectedPlaylist)
      ? videoData.selectedPlaylist
      : [];
  });
  const [formData, setFormData] = useState({
    title: videoData.title || "",
    description: videoData.description || "",
    visibility: videoData.visibility || "private",
    tags: videoData.tags || [],
    subtitles: videoData.subtitles || false,
    endScreen: videoData.endScreen || false,
    cards: videoData.cards || false,
    category: videoData.category || "",
    ThumbnailFile: null as File | null,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("1080p");

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const progressBarRef = useRef<HTMLDivElement>(null);

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

  const { data: initialPlaylists, isLoading: isLoadingInitialPlaylists } =
    useGetPlaylistsByIdsQuery(initialPlaylistIds, {
      skip: !initialPlaylistIds.length,
    });

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

  const { data: playlist, isLoading } = useGetPlaylistByQueryQuery(
    {
      query: searchQuery ? { title: searchQuery } : {},
      channelId: channelId || "",
    },
    { skip: !searchQuery }
  );

  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsVideoLoading(true);
      if (videoData?.qualities?.[0]?.s3Key) {
        const url = await getPresignedUrl(videoData?.qualities?.[0]?.s3Key);
        console.log(url, "url of the video");
        setVideoUrl(url);
      }
    };
    fetchVideoUrl();
  }, [videoData?.s3Key]);
  console.log(videoUrl, "video url");

  useEffect(() => {
    if (initialPlaylists) {
      setSelectedPlaylist(initialPlaylists);
    }
  }, [initialPlaylists]);

  const [categories] = useState([
    "Technology",
    "Health",
    "Education",
    "Finance",
  ]);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    if (formData.description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    if (!formData.category && selectedCategory !== "other") {
      newErrors.category = "Category is required";
    }

    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    } else if (formData.tags.length > 10) {
      newErrors.tags = "Maximum 10 tags allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  console.log(initialPlaylistIds, "id");
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      let thumbnailUrl = videoData.thumbnailUrl;

      if (formData.ThumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(formData.ThumbnailFile);
      }

      const updatedData = {
        _id: videoData._id,
        channelId,
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        thumbnailUrl,
        tags: formData.tags,
        category: formData.category,
        selectedPlaylist: selectedPlaylist.map((playlist) => playlist._id),
        subtitles: formData.subtitles,
        endScreen: formData.endScreen,
        cards: formData.cards,
      };

      onSuccess(updatedData);
      refetch();

      onClose();
    } catch (error: any) {
      setErrors({
        general: error.message || "Failed to update video. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev: any) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((tag: any) => tag !== tagToRemove),
    }));
  };

  const handlePlaylistSelection = (playlist: any) => {
    if (!selectedPlaylist.find((p) => p._id === playlist._id)) {
      setSelectedPlaylist((prev) => [...prev, playlist]);
    }
    setIsPlaylistSearchOpen(false);
    setSearchQuery("");
  };

  const removeSelectedPlaylist = (playlistId: string) => {
    setSelectedPlaylist((prev) => prev.filter((p) => p._id !== playlistId));
  };

  const renderError = (error: string | undefined) => {
    if (!error) return null;
    return (
      <Alert variant="destructive" className="mt-2 mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  const handleCustomCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomCategory(event.target.value);
  };

  const addCustomCategory = () => {
    if (customCategory.trim()) {
      setFormData((prev: any) => ({
        ...prev,
        category: customCategory.trim(),
      }));
      setSelectedCategory(customCategory.trim());
      setCustomCategory("");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== "other") {
      setFormData((prev: any) => ({ ...prev, category: value }));
      setCustomCategory("");
    }
  };

  const maxThumbnailSize = 10 * 1024 * 1024;
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxThumbnailSize) {
      setErrors((prev: any) => ({
        ...prev,
        ThumbnailFile: "Thumbnail must be less than 10MB",
      }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, ThumbnailFile: file }));
    setErrors((prev: any) => ({ ...prev, ThumbnailFile: undefined }));
  };
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center overflow-y-scroll">
      <Card className="w-full max-w-5xl bg-white mt-80 mb-28">
        <div className="flex items-center justify-between p-6 border-b">
          <MdVideoCall className="text-xl" />
          <h2 className="text-lg font-bold">Edit Video Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-8 flex">
          {renderError(errors.general)}

          <div className="grid grid-cols-3 gap-6 w-1/2">
            <div className="col-span-2">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-bold">
                    Title (required)
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                      setErrors((prev: any) => ({ ...prev, title: undefined }));
                    }}
                    className="w-full"
                  />
                  {renderError(errors.title)}
                </div>

                <div>
                  <label className="block text-sm mb-2 font-bold">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Tell viewers about your video"
                    className="h-32"
                  />
                  {renderError(errors.description)}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">
                    Choose who can see your video
                  </h3>
                  <RadioGroup
                    value={formData.visibility}
                    onValueChange={(value: "private" | "unlisted" | "public") =>
                      setFormData((prev) => ({ ...prev, visibility: value }))
                    }
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <label htmlFor="private" className="flex flex-col">
                        <div className="font-medium">Private</div>
                        <div className="text-sm text-gray-500">
                          Only you can watch
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlisted" id="unlisted" />
                      <label htmlFor="unlisted" className="flex flex-col">
                        <div className="font-medium">Unlisted</div>
                        <div className="text-sm text-gray-500">
                          Anyone with the link can watch
                        </div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <label htmlFor="public" className="flex flex-col">
                        <div className="font-medium">Public</div>
                        <div className="text-sm text-gray-500">
                          Everyone can watch
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Automatic Subtitles</h4>
                      <p className="text-sm text-gray-500">
                        Generate subtitles automatically
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          subtitles: !prev.subtitles,
                        }))
                      }
                      className={formData.subtitles ? "bg-blue-500" : ""}
                    >
                      {formData.subtitles ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        "Enable"
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">End Screen</h4>
                      <p className="text-sm text-gray-500">
                        Add end screen elements
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          endScreen: !prev.endScreen,
                        }))
                      }
                      className={formData.endScreen ? "bg-blue-500" : ""}
                    >
                      {formData.endScreen ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        "Enable"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-1/2">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="aspect-video bg-gray-200 rounded mb-4">
                {/* {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-gray-600 border-t-red-600 rounded-full animate-spin" />
                      <p className="text-gray-400">Loading video...</p>
                    </div>
                  </div>
                )} */}
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
                  {" "}
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
                    className="w-full aspect-video bg-black cursor-pointer"
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
                  {!isVideoLoading && isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}
                  {VideoControls}
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

              <h2 className="font-medium mb-2">
                Update thumbnail<span className="text-red-500">*</span>
              </h2>
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Current thumbnail
                    <br />
                    <span className="text-xs text-gray-500">
                      Maximum file size: 10 MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                    onChange={handleThumbnailChange}
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700"
                  >
                    Choose new thumbnail
                  </label>
                  {errors.ThumbnailFile && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.ThumbnailFile}
                    </p>
                  )}
                  {formData.ThumbnailFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {formData.ThumbnailFile.name}
                    </div>
                  )}
                  {videoData.thumbnailUrl && !formData.ThumbnailFile && (
                    <div className="mt-4">
                      <img
                        src={videoData.thumbnailUrl}
                        alt="Current thumbnail"
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div
                className="border rounded-lg p-4 cursor-pointer"
                onClick={() => setIsPlaylistSearchOpen(!isPlaylistSearchOpen)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Search size={20} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search playlists..."
                      className="outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <ChevronDown size={20} className="text-gray-400" />
                </div>
              </div>

              {isPlaylistSearchOpen && (
                <div className="absolute z-10 w-1/6 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center">
                      <Loader2 className="animate-spin w-6 h-6 mx-auto text-purple-600" />
                    </div>
                  ) : playlist && Array.isArray(playlist) ? (
                    playlist.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="p-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                        onClick={() => handlePlaylistSelection(playlist)}
                      >
                        <img
                          src={
                            playlist.thumbnailUrl ||
                            "/assets/avathar/avathar.png"
                          }
                          alt={playlist.name}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium">{playlist.name}</div>
                          <div className="text-sm text-gray-500">
                            {playlist.description}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No playlists found
                    </div>
                  )}
                </div>
              )}

              {selectedPlaylist.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Selected Playlists:</h4>
                  <div className="space-y-2">
                    {selectedPlaylist.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              playlist.thumbnailUrl ||
                              "/assets/avathar/avathar.png"
                            }
                            alt={playlist.name}
                            className="w-20 h-12 object-cover rounded"
                          />
                          <span className="font-medium">{playlist.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedPlaylist(playlist._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Type a tag and press Enter"
                  onKeyDown={handleTagInput}
                />
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Category<span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.category ? "border-red-500" : ""
                  }`}
                >
                  <option value="" disabled>
                    -- Select a Category --
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}

                {selectedCategory === "other" && (
                  <div className="mt-2">
                    <input
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      type="text"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={handleCustomCategoryChange}
                    />
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400"
                      onClick={addCustomCategory}
                      disabled={!customCategory.trim()}
                    >
                      Add Category
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileVideo className="h-5 w-5" />
            {isUploading ? (
              <span>Updating video details...</span>
            ) : (
              <span>Ready to update</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditVideoFlow;
