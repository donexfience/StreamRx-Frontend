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
  useGetChannelByChannelIdQuery,
  useGetChannelByEmailQuery,
  useGetChannelByIdQuery,
} from "@/redux/services/channel/channelApi";
import { useGetAllPlaylistsQuery } from "@/redux/services/channel/plalylistApi";
import { useGetVideoesBychannelIdQuery } from "@/redux/services/channel/videoApi";
import { useParams } from "next/navigation";

// Interfaces remain the same
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

interface Channel {
  _id: string;
  channelName: string;
  channelProfileImageUrl?: string;
  channelBannerImageUrl?: string;
  subscribersCount: number;
  category?: string[];
  schedulePreference?: string;
  integrations?: {
    twitch?: boolean;
    youtube?: boolean;
  };
}

interface CarouselProps<T> {
  title: string;
  items: T[];
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

const VideoCard: React.FC<VideoCardProps> = ({ video }) => (
  <div className="bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-800 m-4">
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
  <div className="bg-gray-900 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-800 m-3">
    <div className="aspect-video bg-gray-800 relative ">
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

function CarouselSection<T>({
  title,
  items,
  renderItem,
  currentIndex,
  setIndex,
}: CarouselProps<T>) {
  if (!items?.length) return null;

  const showPrevious = currentIndex > 0;
  const showNext = currentIndex < items.length - 4;

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-gray-100 font-semibold">{title}</h2>
      </div>
      <div className="relative group">
        <div className="overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 272}px)` }}
          >
            {items.map((item, index) => (
              <div key={index} className="flex-shrink-0">
                {renderItem(item)}
              </div>
            ))}
          </div>
        </div>
        {showPrevious && (
          <button
            onClick={() => setIndex(Math.max(0, currentIndex - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-700"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-300" />
          </button>
        )}
        {showNext && (
          <button
            onClick={() => setIndex(currentIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-700"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-300" />
          </button>
        )}
      </div>
    </div>
  );
}

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
    <div className="text-gray-500 mx-auto mb-4">{icon}</div>
    <h3 className="text-gray-100 font-medium mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const StreamInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [page, setPage] = useState(1);
  const [videoIndex, setVideoIndex] = useState(0);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const limit = 10;

  const params = useParams();
  const channelId = params.id as string;

  const {
    data: channelData,
    error: channelError,
    isLoading: channelLoading,
  } = useGetChannelByChannelIdQuery(channelId);

  const {
    data: playlists,
    error: playlistError,
    isLoading: playlistLoading,
  } = useGetAllPlaylistsQuery(
    {
      channelId: channelData?._id ?? "",
      page,
      limit,
    },
    {
      skip: !channelData?._id,
    }
  );

  const {
    data: videos,
    error: videoError,
    isLoading: videoLoading,
  } = useGetVideoesBychannelIdQuery(
    {
      id: channelData?._id ?? "",
    },
    {
      skip: !channelData?._id,
    }
  );

  const tabs = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "videos", label: "Videos" },
    { id: "playlists", label: "Playlists" },
  ];

  if (channelLoading) {
    return (
      <div className="min-h-screen bg-black w-full flex items-center justify-center">
        <p className="text-gray-400">Loading channel data...</p>
      </div>
    );
  }

  if (channelError) {
    return (
      <div className="min-h-screen bg-black w-full flex items-center justify-center">
        <p className="text-red-400">Error loading channel data</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <>
            {videos?.length > 0 ? (
              <CarouselSection
                title="Stream Videos"
                items={videos}
                renderItem={(video) => <VideoCard video={video} />}
                currentIndex={videoIndex}
                setIndex={setVideoIndex}
              />
            ) : (
              <EmptyState
                icon={<Camera className="w-12 h-12" />}
                title="No Videos Available"
                description="This channel has no videos currently"
              />
            )}

            {playlists?.data?.length > 0 ? (
              <CarouselSection
                title="Popular Playlists"
                items={playlists.data}
                renderItem={(playlist) => <PlaylistCard playlist={playlist} />}
                currentIndex={playlistIndex}
                setIndex={setPlaylistIndex}
              />
            ) : (
              <EmptyState
                icon={<Camera className="w-12 h-12" />}
                title="No Playlists Available"
                description="This channel has no playlists currently"
              />
            )}
          </>
        );

      case "about":
        return (
          <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              About {channelData?.channelName}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-300 font-medium">Category</h3>
                <p className="text-gray-400">
                  {channelData?.category?.join(", ") || "Gaming"}
                </p>
              </div>
              <div>
                <h3 className="text-gray-300 font-medium">Schedule</h3>
                <p className="text-gray-400">
                  {channelData?.schedulePreference || "Weekly"}
                </p>
              </div>
            </div>
          </div>
        );

      case "videos":
        return videos?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {videos.map((video: any) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Camera className="w-12 h-12" />}
            title="No Videos Available"
            description="Start streaming to create content"
          />
        );

      case "playlists":
        return (
          <div>
            {playlists?.data?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
                  {playlists.data.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        page === 1
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-blue-900 text-blue-100 rounded-lg font-medium">
                      {page}
                    </span>
                    <button
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!playlists?.hasMore}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        !playlists?.hasMore
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Camera className="w-12 h-12" />}
                title="No Playlists Available"
                description="Create playlists to organize your content"
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black w-full">
      {/* Channel Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {channelData?.channelBannerImageUrl ? (
          <img
            src={channelData.channelBannerImageUrl}
            alt="Channel Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900" />
        )}
      </div>

      {/* Offline Status */}
      <div className="w-full bg-gray-900 p-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <div className="bg-red-900/50 px-3 py-1 rounded-md text-red-300 text-sm font-medium">
            OFFLINE
          </div>
          <span className="text-gray-300">Channel is offline</span>
        </div>
      </div>

      {/* Channel Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
              {channelData?.channelProfileImageUrl ? (
                <img
                  src={channelData.channelProfileImageUrl}
                  alt="Channel Profile"
                  /* Continuing from the Channel Info section */
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-900" />
              )}
            </div>
            <div>
              <h1 className="text-xl text-gray-100 font-semibold">
                {channelData?.channelName || "Channel Name"}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">
                  {channelData?.subscribersCount?.toLocaleString() || 0}{" "}
                  followers
                </p>
                <div className="flex gap-2">
                  {channelData?.integrations?.twitch && (
                    <Twitch className="w-4 h-4 text-purple-400" />
                  )}
                  {channelData?.integrations?.youtube && (
                    <Youtube className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="flex gap-6 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-4 text-sm font-medium relative transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-blue-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-4 space-y-8">{renderContent()}</div>

      {/* Loading Overlay */}
      {(videoLoading || playlistLoading) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl border border-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-300 text-center">Loading content...</p>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {(playlistError || channelError) && (
        <div className="fixed bottom-4 right-4 bg-red-900/20 border border-red-800 text-red-300 px-6 py-3 rounded-lg shadow-lg">
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
    </div>
  );
};

export default StreamInterface;
