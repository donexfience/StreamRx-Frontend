"use client";
import React, { useState, useEffect, useCallback } from "react";
import { IoMdSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import Image from "next/image";
import { debounce } from "lodash";
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  format,
  isThisWeek,
} from "date-fns";
import Link from "next/link";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import {
  useGetWatchLaterQuery,
  useRemoveFromWatchLaterMutation,
} from "@/redux/services/channel/videoApi";

interface VideoData {
  _id: string;
  title: string;
  thumbnailUrl: string;
  channelId: {
    name: string;
    _id: string;
  };
  engagement: {
    viewCount: number;
  };
  metadata?: {
    duration: number;
  };
  createdAt: string;
  category: string;
}

interface WatchLaterVideo {
  videoId: VideoData;
  addedAt: string;
  _id: string;
}

interface GroupedVideos {
  [key: string]: WatchLaterVideo[];
}

const WatchLaterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const user = await getUserFromCookies();
        setSessionUser(user?.user);
      } catch (error) {
        console.error("Error fetching session user:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    fetchSessionUser();
  }, []);

  const { data: userData } = useGetUserQuery(
    { email: sessionUser?.email },
    { skip: isLoadingSession || !sessionUser?.email }
  );

  const userId = userData?.user?._id || "";
  const [internalSearchQuery, setInternalSearchQuery] = useState("");

  const {
    data: watchLaterData,
    isLoading,
    refetch,
  } = useGetWatchLaterQuery(
    { userId, page, limit, searchQuery },
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [deleteFromWatchLater] = useRemoveFromWatchLaterMutation();

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPage(1);
      refetch();
    }, 500),
    [refetch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalSearchQuery(query);
    debouncedSearch(query);
  };

  useEffect(() => {
    if (watchLaterData?.videos?.length < limit) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [watchLaterData?.videos]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const groupVideosByDate = (videos: WatchLaterVideo[]): GroupedVideos => {
    return videos?.reduce((groups: GroupedVideos, video) => {
      const addDate = new Date(video.addedAt);
      let dateKey: string;

      if (isToday(addDate)) {
        dateKey = "Today";
      } else if (isYesterday(addDate)) {
        dateKey = "Yesterday";
      } else if (isThisWeek(addDate)) {
        dateKey = format(addDate, "EEEE");
      } else {
        dateKey = format(addDate, "MMMM d, yyyy");
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(video);
      return groups;
    }, {});
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDelete = async (userId: string, videoId: string) => {
    await deleteFromWatchLater({ userId, videoId });
    refetch();
  };

  if (isLoadingSession || isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  const groupedVideos = groupVideosByDate(watchLaterData?.videos || []);

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8 space-y-6">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold text-white">Watch Later</h1>
            <span className="text-gray-400">
              {watchLaterData?.videos?.length || 0} videos
            </span>
          </div>
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search watch later"
              value={internalSearchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
            />
            <IoMdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </div>

        {Object.entries(groupedVideos).map(([dateGroup, videos]) => (
          <div key={dateGroup} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              {dateGroup}
            </h2>
            <div className="space-y-6">
              {videos.map((item: WatchLaterVideo) => (
                <div key={item.videoId._id} className="flex gap-6 group">
                  <Link
                    href={`/watch/${item.videoId._id}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-64 h-36">
                      <Image
                        src={item.videoId.thumbnailUrl}
                        alt={item.videoId.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {item.videoId.metadata?.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-xs">
                          {formatDuration(item.videoId.metadata.duration)}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/watch/${item.videoId._id}`}>
                      <h3 className="font-semibold text-lg text-white hover:text-blue-400 transition-colors">
                        {item.videoId.title}
                      </h3>
                    </Link>
                    <Link href={`/channel/${item.videoId.channelId._id}`}>
                      <p className="text-gray-400 hover:text-gray-300 text-sm mt-2">
                        {item.videoId.channelId.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <span>{item.videoId.category}</span>
                      <span>•</span>
                      <span>
                        {item.videoId.engagement.viewCount.toLocaleString()}{" "}
                        views
                      </span>
                      <span>•</span>
                      <span>
                        Added {formatDistanceToNow(new Date(item.addedAt))} ago
                      </span>
                    </div>
                  </div>
                  <button
                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(userId, item.videoId._id)}
                  >
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-6 py-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLaterPage;
