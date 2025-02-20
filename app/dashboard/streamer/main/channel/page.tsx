"use client";
import React, { useEffect, useState } from "react";
import {
  Camera,
  Users,
  Share2,
  Settings,
  Twitch,
  Youtube,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getUserFromCookies } from "@/app/lib/action/auth";
import {
  useEditChannelByIdMutation,
  useGetChannelByEmailQuery,
} from "@/redux/services/channel/channelApi";
import { useGetAllPlaylistsQuery } from "@/redux/services/channel/plalylistApi";
import { useGetVideoesBychannelIdQuery } from "@/redux/services/channel/videoApi";
import EditChannelModal from "@/components/modals/EditChannelCreationModal";

// Define interfaces for our data types
interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  views: number;
}

interface Playlist {
  id: string;
  title: string;
  thumbnailUrl?: string;
  videoCount: number;
  updatedAt: string;
}

interface CarouselProps<T> {
  title: string;
  items: any;
  renderItem: (item: T) => React.ReactNode;
  currentIndex: number;
  setIndex: (index: number) => void;
}

interface VideoCardProps {
  video: Video;
}

interface PlaylistCardProps {
  playlist: Playlist;
}

// Card Components
const VideoCard: React.FC<VideoCardProps> = ({ video }) => (
  <div className="bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-800">
    <div className="relative w-full h-36 bg-gray-800">
      <img
        src={video.thumbnailUrl || "/api/placeholder/320/180"}
        alt={video.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-12" />
    </div>
    <div className="p-3">
      <h3 className="font-semibold text-gray-100 truncate">{video.title}</h3>
      <p className="text-sm text-gray-400 mt-1">
        {/* {video.views.toLocaleString()} views */}
      </p>
    </div>
  </div>
);

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist }) => (
  <div className="bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-800">
    <div className="aspect-video bg-gray-800 relative">
      <img
        src={playlist.thumbnailUrl || "/api/placeholder/320/180"}
        alt={playlist.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-colors" />
      <div className="absolute bottom-2 right-2 bg-black/75 text-gray-100 px-2 py-1 rounded text-sm">
        {/* {playlist.videoes.length} videos */}
      </div>
    </div>
    <div className="p-3">
      <h3 className="font-medium text-gray-100 truncate">{playlist.title}</h3>
      <p className="text-sm text-gray-400 mt-1">
        Updated {new Date(playlist.updatedAt).toLocaleDateString()}
      </p>
    </div>
  </div>
);

// Carousel Component
function CarouselSection<T>({
  title,
  items,
  renderItem,
  currentIndex,
  setIndex,
}: CarouselProps<T>) {
  const showPrevious = currentIndex > 0;
  const showNext = items && currentIndex < items.length - 4;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-gray-900 font-semibold">{title}</h2>
      </div>
      <div className="relative group">
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 272}px)` }}
          >
            {items?.map((item: any, index: any) => (
              <div key={index} className="flex-shrink-0">
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
        {showPrevious && (
          <button
            onClick={() => setIndex(Math.max(0, currentIndex - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
        )}
        {showNext && (
          <button
            onClick={() => setIndex(currentIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ChannelData {
  channelName: string;
  category: string[];
  channelAccessibility: "public" | "private" | "unlisted";
  channelProfileImageUrl: string;
  channelBannerImageUrl: string;
  contentType: string;
  ownerEmail: string;
  schedulePreference?: "weekly" | "monthly" | "custom";
  streamSchedule?: {
    days: string[];
    times: string[];
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  integrations?: {
    youtube?: boolean;
    twitch?: boolean;
    discord?: boolean;
  };
}
const StreamInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [users, setUsers] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [videoIndex, setVideoIndex] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const limit = 10;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelData | null>(
    null
  );

  const handleEditClick = (channel: ChannelData) => {
    setSelectedChannel(channel);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const {
    data: channelData,
    isLoading: channelLoading,
    isError: channelError,
    refetch,
  } = useGetChannelByEmailQuery(users?.email ?? "", {
    skip: !users?.email,
  });

  const [editChannel] = useEditChannelByIdMutation();

  const filters = {};

  const {
    data: playlists,
    error: playlistError,
    isLoading: playlistLoading,
  } = useGetAllPlaylistsQuery(
    {
      channelId: channelData?._id ?? "",
      page,
      limit,
      filters,
    },
    {
      skip: !channelData?._id,
    }
  );

  const { data: videos, isLoading: isVideoLoading } =
    useGetVideoesBychannelIdQuery({
      id: channelData?._id ?? "",
      page,
      limit,
    });

  console.log(videos, "videoes got ");

  const tabs = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "videos", label: "Videos" },
    { id: "playlists", label: "Playlists" },
  ];

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-gray-50 ml-32 w-full flex items-center justify-center">
        <p className="text-gray-600">Loading channel data...</p>
      </div>
    );
  }

  if (channelError) {
    return (
      <div className="min-h-screen bg-gray-50 ml-32 w-full flex items-center justify-center">
        <p className="text-red-600">Error loading channel data</p>
      </div>
    );
  }

  const handleUpdateChannel = async (updatedData: ChannelData) => {
    try {
      console.log(updatedData, "channel want to update with this data");
      await editChannel({
        channelId: channelData?._id || "",
        channelData: updatedData,
      });
      refetch();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating channel:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-32 w-full">
      {/* Channel Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {channelData?.channelBannerImageUrl ? (
          <img
            src={channelData.channelBannerImageUrl}
            alt="Channel Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
        )}
      </div>

      {/* Offline Status */}
      <div className="w-full bg-gray-100 p-4">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 px-3 py-1 rounded-md text-red-600 text-sm font-medium">
            OFFLINE
          </div>
          <span className="text-gray-700">Channel is offline</span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-md">
              {channelData?.channelProfileImageUrl ? (
                <img
                  src={channelData.channelProfileImageUrl}
                  alt="Channel Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
              )}
            </div>
            <div>
              <h1 className="text-xl text-gray-900 font-semibold">
                {channelData?.channelName || "Channel Name"}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-500 text-sm">
                  {channelData?.subscribersCount?.toLocaleString() || 0}{" "}
                  followers
                </p>
                <div className="flex gap-2">
                  {channelData?.integrations?.twitch && (
                    <Twitch className="w-4 h-4 text-purple-600" />
                  )}
                  {channelData?.integrations?.youtube && (
                    <Youtube className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            className="bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-700 flex items-center gap-2 transition-colors duration-200"
            onClick={() => handleEditClick(channelData)}
          >
            <Settings className="w-4 h-4" />
            Customize channel
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-4 text-sm font-medium relative transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-8">
        {activeTab === "home" && (
          <>
            {/* Stream Videos */}
            {videos?.videos.length > 0 ? (
              <CarouselSection
                title="Stream Videos"
                items={videos?.videos}
                renderItem={(video: any) => (
                  <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={video.thumbnailUrl || "/api/placeholder/320/180"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-12" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {video.views || 0} views
                      </p>
                    </div>
                  </div>
                )}
                currentIndex={videoIndex}
                setIndex={setVideoIndex}
              />
            ) : (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl text-gray-900 font-semibold">
                    Stream Videos
                  </h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-medium mb-2">
                    No Videos Available
                  </h3>
                  <p className="text-gray-500">
                    This channel has no videos currently
                  </p>
                </div>
              </section>
            )}

            {/* Playlists Preview */}
            {Array.isArray(playlists?.data) && playlists.data.length > 0 ? (
              <CarouselSection
                title="Popular Playlists"
                items={playlists?.data}
                renderItem={(playlist: any) => (
                  <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={
                          playlist.thumbnailUrl || "/api/placeholder/320/180"
                        }
                        alt={playlist.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-12" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 truncate">
                        {playlist.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {playlist.videoCount || 0} videos
                      </p>
                    </div>
                  </div>
                )}
                currentIndex={playlistIndex}
                setIndex={setPlaylistIndex}
              />
            ) : (
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl text-gray-900 font-semibold">
                    Popular Playlists
                  </h2>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-gray-900 font-medium mb-2">
                    No Playlists Available
                  </h3>
                  <p className="text-gray-500">
                    This channel has no playlists currently
                  </p>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === "about" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              About {channelData?.channelName}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-700 font-medium">Category</h3>
                <p className="text-gray-600">
                  {channelData?.category?.join(", ") || "Gaming"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-700 font-medium">Schedule</h3>
                <p className="text-gray-600">
                  {channelData?.schedulePreference || "Weekly"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <div>
            {videos && videos?.videos?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.isArray(videos?.videos) &&
                  videos.videos.map((video: any) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 font-medium mb-2">
                  No Videos Available
                </h3>
                <p className="text-gray-500">
                  Start streaming to create content
                </p>
              </div>
            )}

            {Array.isArray(videos?.videos) && videos.videos?.length > 0 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!videos.total}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      !videos.total
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "playlists" && (
          <div>
            {Array.isArray(playlists?.data) && playlists.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {playlists.data.map((playlist: any) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-900 font-medium mb-2">
                  No Playlists Available
                </h3>
                <p className="text-gray-500">
                  Create playlists to organize your content
                </p>
              </div>
            )}

            {/* Pagination for Playlists */}
            {Array.isArray(playlists?.data) && playlists.data.length > 0 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                    {page}
                  </span>
                  <button
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={!playlists.data.total}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                      !playlists.data.total
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(isVideoLoading || playlistLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-center">Loading content...</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {(playlistError || channelError) && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-700 px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              An error occurred while loading content. Please try again.
            </span>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedChannel && (
        <EditChannelModal
          channelData={selectedChannel}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateChannel}
        />
      )}
    </div>
  );
};

export default StreamInterface;
