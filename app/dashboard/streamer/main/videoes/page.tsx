"use client";
import React, { useEffect, useState } from "react";
import {
  Clock,
  Filter,
  Plus,
  Search,
  Eye,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import VideoUploadFlow from "@/components/modals/videoUploadModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import {
  useDeleteVideoMutation,
  useEditVideoMutation,
  useGetAllVideosQuery,
} from "@/redux/services/channel/videoApi";
import EditVideoFlow from "@/components/modals/EditVideoUpload";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteFromS3 } from "@/app/lib/action/s3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DateRange } from "react-date-range";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DateRangePicker from "@/components/filters/Date-range-picker";

const VideoListingPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const [filters, setFilters] = useState<any>({
    status: "",
    visibility: "",
    category: "",
    dateRange: { start: null, end: null },
    searchQuery: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const {
    data: channelData,
    isLoading,
    isError,
  } = useGetChannelByEmailQuery(users?.email, { skip: !users?.email });

  const flattenFilters = (filters: any) => {
    const flattened = { ...filters };
    if (filters.dateRange) {
      flattened.startDate = filters.dateRange.start;
      flattened.endDate = filters.dateRange.end;
      delete flattened.dateRange;
    }
    return flattened;
  };

  const flattenedFilters = flattenFilters(filters);

  console.log(flattenedFilters, "got it bro");

  const {
    data: videos,
    refetch,
    error: videoError,
  } = useGetAllVideosQuery(
    {
      page: currentPage,
      limit: limit,
      channelId: channelData?._id || "",
      filters: flattenedFilters,
    },
    { refetchOnMountOrArgChange: true }
  );
  console.log(filters, "filters");

  useEffect(() => {
    console.log(videos, "coooooooooooooooo");
  }, [videos]);
  const [deleteVideo] = useDeleteVideoMutation();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setShowEditModal(true);
  };

  const handleDelete = async (video: any) => {
    try {
      if (!video.qualities || !Array.isArray(video.qualities)) {
        console.warn(`Skipping video ${video._id} due to missing qualities.`);
        return;
      }

      const deletePromises = video.qualities.map((quality: any) =>
        deleteFromS3(quality.s3Key)
      );
      await Promise.all(deletePromises);
      await deleteVideo({ videoId: video._id });
      refetch();
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const [editVideo, { isLoading: editLoading, error }] = useEditVideoMutation();

  const handleVideoUpdate = async (updatedData: any) => {
    try {
      const response = await editVideo({
        videoId: updatedData._id,
        updateData: updatedData,
      }).unwrap();
      toast.success("Video updated successfully");
      setShowEditModal(false);
    } catch (error) {
      console.error("error", error);
      toast.error("Failed to update video");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }));
    refetch();
  };

  const getTimeDifference = (date: string) => {
    const now = new Date();
    const videoDate = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Published today";
    if (diffInDays === 1) return "Published yesterday";
    return `Published ${diffInDays} days ago`;
  };

  const getPriority = (video: any) => {
    if (video.status === "processing") return "Medium";
    return "High";
  };

  const handleDateRangeChange = (range: any) => {
    setFilters((prev: any) => ({
      ...prev,
      dateRange: {
        start: range.from,
        end: range.to,
      },
    }));
  };
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleVideoSubmit = (data: any) => {
    console.log("Video upload complete with data:", data);
    setShowUploadModal(false);
  };

  console.log(videos, "videoes got ");

  return (
    <div className="p-8 ml-32 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">My Videos</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search or type a command"
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
              value={filters.searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="font-medium">℉</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <Button
            className="flex items-center gap-2"
            onClick={() => setFilters({ ...filters, status: "" })}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Select
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => handleFilterChange("visibility", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
        </div>
        <Button onClick={handleUploadClick}>+ New Video</Button>
      </div>

      <div className="space-y-4">
        {videos?.data && videos.data.length > 0 ? (
          videos.data.map((video: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="font-medium cursor-pointer"
                    onClick={() =>
                      router.push(
                        `/dashboard/streamer/main/videoes/${video._id}`
                      )
                    }
                  >
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {video.metadata?.mimeType || "Unknown type"}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span>{video.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span>{video.comments || 0}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      video.status === "ready"
                        ? "bg-green-100 text-green-800"
                        : video.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {video.status.charAt(0).toUpperCase() +
                      video.status.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      getPriority(video) === "High"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {getPriority(video)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getTimeDifference(video.createdAt)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      video.visibility === "public"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {video.visibility.charAt(0).toUpperCase() +
                      video.visibility.slice(1)}
                  </span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${video.processingProgress}%` }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-4 ml-4">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => handleEditClick(video)}
                      >
                        <Edit className="w-5 h-5 text-blue-500" />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => handleDelete(video)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500">No videos found</p>
            <p className="text-sm text-gray-400">
              Upload your first video to get started.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from(
              { length: Math.ceil((videos?.pagination?.total ?? 0) / limit) },
              (_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => prev + 1)}
                aria-disabled={
                  currentPage ===
                  Math.ceil(videos?.pagination?.total ?? 0 / limit)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {showUploadModal && (
        <VideoUploadFlow
          refetch={refetch}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleVideoSubmit}
          channelId={channelData?._id}
          channelAccessibility={channelData?.channelAccessibility}
        />
      )}
      {showEditModal && (
        <EditVideoFlow
          refetch={refetch}
          videoData={selectedVideo}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleVideoUpdate}
          channelId={channelData?._id}
          channelAccessibility={channelData?.channelAccessibility}

        />
      )}
    </div>
  );
};

export default VideoListingPage;
