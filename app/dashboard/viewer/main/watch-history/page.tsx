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
  useGetHistoryQuery,
  useRemoveFromHistoryMutation,
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
}

interface HistoryVideo {
  videoId: VideoData;
  watchedAt: string;
  watchDuration: number;
  completedWatching: boolean;
  _id: string;
}

interface GroupedVideos {
  [key: string]: HistoryVideo[];
}

const WatchHistory = () => {
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
    data: historyData,
    isLoading,
    refetch,
  } = useGetHistoryQuery(
    { userId, page, limit, searchQuery },
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [deleteVideoFromHistroy] = useRemoveFromHistoryMutation();

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
    if (historyData?.videos?.length < limit) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [historyData?.videos]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const groupVideosByDate = (videos: HistoryVideo[]): GroupedVideos => {
    return videos?.reduce((groups: GroupedVideos, video) => {
      const watchDate = new Date(video.watchedAt);
      let dateKey: string;

      if (isToday(watchDate)) {
        dateKey = "Today";
      } else if (isYesterday(watchDate)) {
        dateKey = "Yesterday";
      } else if (isThisWeek(watchDate)) {
        dateKey = format(watchDate, "EEEE");
      } else {
        dateKey = format(watchDate, "MMMM d, yyyy");
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(video);
      return groups;
    }, {});
  };

  const calculateProgress = (
    watchDuration: number,
    totalDuration: number = 0
  ) => {
    if (!totalDuration) return 0;
    return (watchDuration / totalDuration) * 100;
  };

  const handleDelete = async (userId: any, videoId: any) => {
    await deleteVideoFromHistroy({ userId: userId, videoId: videoId });
    refetch();
  };

  if (isLoadingSession || isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  const groupedVideos = groupVideosByDate(historyData?.videos || []);

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8 space-y-6">
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              placeholder="Search watch history"
              value={searchQuery}
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
              {videos.map((item: HistoryVideo) => (
                <div key={item.videoId?._id} className="flex gap-6 group">
                  <Link
                    href={`/watch/${item.videoId?._id}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-64 h-36">
                      <Image
                        src={item.videoId?.thumbnailUrl}
                        alt={item.videoId?.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                        <div
                          className="h-full bg-red-600"
                          style={{
                            width: `${calculateProgress(
                              item?.watchDuration,
                              item?.videoId?.metadata?.duration || 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link href={`/watch/${item.videoId?._id}`}>
                      <h3 className="font-semibold text-lg text-white hover:text-blue-400 transition-colors">
                        {item.videoId?.title}
                      </h3>
                    </Link>
                    <Link href={`/channel/${item.videoId?.channelId?._id}`}>
                      <p className="text-gray-400 hover:text-gray-300 text-sm mt-2">
                        {item.videoId?.channelId?.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                      <span>
                        {item.videoId?.engagement.viewCount.toLocaleString()}{" "}
                        views
                      </span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(item.watchedAt))} ago
                      </span>
                      {item.videoId?.metadata?.duration && (
                        <>
                          <span>•</span>
                          <span>
                            Watched{" "}
                            {Math.round((item?.watchDuration / 60) * 10) / 10}{" "}
                            min of{" "}
                            {Math.round(
                              (item.videoId?.metadata.duration / 60) * 10
                            ) / 10}{" "}
                            min
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      handleDelete(userId, item.videoId?._id);
                    }}
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

export default WatchHistory;
