"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Search, ChevronDown, Loader2 } from "lucide-react";
import { MdPlaylistAdd } from "react-icons/md";
import { uploadToCloudinary } from "@/app/lib/action/user";
import {
  cleanup,
  processVideo,
  readAndProcessVideo,
} from "@/app/lib/action/videoprocessing";
import { uploadToS3 } from "@/app/lib/action/s3";
import {
  useGetVideoByQueryQuery,
  useUploadVideoMutation,
} from "@/redux/services/channel/videoApi";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useEditPlaylistMutation } from "@/redux/services/channel/plalylistApi";

// Types
interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
}

interface EditPlaylistModalProps {
  channelAcessibility: any;
  isOpen: boolean;
  onClose: () => void;
  refetch: any;
  playlist: {
    _id: string;
    name: string;
    description: string;
    visibility: string;
    category: string;
    tags: string[];
    thumbnailUrl: string;
    videos: Array<{
      videoId: string;
      videoUrl: string;
      next: string | null;
      prev: string | null;
    }>;
    status: string;
  };
}

interface ValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  file?: string;
  ThumbnailFile?: string;
  general?: string;
}

interface VideoNode {
  videoId: string;
  videoUrl: string;
  next: string | null;
  prev: string | null;
}

interface UploadProgress {
  progress: number;
  status: "pending" | "processing" | "uploading" | "complete" | "error";
  url?: string;
  error?: string;
}

interface VideoUpload {
  id: number;
  file: File | null;
  uploadProgress?: UploadProgress;
}

const uploadThumbnail = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  const imageurl = await uploadToCloudinary(file);
  return imageurl;
};

