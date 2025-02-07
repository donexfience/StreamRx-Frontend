"use client";
import React, { useState, useRef } from "react";
import {
  X,
  FileVideo,
  Check,
  AlertCircle,
  Search,
  ChevronDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaVideo } from "react-icons/fa";
import { MdVideoCall } from "react-icons/md";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUploadVideoMutation } from "@/redux/services/channel/videoApi";
import {
  cleanup,
  processVideo,
  readAndProcessVideo,
} from "@/app/lib/action/videoprocessing";
import { uploadToS3 } from "@/app/lib/action/s3";
import toast from "react-hot-toast";
import { useGetPlaylistByQueryQuery } from "@/redux/services/channel/plalylistApi";
import { uploadToCloudinary } from "@/app/lib/action/user";

// Types
interface VideoFormData {
  title: string;
  description: string;
  visibility: "private" | "unlisted" | "public";
  subtitles: boolean;
  endScreen: boolean;
  cards: boolean;
  tags: string[];
  category: string;
  ThumbnailFile?: File | null;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  file?: string;
  general?: string;
  category?: string;
  tags?: string;
  ThumbnailFile?: string;
}

interface Playlist {
  _id: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "unlisted";
  category: string;
  tags: string[];
  thumbnailUrl: string | null;
}

interface VideoUploadProps {
  channelId: string | undefined;
  onClose: () => void;
  onSuccess: (videoData: any) => void;
  maxFileSize?: number; // in bytes
  refetch: any;
}

const CircularProgress = ({ progress = 70 }: { progress: number }) => {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#E5E7EB"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#2563EB"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold">{progress}%</span>
      </div>
    </div>
  );
};

