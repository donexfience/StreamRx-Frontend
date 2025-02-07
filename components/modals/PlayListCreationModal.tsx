"use client";
import React, { useState, useEffect } from "react";
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
  useBulkUpdateVideosPlaylistMutation,
  useGetVideoByQueryQuery,
  useUploadVideoMutation,
} from "@/redux/services/channel/videoApi";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  useCreateInitialPlaylistMutation,
  useCreatePlaylistMutation,
  useUpdatePlaylistVideosMutation,
} from "@/redux/services/channel/plalylistApi";

// Types
interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
}

interface PlaylistCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: any;
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

const PlaylistCreationModal: React.FC<PlaylistCreationModalProps> = ({
  isOpen = true,
  onClose,
  refetch,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [customCategory, setCustomCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public",
    category: "",
    tags: [] as string[],
    thumbnailFile: null as File | null,
    thumbnailUrl: "",
    videoUrls: [] as string[],
    subtitles: false,
    endScreen: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const [videoUploads, setVideoUploads] = useState<VideoUpload[]>([
    { id: 1, file: null },
  ]);

  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [isVideoSearchOpen, setIsVideoSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [categories, setCategories] = useState([
    "Technology",
    "Health",
    "Education",
    "Finance",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderedVideos, setOrderedVideos] = useState<VideoNode[]>([]);

  // Get channel data
  const { data: channelData, isError: channelError } =
    useGetChannelByEmailQuery(users?.email ?? "", { skip: !users?.email });
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

  const [createInitialPlaylist] = useCreateInitialPlaylistMutation();
  const [updatePlaylistVideos] = useUpdatePlaylistVideosMutation();
  const [bulkUpdateVideosPlaylist] = useBulkUpdateVideosPlaylistMutation();
  const [uploadVideo] = useUploadVideoMutation();

  const processAndUploadVideo = async (file: File, playlistId: string) => {
    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64Video = Buffer.from(buffer).toString("base64");
      const videoId = Date.now().toString();

      // Process video
      const { outputPath, metadata } = await processVideo(base64Video, videoId);
      const processedVideoBuffer = await readAndProcessVideo(outputPath);

      // Upload to S3
      let s3Key = "";
      if (channelData?._id) {
        s3Key = `videos/${channelData._id}/${videoId}/processed.mp4`;
      } else {
        throw new Error("Channel ID not found");
      }

      const fileUrl = await uploadToS3(
        processedVideoBuffer,
        s3Key,
        "video/mp4"
      );
      const uniqueName = `${formData.name}-${Date.now()}`;

      // Prepare video data
      const videoData = {
        channelId: channelData._id,
        title: uniqueName,
        description: formData.description,
        visibility: formData.visibility as "public" | "private" | "unlisted",
        fileUrl,
        s3Key,
        status: "processing",
        processingProgress: 0,
        metadata: {
          originalFileName: file.name,
          mimeType: file.type,
          codec: metadata.codec,
          fps: metadata.fps,
          duration: metadata.duration,
        },
        quality: {
          resolution: "720p",
          bitrate: "1500k",
          size: processedVideoBuffer.length,
        },
        thumbnailUrl: formData.thumbnailUrl,
        tags: formData.tags,
        category: formData.category,
        selectedPlaylist: [playlistId],
        videourl: fileUrl,
      };

      // Upload video data
      const response = await uploadVideo({
        ...videoData,
        subtitles: formData.subtitles,
        endScreen: formData.endScreen,
      }).unwrap();

      const newVideo: Video = {
        _id: response._id || "",
        title: response.title || file.name,
        thumbnailUrl: formData.thumbnailUrl,
        duration: metadata.duration || "0:00",
      };

      console.log(newVideo, "new uploaded video");
      setSelectedVideos((prevVideos) => [...prevVideos, newVideo]);
      console.log(selectedVideos, "videoes  ");

      // Cleanup
      // await cleanup([outputPath]);

      // Return both the video URL and the video ID
      return {
        videoUrl: fileUrl,
        videoId: response._id,
        title: response.title || file.name,
      };
    } catch (error) {
      console.error("Error processing and uploading video:", error);
      throw error;
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
      setCategories((prev) => [...prev, customCategory.trim()]);
      setSelectedCategory(customCategory.trim());
      setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory("");
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  const maxFileSize = 400 * 1024 * 1024; // 400MB
  const maxThumbnailSize = 10 * 1024 * 1024; // 10MB

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

    setFormData((prev) => ({ ...prev, thumbnailFile: file }));
    setErrors((prev) => ({ ...prev, ThumbnailFile: undefined }));
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

  const removeSelectedVideo = (videoId: string) => {
    setSelectedVideos((prev) => prev.filter((v) => v._id !== videoId));

    setOrderedVideos((prev) => {
      const index = prev.findIndex((node) => node.videoId === videoId);
      if (index === -1) return prev;

      const newList = [...prev];

      // Update connections for adjacent nodes
      if (index > 0) {
        newList[index - 1].next = newList[index].next;
      }
      if (index < newList.length - 1) {
        newList[index + 1].prev = newList[index].prev;
      }

      return newList.filter((node) => node.videoId !== videoId);
    });
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

    if (
      videoUploads.every((upload) => !upload.file) &&
      selectedVideos.length === 0
    ) {
      errors.file = "Please select at least one video";
    }

    if (!formData.thumbnailFile) {
      errors.ThumbnailFile = "Please select a thumbnail";
    }

    return errors;
  };

  const [createPlaylist] = useCreatePlaylistMutation();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value !== "other") {
      setFormData((prev) => ({ ...prev, category: value }));
      setCustomCategory("");
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
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
      // Upload thumbnail first
      let thumbnailUrl = "";
      if (formData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(formData.thumbnailFile);
      }

      const initialPlaylistData = {
        channelId: channelData?._id.toString(),
        name: formData.name,
        description: formData.description,
        visibility: formData.visibility as "public" | "private" | "unlisted",
        category: formData.category,
        tags: formData.tags,
        thumbnailUrl,
        videos: [],
        status: "active",
      };

      const playlistResponse = await createInitialPlaylist(
        initialPlaylistData
      ).unwrap();
      const playlistId = playlistResponse._id;

      // Track all videos (both uploaded and selected)
      const uploadedVideoNodes: VideoNode[] = [];
      const allVideoIds: string[] = [];

      // Process and upload new videos
      for (let i = 0; i < videoUploads.length; i++) {
        const upload = videoUploads[i];
        if (upload.file) {
          updateUploadProgress(i, {
            progress: 0,
            status: "processing",
          });

          try {
            const result = await processAndUploadVideo(upload.file, playlistId);
            if (!result.videoId || !result.videoUrl) {
              throw new Error("Failed to get video ID or URL");
            }

            // Add to uploadedVideoNodes for ordering
            const newNode: VideoNode = {
              videoId: result.videoId,
              videoUrl: result.videoUrl,
              next: null,
              prev: null,
            };
            uploadedVideoNodes.push(newNode);

            // Add to allVideoIds for bulk update
            allVideoIds.push(result.videoId);

            updateUploadProgress(i, {
              progress: 100,
              status: "complete",
              url: result.videoUrl,
            });
          } catch (error) {
            console.error("Error processing video:", error);
            updateUploadProgress(i, {
              progress: 0,
              status: "error",
              error: "Failed to process video",
            });
            throw error;
          }
        }
      }

      // Add selected video IDs to allVideoIds
      const selectedVideoIds = selectedVideos
        .map((video) => video._id)
        .filter((id) => id);
      allVideoIds.push(...selectedVideoIds);

      // Perform bulk update with all video IDs
      if (allVideoIds.length > 0) {
        console.log("Updating playlist with all video IDs:", allVideoIds);
        await bulkUpdateVideosPlaylist({
          videoIds: allVideoIds,
          playlistId,
        }).unwrap();
      }

      // Create combined ordered list
      const combinedVideos: VideoNode[] = [];

      // Add uploaded videos with ordering
      uploadedVideoNodes.forEach((node, index) => {
        if (index > 0) {
          node.prev = uploadedVideoNodes[index - 1].videoId;
        }
        if (index < uploadedVideoNodes.length - 1) {
          node.next = uploadedVideoNodes[index + 1].videoId;
        }
        combinedVideos.push(node);
      });

      console.log(uploadedVideoNodes, "uploadvideoNodes");

      // Add selected videos with ordering
      selectedVideos.forEach((video, index) => {
        const totalIndex = uploadedVideoNodes.length + index;
        const node: VideoNode = {
          videoId: video._id,
          videoUrl: video.thumbnailUrl,
          prev: totalIndex > 0 ? combinedVideos[totalIndex - 1].videoId : null,
          next: null,
        };

        if (totalIndex > 0) {
          combinedVideos[totalIndex - 1].next = video._id;
        }

        combinedVideos.push(node);
      });

      console.log(combinedVideos, "length of combined video");

      // Update playlist with final video order
      if (combinedVideos.length > 0) {
        await updatePlaylistVideos({
          playlistId,
          videos: combinedVideos,
        }).unwrap();
      }

      refetch();
      onClose();
    } catch (error) {
      console.log("Error creating playlist:", error);
      setErrors((prev) => ({
        ...prev,
        general: `Failed to create playlist. Please try again.${error}`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-5xl mx-4 p-5">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <MdPlaylistAdd className="text-xl font-bold" />
            <h2 className="text-xl font-semibold">Create new playlist</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-6 ">
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
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
                {/* thumbainail section */}
              </div>
              <div className=" w-full">
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
                    {formData.thumbnailFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {formData.thumbnailFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Thumbnail Upload */}
            <div className="my-div w-1/2">
              {/* Video Selection Section */}
              <div className="space-y-4 ">
                <h3 className="font-medium mt-5">Add Videos</h3>

                {/* Existing Video Search */}
                <div className="relative ">
                  <div
                    className="border rounded-lg p-4 cursor-pointer "
                    onClick={() => setIsVideoSearchOpen(!isVideoSearchOpen)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Search size={20} className="text-gray-400 mr-2" />
                        <input
                          type="text"
                          placeholder="Search existing videos..."
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
                              src="/assets/avathar/avathar.png"
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

                {/* Selected Videos Display */}
                {selectedVideos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Videos:</h4>
                    <div className="space-y-2">
                      {selectedVideos.map((video) => (
                        <div
                          key={video._id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                            <span>{video.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedVideo(video._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Upload Slots */}
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
                          Upload video {index + 1}
                          <br />
                          <span className="text-xs text-gray-500">
                            Maximum file size: 500 MB
                          </span>
                        </div>
                      </div>

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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Playlist"
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

export default PlaylistCreationModal;
