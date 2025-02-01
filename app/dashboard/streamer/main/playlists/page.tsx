"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MoreVertical,
  Play,
  Edit2,
  Trash,
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

const PlaylistPage: React.FC = () => {
  const router = useRouter();
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [OpenModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
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

  const {
    data,
    error: playlistError,
    refetch: refetch,
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

  // Debug logging

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
      // Optional: Show a toast or alert that playlist is empty
      alert("This playlist has no videos.");
    }
  };

  const playlists: any = data?.data ?? [];

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
            <button
              className="px-4 py-2 rounded-lg bg-black text-white"
              onClick={handleClickOpenModal}
            >
              + New Playlist
            </button>
            <Button
              variant="outline"
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Date Range
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              By Visibility
            </Button>
          </div>
        </div>
        {OpenModal && (
          <PlaylistCreationModal
            onClose={handleClickOpenModal}
            isOpen={OpenModal}
            refetch={refetch}
          />
        )}
        {editModalOpen && selectedPlaylist && (
          <EditPlaylistModal
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
    </div>
  );
};

export default PlaylistPage;
