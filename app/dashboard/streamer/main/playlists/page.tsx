"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MoreVertical,
  Play,
  Edit2,
  Trash,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeletePlaylistMutation,
  useGetAllPlaylistsQuery,
} from "@/redux/services/channel/plalylistApi";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { getUserFromCookies } from "@/app/lib/action/auth";
import PlaylistCreationModal from "@/components/modals/PlayListCreationModal";
import EditPlaylistModal from "@/components/modals/EditPlaylistModal";
import { useRouter } from "next/navigation";
import { deleteFromS3 } from "@/app/lib/action/s3";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateRangePicker from "@/components/filters/Date-range-picker";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PlaylistPage: React.FC = () => {
  const router = useRouter();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [filters, setFilters] = useState<any>({
    visibility: "",
    category: "",
    dateRange: { start: null, end: null },
    searchQuery: "",
  });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [OpenModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleClickOpenModal = () => {
    setOpenModal(!OpenModal);
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
  } = useGetChannelByEmailQuery(users?.email ?? "", {
    skip: !users?.email,
  });

  const [deletePlaylist] = useDeletePlaylistMutation();

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

  const {
    data,
    error: playlistError,
    refetch: refetch,
    isLoading: playlistLoading,
  } = useGetAllPlaylistsQuery(
    {
      channelId: channelData?._id ?? "",
      page: currentPage,
      limit: limit,
      filters: flattenedFilters,
    },
    {
      skip: !channelData?._id,
    }
  );

  if (channelLoading || playlistLoading) {
    return <div className="p-8 ml-32 w-full">Loading...</div>;
  }

  if (channelError || playlistError) {
    return <div className="p-8 ml-32 w-full">Error loading playlists</div>;
  }

  const handleEditPlaylist = (playlist: any) => {
    setSelectedPlaylist(playlist);
    setEditModalOpen(true);
  };

  const handleDelete = async (playlist: any) => {
    console.log(playlist, "video in the delete");
    deletePlaylist({ playlistId: playlist._id });
    refetch();
  };

  const handlePlayPlaylist = (playlist: any) => {
    if (playlist.videos && playlist.videos.length > 0) {
      const firstVideoId = playlist.videos[0].videoId._id;
      router.push(`playlists/videoes/${playlist._id}`);
    } else {
      alert("This playlist has no videos.");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev: any) => ({ ...prev, searchQuery: e.target.value }));
    refetch();
  };

  const playlists: any = data?.data ?? [];

  console.log(playlists, "playlsits got the in the forntned");

  return (
    <div className="p-8 ml-32 w-full">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Playlist Management</h1>
          <p className="text-gray-600">
            Manage all of your playlists from a single interface. Update
            visibility, add videos, track views & much more.
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-12">
            <h2 className="text-lg font-semibold">
              {playlists.length} Active Playlists
            </h2>
          </div>

          <div className="flex gap-2">
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
            <button
              className="px-4 py-2 rounded-lg bg-black text-white"
              onClick={handleClickOpenModal}
            >
              + New Playlist
            </button>
            <Select
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[180px] border-2 border-black bg-black text-white">
                <SelectValue placeholder="status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="deleted">deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Button
            className="flex items-center gap-2"
            onClick={() =>
              setFilters({
                ...filters,
                visibility: "",
                category: "",
                dateRange: { start: null, end: null },
              })
            }
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Select
            onValueChange={(value) => handleFilterChange("visibility", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="unlisted">Unlisted</SelectItem>
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
              <SelectItem value="Music">Music</SelectItem>
              <SelectItem value="Sports">Sports</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
            </SelectContent>
          </Select>
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
        </div>

        {OpenModal && (
          <PlaylistCreationModal
            onClose={handleClickOpenModal}
            channelAcessibility={channelData?.channelAccessibility}
            isOpen={OpenModal}
            refetch={refetch}
          />
        )}
        {editModalOpen && selectedPlaylist && (
          <EditPlaylistModal
            channelAcessibility={channelData?.channelAccessibility}
            refetch={refetch}
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedPlaylist(null);
            }}
            playlist={selectedPlaylist}
          />
        )}

        {playlists.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Created Date</th>
                      <th className="text-left p-4">Playlist</th>
                      <th className="text-left p-4">Videos</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Visibility</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playlists.map((playlist: any) => (
                      <tr
                        key={playlist._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          {new Date(playlist.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={playlist.thumbnailUrl}
                              alt={playlist.name}
                              className="w-12 h-8 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{playlist.name}</div>
                              <div className="text-sm text-gray-500">
                                {playlist.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{playlist.videos?.length ?? 0}</td>
                        <td className="p-4">{playlist.category}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              playlist.visibility === "public"
                                ? "bg-green-100 text-green-800"
                                : playlist.visibility === "private"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {playlist.visibility}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {playlist.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handlePlayPlaylist(playlist)}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Play
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditPlaylist(playlist)}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(playlist)}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No playlists found</p>
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
              {
                length: Math.ceil((data?.pagination?.total ?? 0) / limit),
              },
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
                  Math.ceil(playlists?.pagination?.total ?? 0 / limit)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default PlaylistPage;
