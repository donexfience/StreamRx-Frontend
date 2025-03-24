"use client";
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus } from "lucide-react";
import FilterTag from "@/components/friends/FilterTag";
import SearchBar from "@/components/friends/SearchBar";
import StreamerCard from "@/components/friends/StreamerCard";
import {
  useAcceptFriendRequestMutation,
  useBlockFriendMutation,
  useGetStreamersQuery,
  useSendFriendRequestMutation,
} from "@/redux/services/streaming/streamingApi";
import toast from "react-hot-toast";
import StatCard from "@/components/friends/StatCard";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

interface Streamer {
  id: string;
  username: string;
  avatar: string;
  bio: string;
  friendshipStatus:
    | "FRIEND"
    | "PENDING_SENT"
    | "PENDING_RECEIVED"
    | "BLOCKED"
    | "NONE"
    | "CHURNED"
    | "CUSTOMER";
  mutualFriendsCount: number;
}

const StreamerHub: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [users, setUsers] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [blockFriend] = useBlockFriendMutation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const decodeUser = await getUserFromCookies();
        setUsers(decodeUser.user);
      } catch (error) {
        console.error("Error fetching user from cookies:", error);
        toast.error("Failed to authenticate user");
      }
    };
    fetchData();
  }, []);

  const { data: userData } = useGetUserQuery(
    { email: users?.email },
    { skip: !users?.email }
  );

  const {
    data: streamersData,
    refetch,
    isLoading,
    error,
  } = useGetStreamersQuery(
    {
      userId: userData?.user._id || "",
      page,
      limit,
      search,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    },
    { skip: !userData?.user._id }
  );

  const streamers: Streamer[] = useMemo(() => {
    return streamersData?.data || [];
  }, [streamersData]);

  const stats = useMemo(() => {
    if (!streamers.length) {
      return {
        totalCustomers: 0,
        totalGrowth: 0,
        members: 0,
        membersGrowth: 0,
        activeNow: 0,
        activeAvatars: [],
      };
    }

    const validAvatars = streamers
      .filter(
        (s) =>
          s.avatar && typeof s.avatar === "string" && s.avatar.trim() !== ""
      )
      .slice(0, 5)
      .map((s) => s.avatar);

    return {
      totalCustomers: streamers.length,
      totalGrowth: 0,
      members: streamers.filter((s) => s.friendshipStatus === "FRIEND").length,
      membersGrowth: 0,
      activeNow: Math.floor(streamers.length * 0.3),
      activeAvatars: validAvatars,
    };
  }, [streamers]);

  const filteredStreamers = useMemo(() => {
    return streamers.filter((streamer) => {
      if (!streamer) return false;
      switch (filter) {
        case "all":
          return true;
        case "friend":
          return streamer.friendshipStatus === "FRIEND";
        case "pending":
          return ["PENDING_SENT", "PENDING_RECEIVED"].includes(
            streamer.friendshipStatus
          );
        case "blocked":
          return streamer.friendshipStatus === "BLOCKED";
        case "churned":
          return streamer.friendshipStatus === "CHURNED";
        case "customer":
          return streamer.friendshipStatus === "CUSTOMER";
        default:
          return true;
      }
    });
  }, [streamers, filter]);

  const searchedStreamers = useMemo(() => {
    if (!search.trim()) return filteredStreamers;

    const searchLower = search.toLowerCase();
    return filteredStreamers.filter((streamer) => {
      const usernameMatch =
        streamer.username && typeof streamer.username === "string"
          ? streamer.username.toLowerCase().includes(searchLower)
          : false;

      const bioMatch =
        streamer.bio && typeof streamer.bio === "string"
          ? streamer.bio.toLowerCase().includes(searchLower)
          : false;

      return usernameMatch || bioMatch;
    });
  }, [filteredStreamers, search]);

  const paginatedStreamers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return searchedStreamers.slice(startIndex, endIndex);
  }, [searchedStreamers, page, limit]);

  const handleAction = async (streamerId: string, action: string) => {
    if (!userData?.user._id || !streamerId) {
      toast.error("Missing user information. Please try again.");
      return;
    }

    try {
      const payload = { userId: userData.user._id, friendId: streamerId };
      let message = "";
      switch (action) {
        case "add":
          await sendFriendRequest(payload).unwrap();
          refetch();
          message = "Friend request sent successfully";
          break;
        case "accept":
          await acceptFriendRequest(payload).unwrap();
          refetch();
          message = "Friend request accepted";
          break;
        case "block":
          await blockFriend(payload).unwrap();
          refetch();
          message = "User blocked successfully";
          break;
        case "unblock":
          await blockFriend(payload).unwrap();
          refetch();
          message = "User unblocked successfully";
          break;
        default:
          return;
      }
      toast.success(message);
    } catch (error) {
      console.error(`Failed to ${action} streamer:`, error);
      toast.error(`Failed to ${action} streamer. Please try again.`);
    }
  };

  useEffect(() => {
    if (error) {
      console.error("API error:", error);
      toast.error("Failed to load streamers. Please try again.");
    }
  }, [error]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  const removeFilter = (filterToRemove: string) => {
    if (filterToRemove.startsWith("Date Range")) {
      setStartDate(null);
      setEndDate(null);
    }
    setActiveFilters(activeFilters.filter((f) => f !== filterToRemove));
  };

  useEffect(() => {
    if (startDate && endDate) {
      const dateRangeLabel = `Date Range: ${format(
        startDate,
        "MMM dd, yyyy"
      )} - ${format(endDate, "MMM dd, yyyy")}`;
      setActiveFilters((prev) => {
        const withoutDate = prev.filter((f) => !f.startsWith("Date Range"));
        return [...withoutDate, dateRangeLabel];
      });
    } else {
      setActiveFilters((prev) =>
        prev.filter((f) => !f.startsWith("Date Range"))
      );
    }
  }, [startDate, endDate]);

  const applyDateFilter = () => {
    if (startDate && endDate) {
      setShowDatePicker(false);
    } else {
      toast.error("Please select both start and end dates");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-blue-900">
            Streamers & Friends
          </h1>
        </motion.div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-6 border-b w-full justify-start rounded-none bg-white p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, staggerChildren: 0.1 }}
            >
              <StatCard
                title="Total streamers"
                value={stats.totalCustomers}
                changePercentage={stats.totalGrowth}
              />
              <StatCard
                title="Friends"
                value={stats.members}
                changePercentage={stats.membersGrowth}
              />
              <StatCard
                title="Active now"
                value={stats.activeNow}
                avatars={stats.activeAvatars}
              />
            </motion.div>

            <div className="mb-6 flex flex-wrap gap-2">
              <AnimatePresence>
                {activeFilters.map((filter) => (
                  <FilterTag
                    key={filter}
                    label={filter}
                    onRemove={() => removeFilter(filter)}
                  />
                ))}
              </AnimatePresence>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-[30px]"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Filter className="h-3 w-3" />
                <span>More filters</span>
              </Button>
              {showDatePicker && (
                <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-4 mt-2">
                  <h3 className="text-sm font-medium mb-2 text-blue-900">
                    Select Date Range
                  </h3>
                  <div className="flex gap-2">
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="border rounded p-2 text-sm border-gray-300 focus:border-blue-500"
                    />
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined}
                      placeholderText="End Date"
                      className="border rounded p-2 text-sm border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={applyDateFilter}
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDatePicker(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4 flex justify-between items-center border-b">
                <div className="flex items-center gap-2">
                  {["all", "friend", "pending", "blocked"].map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleFilterChange(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="w-72">
                  <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search streamers..."
                  />
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-blue-100 text-blue-800">
                      <th className="text-left py-4 px-4 font-medium text-sm">
                        Streamer
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-sm">
                        About
                      </th>
                      <th className="text-left py-4 px-4 font-medium text-sm">
                        Users
                      </th>
                      <th className="text-right py-4 px-4 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="mt-2 text-sm text-blue-600">
                              Loading streamers...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedStreamers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <p className="text-blue-600">No streamers found</p>
                        </td>
                      </tr>
                    ) : (
                      <AnimatePresence>
                        {paginatedStreamers.map((streamer, index) => (
                          <StreamerCard
                            key={streamer.id}
                            streamer={streamer}
                            onAction={handleAction}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center p-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-blue-600">
                  Page {page} of{" "}
                  {Math.max(1, Math.ceil(searchedStreamers.length / limit))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page >= Math.ceil(searchedStreamers.length / limit) ||
                    searchedStreamers.length === 0
                  }
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <div className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4 text-blue-900">
                Friends
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !streamers.filter((s) => s.friendshipStatus === "FRIEND")
                  .length ? (
                <p className="text-center py-8 text-blue-600">
                  You don’t have any friends yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {streamers
                      .filter((s) => s.friendshipStatus === "FRIEND")
                      .map((streamer) => (
                        <motion.div
                          key={streamer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border rounded-lg flex items-center gap-3 bg-white"
                        >
                          <img
                            src={streamer.avatar || "/default-avatar.png"}
                            alt={streamer.username}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/default-avatar.png";
                            }}
                          />
                          <div className="flex-grow">
                            <div className="font-medium text-blue-900">
                              {streamer.username}
                            </div>
                            <div className="text-sm text-blue-600 truncate">
                              {streamer.bio || "No bio available"}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(streamer.id, "block")}
                          >
                            Block
                          </Button>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4 text-blue-900">
                Pending Requests
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !streamers.filter((s) =>
                  ["PENDING_SENT", "PENDING_RECEIVED"].includes(
                    s.friendshipStatus
                  )
                ).length ? (
                <p className="text-center py-8 text-blue-600">
                  No pending friend requests.
                </p>
              ) : (
                <div className="space-y-6">
                  {streamers.filter(
                    (s) => s.friendshipStatus === "PENDING_RECEIVED"
                  ).length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-2 text-blue-900">
                        Received Requests
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {streamers
                          .filter(
                            (s) => s.friendshipStatus === "PENDING_RECEIVED"
                          )
                          .map((streamer) => (
                            <motion.div
                              key={streamer.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 border rounded-lg flex items-center gap-2 bg-white"
                            >
                              <img
                                src={streamer.avatar || "/default-avatar.png"}
                                alt={streamer.username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/default-avatar.png";
                                }}
                              />
                              <div className="flex-grow font-medium text-blue-900">
                                {streamer.username}
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  handleAction(streamer.id, "accept")
                                }
                              >
                                Accept
                              </Button>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}

                  {streamers.filter(
                    (s) => s.friendshipStatus === "PENDING_SENT"
                  ).length > 0 && (
                    <div>
                      <h3 className="text-md font-medium mb-2 text-blue-900">
                        Sent Requests
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {streamers
                          .filter((s) => s.friendshipStatus === "PENDING_SENT")
                          .map((streamer) => (
                            <motion.div
                              key={streamer.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 border rounded-lg flex items-center gap-2 bg-white"
                            >
                              <img
                                src={streamer.avatar || "/default-avatar.png"}
                                alt={streamer.username}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/default-avatar.png";
                                }}
                              />
                              <div className="flex-grow font-medium text-blue-900">
                                {streamer.username}
                              </div>
                              <div className="text-sm text-blue-600">
                                Pending
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="blocked">
            <div className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <h2 className="text-lg font-medium mb-4 text-blue-900">
                Blocked Users
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : !streamers.filter((s) => s.friendshipStatus === "BLOCKED")
                  .length ? (
                <p className="text-center py-8 text-blue-600">
                  No blocked users.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {streamers
                    .filter((s) => s.friendshipStatus === "BLOCKED")
                    .map((streamer) => (
                      <motion.div
                        key={streamer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg flex items-center gap-3 bg-white"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="text-gray-400">
                            {streamer.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-blue-900">
                            {streamer.username}
                          </div>
                          <div className="text-sm text-blue-600 truncate">
                            {streamer.bio || "No bio available"}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(streamer.id, "unblock")}
                        >
                          Unblock
                        </Button>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StreamerHub;
