import React from "react";
import { formatDistanceToNow } from "date-fns";
import { PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetRelatedVideosQuery } from "@/redux/services/channel/videoApi";

const RelatedVideos: React.FC<{ currentVideoId: any }> = ({
  currentVideoId,
}) => {
  const router = useRouter();
  const { data, isLoading, error } = useGetRelatedVideosQuery({
    videoId: currentVideoId,
  });

  console.log(data, "realted video got ");
  const formatViews = (count: any) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatDuration = (seconds: any) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleVideoClick = (videoId: any) => {
    router.push(`/dashboard/viewer/main/${videoId}`);
  };

  const handlePlaylistClick = (playlistId: any) => {
    router.push(`/dashboard/viewer/main/playlist/videoes/${playlistId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-center text-red-600">
        Failed to load related videos
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col w-full max-w-md space-y-4">
      {/* Playlist Section */}
      {data.currentPlaylist && data.playlistVideos.length > 0 && (
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-4">
            <PlayCircle className="w-5 h-5 text-gray-700" />
            <h3 className="font-semibold text-gray-900">
              {data.currentPlaylist.name}
            </h3>
          </div>

          {data.playlistVideos.map((video: any) => (
            <div
              key={video._id}
              className="flex items-start space-x-3 mb-4 group cursor-pointer"
              onClick={() => {
                if (data.currentPlaylist && data.currentPlaylist._id) {
                  console.log(data.currentPlaylist._id);
                  handlePlaylistClick(data.currentPlaylist._id);
                }
              }}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-40 h-24 object-cover rounded-md"
                />
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                  {formatDuration(video.metadata?.duration || 0)}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex-grow">
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatViews(video.engagement?.viewCount || 0)} •{" "}
                  {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related Videos Section */}
      <div className="space-y-4">
        {data.relatedVideos.map((video) => (
          <div
            key={video._id}
            className="flex items-start space-x-3 group cursor-pointer"
            onClick={() => handleVideoClick(video._id)}
          >
            <div className="relative flex-shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-40 h-24 object-cover rounded-md"
              />
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                {formatDuration(video.metadata?.duration || 0)}
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex-grow">
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 text-white">
                {video.title}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {formatViews(video.engagement?.viewCount || 0)} •{" "}
                {formatDistanceToNow(new Date(video.createdAt))} ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideos;