const EditPlaylistModal: React.FC<EditPlaylistModalProps> = ({
  channelAcessibility,
  isOpen,
  onClose,
  refetch,
  playlist,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [formData, setFormData] = useState({
    name: playlist.name,
    description: playlist.description,
    visibility: playlist.visibility,
    category: playlist.category,
    tags: playlist.tags || [],
    thumbnailFile: null as File | null,
    thumbnailUrl: playlist.thumbnailUrl,
    videoUrls: [] as string[],
    subtitles: false,
    endScreen: false,
  });
  React.useEffect(() => {
    if (channelAcessibility === "private") {
      setFormData((prev) => ({ ...prev, visibility: "private" }));
    } else if (channelAcessibility === "unlisted") {
      setFormData((prev) => ({
        ...prev,
        visibility: prev.visibility === "public" ? "unlisted" : prev.visibility,
      }));
    }
  }, [channelAcessibility]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(
    playlist.thumbnailUrl
  );

  const [videoUploads, setVideoUploads] = useState<VideoUpload[]>([
    { id: 1, file: null },
  ]);

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);

      // Initialize selected videos and ordered videos
      const initialSelectedVideos =
        playlist?.videos?.map((v: any) => ({
          _id: v.videoId,
          title: v.videoId?.title || v.videoId,
          thumbnailUrl: v.videoId?.thumbnailUrl || "/placeholder-image.png",
          duration: v.videoId?.metadata?.duration || "",
        })) || [];
      console.log(initialSelectedVideos, "intial video");
      setSelectedVideos(initialSelectedVideos);
      setOrderedVideos(playlist?.videos || []);
    };
    fetchData();
  }, [playlist]);

  const [isVideoSearchOpen, setIsVideoSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [categories] = useState([
    "Technology",
    "Health",
    "Education",
    "Finance",
  ]);
  const [selectedCategory, setSelectedCategory] = useState(playlist.category);
  const [orderedVideos, setOrderedVideos] = useState<VideoNode[]>(
    playlist.videos
  );
  console.log(playlist, "playlist got ");

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const handleRemoveVideo = useCallback((videoId: string) => {
    // Remove the video from selected videos
    setSelectedVideos((prev) => prev.filter((v) => v._id !== videoId));

    // Update the ordered videos list
    setOrderedVideos((prev) => {
      // Create a copy of the current list
      const updatedList = [...prev];
      const index = updatedList.findIndex((node) => node.videoId === videoId);

      if (index === -1) return updatedList;

      // Create updated copies of adjacent nodes
      if (index > 0) {
        updatedList[index - 1] = {
          ...updatedList[index - 1],
          next: updatedList[index].next,
        };
      }

      if (index < updatedList.length - 1) {
        updatedList[index + 1] = {
          ...updatedList[index + 1],
          prev: updatedList[index].prev,
        };
      }

      // Remove the specific node
      return updatedList.filter((node) => node.videoId !== videoId);
    });
  }, []);

  const { data: channelData } = useGetChannelByEmailQuery(users?.email ?? "", {
    skip: !users?.email,
  });

  const {
    data: videos,
    isLoading,
    error,
  } = useGetVideoByQueryQuery(
    {
      query: searchQuery ? { title: searchQuery } : {},
      channelId: channelData?._id || "",
    },
    {
      skip: !searchQuery,
    }
  );

  const [uploadVideo] = useUploadVideoMutation();
  const [updatePlaylist] = useEditPlaylistMutation();
  const [uploadedVideos, setUploadedVideos] = useState<Set<string>>(new Set());

  const processAndUploadVideo = async (file: File) => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`;
    if (uploadedVideos.has(fileId)) {
      return null;
    }
    try {
      const buffer = await file.arrayBuffer();
      const base64Video = Buffer.from(buffer).toString("base64");
      const videoId = Date.now().toString();

      const { outputPaths, metadata } = await processVideo(
        base64Video,
        videoId
      );
      console.log("Output paths received:", outputPaths);

      const PROCESSING_OPTIONS = [
        { resolution: "1080p", bitrate: "4000k", fps: 30 },
        { resolution: "720p", bitrate: "2500k", fps: 30 },
        { resolution: "480p", bitrate: "1000k", fps: 30 },
        { resolution: "360p", bitrate: "600k", fps: 30 },
      ] as const;

      const qualities = await Promise.all(
        PROCESSING_OPTIONS.map(async (option) => {
          const { resolution } = option;
          const outputPath = outputPaths[resolution.toLowerCase()];

          console.log(`Processing ${resolution}, path:`, outputPath);

          if (!outputPath) {
            console.warn(`No output path found for resolution: ${resolution}`);
            return null;
          }

          try {
            const processedVideoBuffer = await readAndProcessVideo(outputPath);

            if (!processedVideoBuffer || processedVideoBuffer.length === 0) {
              console.error(`Empty or invalid buffer for ${resolution}`);
              return null;
            }

            const s3Key = `videos/${channelData?._id}/${videoId}/${resolution}.mp4`;
            const fileUrl = await uploadToS3(
              processedVideoBuffer,
              s3Key,
              "video/mp4"
            );

            return {
              resolution,
              bitrate: option.bitrate,
              size: processedVideoBuffer.length,
              url: fileUrl,
              s3Key,
            };
          } catch (error) {
            console.error(`Error processing ${resolution} version:`, error);
            return null;
          }
        })
      );

      console.log("All qualities processed:", qualities);

      const validQualities = qualities.filter(
        (q): q is NonNullable<typeof q> => q !== null
      );
      console.log("Valid qualities:", validQualities);

      if (validQualities.length === 0) {
        throw new Error("Failed to process any video qualities");
      }

      const uniqueName = `${formData.name}-${Date.now()}`;

      // Prepare video data
      const videoData = {
        channelId: channelData?._id || "",
        title: uniqueName,
        description: formData.description,
        qualities: validQualities,
        visibility: formData.visibility as "public" | "private" | "unlisted",
        status: "processing",
        defaultQuality: validQualities.some((q) => q.resolution === "720p")
          ? "720p"
          : validQualities[0].resolution,
        processingProgress: 0,
        metadata: {
          originalFileName: file.name,
          mimeType: file.type,
          codec: metadata.codec,
          fps: metadata.fps,
          duration: metadata.duration,
        },
        videoType: "normal" as "normal" | "short",
        thumbnailUrl: formData.thumbnailUrl,
        tags: formData.tags,
        category: formData.category,
        selectedPlaylist: [playlist._id],
      };

      const response = await uploadVideo(videoData).unwrap();
      setUploadedVideos((prev) => new Set(prev).add(fileId));

      return {
        videoUrl: response?.qualities?.[0]?.s3Key,
        videoId: response._id,
        title: response.title || file.name,
      };
    } catch (error) {
      console.error("Error processing and uploading video:", error);
      throw error;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCustomCategoryChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomCategory(event.target.value);
  };

  const addCustomCategory = () => {
    if (customCategory.trim() !== "") {
      setSelectedCategory(customCategory.trim());
      setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory("");
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const maxFileSize = 400 * 1024 * 1024;
  const maxThumbnailSize = 10 * 1024 * 1024;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setErrors((prev) => ({ ...prev, file: fileError }));
      return;
    }

    setVideoUploads((prev) => {
      const newUploads = [...prev];
      if (newUploads[index]) {
        newUploads[index] = { ...newUploads[index], file };
      }
      return newUploads;
    });
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxThumbnailSize = 10 * 1024 * 1024;
    if (file.size > maxThumbnailSize) {
      setErrors((prev) => ({
        ...prev,
        ThumbnailFile: "Thumbnail must be less than 10MB",
      }));
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setPreviewThumbnail(previewUrl);

      setFormData((prev) => ({
        ...prev,
        thumbnailFile: file,
      }));

      setErrors((prev) => ({ ...prev, ThumbnailFile: undefined }));
    } catch (error) {
      console.error("Thumbnail preview error:", error);
      setErrors((prev) => ({
        ...prev,
        ThumbnailFile: "Failed to process thumbnail",
      }));
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
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addVideoUploadSlot = () => {
    setVideoUploads((prev) => [...prev, { id: Date.now(), file: null }]);
  };

  const removeVideoUploadSlot = (index: number) => {
    setVideoUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const addVideoToList = (videoId: string, videoUrl: string) => {
    const newNode: VideoNode = {
      videoId,
      videoUrl,
      next: null,
      prev: null,
    };
    setOrderedVideos((prev) => {
      if (prev.length === 0) {
        return [newNode];
      }

      const lastNode = prev[prev.length - 1];
      const updatedLastNode = { ...lastNode, next: videoId };
      newNode.prev = lastNode.videoId;

      return [...prev.slice(0, -1), updatedLastNode, newNode];
    });
  };

  const handleVideoSelection = (video: Video) => {
    if (!selectedVideos.find((v) => v._id === video._id)) {
      setSelectedVideos((prev) => [...prev, video]);
      addVideoToList(video._id, video.thumbnailUrl);
    }
    setIsVideoSearchOpen(false);
    setSearchQuery("");
  };

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid video file (MP4, MOV, or AVI)";
    }
    if (file.size > maxFileSize) {
      return `File size should be less than ${maxFileSize / (1024 * 1024)}MB`;
    }
    return null;
  };

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!selectedCategory && !formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.length > 400) {
      errors.description = "Description must be less than 400 characters";
    }

    return errors;
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

  const updateUploadProgress = (
    index: number,
    progress: Partial<UploadProgress>
  ) => {
    setVideoUploads((prev) => {
      const newUploads = [...prev];
      if (newUploads[index]) {
        newUploads[index] = {
          ...newUploads[index],
          uploadProgress: {
            ...newUploads[index].uploadProgress,
            ...progress,
          } as UploadProgress,
        };
      }
      return newUploads;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle thumbnail upload
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(formData.thumbnailFile);
      }

      // Process and upload new videos
      const uploadedVideoNodes: VideoNode[] = [];
      for (let i = 0; i < videoUploads.length; i++) {
        const upload = videoUploads[i];
        if (upload.file) {
          updateUploadProgress(i, {
            progress: 0,
            status: "processing",
          });

          try {
            const result = await processAndUploadVideo(upload.file);
            if (result) {
              if (!result.videoId || !result.videoUrl) {
                throw new Error("Failed to get video ID or URL");
              }

              const newNode: VideoNode = {
                videoId: result.videoId,
                videoUrl: result.videoUrl,
                next: null,
                prev: null,
              };
              uploadedVideoNodes.push(newNode);

              setSelectedVideos((prev: any) => [
                ...prev,
                {
                  _id: result.videoId,
                  thumbnailUrl: result.videoUrl,
                  duration: "",
                },
              ]);

              updateUploadProgress(i, {
                progress: 100,
                status: "complete",
                url: result.videoUrl,
              });
            }
          } catch (error) {
            console.error("Error uploading video:", error);
            updateUploadProgress(i, {
              progress: 0,
              status: "error",
              error: "Failed to process video",
            });
            throw error;
          }
        }
      }

      // Create new array combining existing and uploaded videos
      const combinedVideos: VideoNode[] = [
        ...orderedVideos.map((video) => ({
          videoId: video.videoId,
          videoUrl: video.videoUrl,
          next: null,
          prev: null,
        })),
        ...uploadedVideoNodes,
      ];

      // Update prev/next references
      const updatedVideos = combinedVideos.map((video, index) => ({
        ...video,
        prev: index > 0 ? combinedVideos[index - 1].videoId : null,
        next:
          index < combinedVideos.length - 1
            ? combinedVideos[index + 1].videoId
            : null,
      }));

      if (!channelData?._id) {
        throw new Error("Channel ID not found");
      }

      const updateData = {
        playlistId: playlist._id,
        updates: {
          name: formData.name,
          description: formData.description,
          visibility: formData.visibility as "public" | "private" | "unlisted",
          category: formData.category,
          tags: formData.tags,
          thumbnailUrl,
          videos: updatedVideos,
        },
      };

      console.log(updateData, "data before submiting");

      const response = await updatePlaylist(updateData).unwrap();
      console.log("Update response:", response);
      refetch();
      onClose();
    } catch (error) {
      console.log(error, "errors of edit");
      setErrors((prev) => ({
        ...prev,
        general: "Failed to update playlist. Please try again.",
      }));
      console.error("Error updating playlist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center overflow-y-auto"
      suppressHydrationWarning
    >
      <div className="bg-white rounded-lg w-full max-w-5xl mx-4 p-5">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <MdPlaylistAdd className="text-xl font-bold" />
            <h2 className="text-xl font-semibold">Edit playlist</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-6">
            {/* Form Fields */}
            <div className="space-y-2">
              {/* Name Input */}
              <div className="">
                <label className="block text-sm font-medium mb-2">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : ""
                  }`}
                  placeholder="Enter playlist name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  rows={4}
                  placeholder="Describe your playlist"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {400 - (formData.description?.length || 0)} characters left
                </div>
              </div>

              {/* Tags Input */}
              <div>
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

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option
                      value="public"
                      disabled={
                        channelAcessibility === "private" ||
                        channelAcessibility === "unlisted"
                      }
                    >
                      Public{" "}
                      {channelAcessibility !== "public" && "(Not allowed)"}
                    </option>
                    <option value="private">Private</option>
                    <option
                      value="unlisted"
                      disabled={channelAcessibility === "private"}
                    >
                      Unlisted{" "}
                      {channelAcessibility === "private" && "(Not allowed)"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Thumbnail Section */}
              <div className="w-full">
                <h2 className="font-medium">Current Thumbnail</h2>
                <div className="border-2 border-dashed rounded-lg p-6">
                  <div className="text-center">
                    {previewThumbnail && (
                      <img
                        src={previewThumbnail}
                        alt="Current thumbnail"
                        className="w-32 h-32 object-cover mx-auto mb-4 rounded"
                      />
                    )}
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
                      Update thumbnail
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
                      <p className="mt-2 text-sm text-red-500">
                        {errors.ThumbnailFile}
                      </p>
                    )}
                    {formData.thumbnailFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {formData.thumbnailFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Management Section */}
            <div className="w-1/2">
              <div className="space-y-4">
                <h3 className="font-medium mt-5">Manage Videos</h3>

                {/* Video Search */}
                <div className="relative">
                  <div
                    className="border rounded-lg p-4 cursor-pointer"
                    onClick={() => setIsVideoSearchOpen(!isVideoSearchOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Search size={20} className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Search videos to add..."
                          className="outline-none"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <ChevronDown size={20} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Search Results */}
                  {isVideoSearchOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-4 text-center">
                          <Loader2 className="animate-spin w-6 h-6 mx-auto text-purple-600" />
                        </div>
                      ) : videos && Array.isArray(videos) ? (
                        videos.map((video) => (
                          <div
                            key={video._id}
                            className="p-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                            onClick={() => handleVideoSelection(video)}
                          >
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{video.title}</div>
                              <div className="text-sm text-gray-500">
                                {video.duration}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No videos found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Videos */}
                {selectedVideos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Video Order:</h4>
                    <div className="space-y-2">
                      {selectedVideos.map((video, index) => (
                        <div
                          key={`${video._id}-${index}`}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-500">{index + 1}.</span>
                            {video.thumbnailUrl && (
                              <img
                                src={
                                  video.thumbnailUrl || "/placeholder-image.png"
                                }
                                alt={video.title}
                                className="w-20 h-12 object-cover rounded"
                              />
                            )}
                            <span>{video.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(video._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Videos Section */}
                {videoUploads.map((upload, index) => (
                  <div
                    key={upload.id}
                    className="border-2 border-dashed rounded-lg p-6 relative"
                  >
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeVideoUploadSlot(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <div className="text-center">
                      <div className="mb-4">
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
                        <div className="text-sm text-gray-600">
                          Upload new video {index + 1}
                          <br />
                          <span className="text-xs text-gray-500">
                            Maximum file size: 500 MB
                          </span>
                        </div>
                      </div>
                      {upload.uploadProgress && (
                        <div className="mt-4">
                          {upload.uploadProgress.status === "error" && (
                            <div className="text-red-500">
                              {upload.uploadProgress.error}
                            </div>
                          )}
                          {upload.uploadProgress.status === "complete" && (
                            <div className="text-green-500">
                              Upload complete
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id={`video-upload-${upload.id}`}
                        onChange={(e) => handleFileChange(e, index)}
                      />
                      <label
                        htmlFor={`video-upload-${upload.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700"
                      >
                        Choose file
                      </label>

                      {upload.file && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: {upload.file.name}
                        </div>
                      )}

                      {upload.uploadProgress && (
                        <div className="mt-4">
                          {upload.uploadProgress.status === "processing" && (
                            <div className="flex items-center justify-center text-purple-600">
                              <Loader2 className="animate-spin mr-2" />
                              Processing...
                            </div>
                          )}
                          {upload.uploadProgress.status === "error" && (
                            <div className="text-red-500">
                              {upload.uploadProgress.error}
                            </div>
                          )}
                          {upload.uploadProgress.status === "complete" && (
                            <div className="text-green-500">
                              Upload complete
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVideoUploadSlot}
                  className="w-full p-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add another video</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Editing...
                </>
              ) : (
                "Edit Playlist"
              )}
            </button>
          </div>
          {/* General Error Message */}
          {errors.general && (
            <div className="text-red-500 text-sm">{errors.general}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditPlaylistModal;
