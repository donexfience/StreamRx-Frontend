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

const VideoListingPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);
  const {
    data: videos,
    refetch,
    error: videoError,
  } = useGetAllVideosQuery({
    page: 1,
    limit: 10,
  });
  console.log(videos?.data);
  console.log(videoError, "video error");

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
  const [deleteVideo] = useDeleteVideoMutation();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setShowEditModal(true);
  };

  const handleDelete = async (video: any) => {
    console.log(video, "video in the delete");
    await deleteFromS3(video.s3Key);
    deleteVideo({ videoId: video._id });
    refetch();
  };

  const [editVideo, { isLoading: editLoading, error }] = useEditVideoMutation();

  const handleVideoUpdate = async (updatedData: any) => {
    try {
      console.log("Video updated with data:", updatedData);
      const response = await editVideo({
        videoId: updatedData._id,
        updateData: updatedData,
      }).unwrap();
      toast.success("video updated succesfully");
      console.log("Video updated successfully:", response);
      setShowEditModal(false);
    } catch (error) {
      console.error("error", error);
      toast.error("failed to update video");
    }
  };

  const recommendedCategories = [
    { icon: <Eye className="w-5 h-5 text-blue-500" />, text: "View Analytics" },
    {
      icon: <MessageSquare className="w-5 h-5 text-orange-500" />,
      text: "Manage Comments",
    },
    { icon: <Plus className="w-5 h-5 text-green-500" />, text: "Upload Video" },
    {
      icon: <Clock className="w-5 h-5 text-purple-500" />,
      text: "Schedule Upload",
    },
  ];

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleVideoSubmit = (data: any) => {
    console.log("Video upload complete with data:", data);
    setShowUploadModal(false);
  };

  // Helper function to format the time difference
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

  // Helper function to determine priority based on video metrics
  const getPriority = (video: any) => {
    if (video.status === "processing") return "Medium";
    return "High";
  };

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
            />
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="font-medium">℉</span>
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Recommended Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {recommendedCategories.map((category, index) => (
            <button
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl border hover:bg-gray-50 transition-colors"
            >
              {category.icon}
              <span className="font-medium">{category.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="px-4 py-2 rounded-lg border">Sort</button>
          <button className="px-4 py-2 rounded-lg border">Hide</button>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-black text-white"
          onClick={handleUploadClick}
        >
          + New Video
        </button>
      </div>
      {/* //video looping */}
      <div className="space-y-4">
        {videos?.data?.map((video: any, index: number) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="font-medium"
                  onClick={() =>
                    router.push(`/dashboard/streamer/main/videoes/${video._id}`)
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
                  {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
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
        ))}
      </div>

      {showUploadModal && (
        <VideoUploadFlow
          refetch={refetch}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleVideoSubmit}
          channelId={channelData?._id}
        />
      )}
      {showEditModal && (
        <EditVideoFlow
          videoData={selectedVideo}
          refetch={refetch}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleVideoUpdate}
          channelId={channelData?._id}
        />
      )}
    </div>
  );
};

export default VideoListingPage;