const VideoUploadFlow: React.FC<VideoUploadProps> = ({
  channelId,
  onClose,
  onSuccess,
  refetch,
  maxFileSize = 400 * 1024 * 1024,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentModal, setCurrentModal] = useState<"upload" | "details">(
    "upload"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPlaylistSearchOpen, setIsPlaylistSearchOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [categories] = useState([
    "Technology",
    "Health",
    "Education",
    "Finance",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    visibility: "private",
    tags: [],
    subtitles: false,
    endScreen: false,
    ThumbnailFile: null as File | null,
    cards: false,
    category: "",
  });

  const { data: playlist, isLoading } = useGetPlaylistByQueryQuery(
    {
      query: searchQuery ? { title: searchQuery } : {},
      channelId: channelId || "",
    },
    { skip: !searchQuery }
  );

  console.log(playlist, "playlists got");
  const validateFile = (file: File): string | null => {
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

    if (!file) {
      return "Please select a video file";
    }

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid video file (MP4, MOV, or AVI)";
    }

    if (file.size > maxFileSize) {
      return `File size should be less than ${maxFileSize / (1024 * 1024)}MB`;
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Title validation
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Description validation
    if (formData.description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    // Category validation
    if (!formData.category && selectedCategory !== "other") {
      newErrors.category = "Category is required";
    }

    // Tags validation
    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    } else if (formData.tags.length > 10) {
      newErrors.tags = "Maximum 10 tags allowed";
    }

    // File validation
    if (!selectedFile) {
      newErrors.file = "Please select a video file";
    } else {
      const fileError = validateFile(selectedFile);
      if (fileError) {
        newErrors.file = fileError;
      }
    }

    setErrors(newErrors);
    console.log(errors, "errors of form video upload");
    return Object.keys(newErrors).length === 0;
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("thumbnail", file);

    const imageurl = await uploadToCloudinary(file);

    return imageurl;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setErrors({});

    if (!files || files.length === 0) {
      setErrors({ file: "No file selected" });
      return;
    }

    const file = files[0];
    const fileError = validateFile(file);

    if (fileError) {
      setErrors({ file: fileError });
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      title: file.name.split(".")[0],
    }));
    setCurrentModal("details");
  };

  const [uploadVideo] = useUploadVideoMutation();

  const removeSelectedPlaylist = (playListId: string) => {
    setSelectedPlaylist((prev) => prev.filter((v) => v._id !== playListId));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrors({});

    try {
      let thumbnailUrl = "";
      if (formData.ThumbnailFile) {
        thumbnailUrl = await uploadThumbnail(formData.ThumbnailFile);
      }
      if (!selectedFile || !channelId) {
        throw new Error("No file selected or channel ID missing");
      }

      setUploadProgress(10);
      const buffer = await selectedFile.arrayBuffer();
      const base64Video = Buffer.from(buffer).toString("base64");
      const videoId = Date.now().toString();

      const { outputPath, metadata } = await processVideo(base64Video, videoId);
      setUploadProgress(50);

      const processedVideoBuffer = await readAndProcessVideo(outputPath);
      const s3Key = `videos/${channelId}/${videoId}/processed.mp4`;
      setUploadProgress(70);

      const fileUrl = await uploadToS3(
        processedVideoBuffer,
        s3Key,
        "video/mp4"
      );
      setUploadProgress(80);

      const videoData = {
        channelId,
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        fileUrl,
        s3Key,
        thumbnailUrl,
        status: "processing",
        processingProgress: 0,
        metadata: {
          originalFileName: selectedFile.name,
          mimeType: selectedFile.type,
          codec: metadata.codec,
          fps: metadata.fps,
          duration: metadata.duration,
        },
        quality: {
          resolution: "720p",
          bitrate: "1500k",
          size: processedVideoBuffer.length,
        },
        tags: formData.tags,
        category: formData.category,
        videourl: fileUrl,
        selectedPlaylist: selectedPlaylist.map((playlist) => playlist._id),
      };

      setUploadProgress(90);
      const uploadedVideo = await uploadVideo({
        ...videoData,
        subtitles: formData.subtitles,
        endScreen: formData.endScreen,
        cards: formData.cards,
      }).unwrap();

      await cleanup([outputPath]);
      setUploadProgress(100);
      onSuccess(videoData);
      toast.success("Video uploaded successfully");
      refetch();
      onClose();
    } catch (error: any) {
      setErrors({
        general:
          error.data?.message || "Failed to upload video. Please try again.",
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
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        setErrors((prev) => ({ ...prev, tags: undefined }));
      }
      e.currentTarget.value = "";
    }
  };

  const handlePlaylistSelection = (Playlist: Playlist) => {
    if (!selectedPlaylist.find((v) => v._id === Playlist._id)) {
      setSelectedPlaylist((prev) => [...prev, Playlist]);
    }
    setIsPlaylistSearchOpen(false);
    setSearchQuery("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
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
      setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
      setSelectedCategory(customCategory.trim());
      setCustomCategory("");
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== "other") {
      setFormData((prev) => ({ ...prev, category: value }));
      setCustomCategory("");
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };
  const maxThumbnailSize = 10 * 1024 * 1024; // 10MB
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxThumbnailSize) {
      setErrors((prev) => ({
        ...prev,
        ThumbnailFile: "Thumbnail must be less than 10MB",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, ThumbnailFile: file }));
    setErrors((prev) => ({ ...prev, ThumbnailFile: undefined }));
  };

  // Floating Icons Component
  const FloatingIcons = () => (
    <div className="relative h-32 w-32 mb-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="bg-blue-100 p-3 rounded-lg shadow-lg">
            <FileVideo className="w-8 h-8 text-blue-500" />
          </div>
          <div className="absolute -top-6 -right-6 bg-blue-100 p-2 rounded-lg shadow-md animate-bounce">
            <FileVideo className="w-6 h-6 text-blue-500" />
          </div>
          <div className="absolute -top-4 -left-6 bg-blue-100 p-2 rounded-lg shadow-md animate-bounce delay-100">
            <FileVideo className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center overflow-y-scroll">
      {currentModal === "upload" ? (
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <FaVideo className="text-2xl" />
              <h2 className="text-xl font-semibold">Upload Video</h2>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-10">
            {renderError(errors.general)}
            <div>
              <p className="mb-3 font-bold text-lg">Upload your video here</p>
              <div className="border-2 border-blue-400 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <FloatingIcons />
                  <button
                    onClick={handleFileClick}
                    className="px-4 py-2 text-white font-bold bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Choose Video
                  </button>
                  <p className="text-sm text-black font-medium line-clamp-2 mt-4">
                    By submitting your videos to StreamrX, you acknowledge that
                    you agree to Terms of Service and Community Guidelines.
                  </p>
                  {renderError(errors.file)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-5xl  bg-white mt-80 mb-28">
          <div className="flex items-center justify-between p-6 border-b">
            <MdVideoCall className="text-xl" />
            <h2 className="text-lg font-bold">Video Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-8 flex ">
            {renderError(errors.general)}

            <div className="grid grid-cols-3 gap-6 w-1/2">
              <div className="col-span-2">
                <div className="space-y-2">
                  <div className="">
                    <label className="block text-sm  font-bold">
                      Title (required)
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, title: undefined }));
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
                      onValueChange={(
                        value: "private" | "unlisted" | "public"
                      ) =>
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
                        className={formData.subtitles ? "bg-blue-500 " : ""}
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
                  {selectedFile && (
                    <video className="w-full h-full object-cover rounded">
                      <source
                        src={URL.createObjectURL(selectedFile)}
                        type={selectedFile.type}
                      />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-sm">Filename</p>
                    <p className="text-sm text-gray-500 truncate">
                      {selectedFile?.name || "No file selected"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Size</p>
                    <p className="text-sm text-gray-500">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Upload Status</p>
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span className="text-sm text-blue-500">
                          Uploading...
                        </span>
                      </div>
                    ) : (
                      <p className=" font-bold text-sm text-green-500 flex items-center pt-2 gap-1">
                        <Check className="h-4 w-4" />
                        Ready to upload
                      </p>
                    )}
                  </div>
                  <h2 className="font-medium">
                    add thumbnail<span className="text-red-500">*</span>
                  </h2>
                  <div className="border-2 border-dashed rounded-lg p-6 ">
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
                        Upload thumbnail
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
                        Choose file
                      </label>
                      {errors.ThumbnailFile && (
                        <p className="mt-2 text-sm text-red-500">
                          {errors.ThumbnailFile}
                        </p>
                      )}
                      {formData.ThumbnailFile && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {formData.ThumbnailFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <div
                  className="border rounded-lg p-4 cursor-pointer "
                  onClick={() => setIsPlaylistSearchOpen(!isPlaylistSearchOpen)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Search size={20} className="text-gray-400 mr-2" />
                      <input
                        type="text"
                        placeholder="Search existing playlist..."
                        className="outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <ChevronDown size={20} className="text-gray-400" />
                  </div>
                </div>

                {/* Search Results Dropdown */}
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
                            src={playlist.thumbnailUrl}
                            alt={playlist.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{playlist.name}</div>
                            <div className="text-sm text-gray-500">
                              {playlist.duration}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No playlist found
                      </div>
                    )}
                  </div>
                )}

                {selectedPlaylist.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Videos:</h4>
                    <div className="space-y-2">
                      {selectedPlaylist.map((playlist) => (
                        <div
                          key={playlist._id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={`${
                                playlist?.thumbnailUrl
                                  ? `${playlist?.thumbnailUrl}`
                                  : ""
                              }`}
                              className="w-20 h-12 object-cover rounded"
                            />
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
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center`}
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

                {/* Category and Visibility */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
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
                      <p className="mt-1 text-sm text-red-500">
                        {errors.category}
                      </p>
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
          </div>

          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileVideo className="h-5 w-5" />
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <CircularProgress progress={uploadProgress} />
                  <span>Uploading video...</span>
                </div>
              ) : errors.general ? (
                <span className="text-red-500">Error preparing upload</span>
              ) : (
                <span>Ready to upload</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentModal("upload")}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading}
                className="min-w-[100px]"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-blue-500 font-bold">
                      Uploading...
                    </span>
                  </div>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
export default VideoUploadFlow;
