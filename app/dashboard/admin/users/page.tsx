"use client";

import React, { useState } from "react";
import { MoreVertical, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useBlockOrUnblockMutation,
  useUsersQuery,
} from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";
import Pagination from "@/components/paginations/Pagination";

interface User {
  id: string;
  role: string;
  username: string;
  email: string;
  isVerified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  profileImageUrl: string;
  phoneNumber: string;
  dateOfBirth?: string;
  status?: string;
  country?: string;
  watchHours?: string;
}

const AdminDashboard = () => {
  const { data: usersData, isLoading, isError, refetch } = useUsersQuery();
  const [blockOrUnblock] = useBlockOrUnblockMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);

  const handleBlockUser = async (email: string) => {
    if (!selectedUser) return;

    setIsBlocking(true);
    try {
      console.log(selectedUser.isActive);
      const result = await blockOrUnblock({
        email,
        value: !selectedUser.isActive,
      }).unwrap();

      console.log(result, "after block");
      toast.success(
        `User successfully ${selectedUser.isBlocked ? "unblocked" : "blocked"}`
      );
      refetch();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to update user");
    } finally {
      setIsBlocking(false);
      setIsModalOpen(false);
    }
  };

  const openBlockModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  console.log(usersData, "user data got ");

  const filteredUsers =
    usersData?.data?.users?.filter((user: User) => {
      const username = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return username.includes(query) || email.includes(query);
    }) || [];

  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const topCreators = filteredUsers
    .filter((user: User) => user.isVerified)
    .slice(0, 4);

  const topUsers = filteredUsers
    .filter((user: User) => user.isActive)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white p-8 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen w-full bg-slate-900 text-white p-8 flex items-center justify-center">
        Error loading users. Please try again later.
      </div>
    );
  }
  console.log(filteredUsers, "filter users in ");

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-8">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-slate-800 rounded-lg">
            <span className="text-gray-400">*</span>
          </button>
          <button className="p-2 bg-slate-800 rounded-lg">
            <span className="text-gray-400">🔔</span>
          </button>
          <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Tournament Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-slate-800 rounded-lg overflow-hidden">
            <img
              src="/assets/HowPeopleUseIt/DonexLive.png"
              alt="Battlefield 1"
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="text-sm text-red-500 mb-2">
                SEPT 02 STARTING AT 6:00 AM
              </div>
              <h3 className="text-lg font-bold mb-4">COD Warzone Tournament</h3>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <div className="text-gray-400">Prize</div>
                  <div className="flex items-center">
                    <span className="text-yellow-500">$</span>
                    <span>2500</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Team size</div>
                  <div>4 vs 4</div>
                </div>
                <div>
                  <div className="text-gray-400">Sponsor</div>
                  <div>Steam</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm">
                <th className="text-left pb-4">Client</th>
                <th className="text-left pb-4">phonenumber</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-left pb-4">role</th>
                <th className="text-left pb-4">date of birth</th>
                <th className="text-left pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user: User) => (
                <tr key={user.id} className="border-t border-slate-700">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-9 h-9 rounded-full"
                        src={
                          user.profileImageUrl
                            ? user.profileImageUrl
                            : "/assets/avathar/avatar.png"
                        }
                      ></img>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        user.isActive === true
                          ? "bg-green-900 text-green-300"
                          : user.isActive === false
                          ? "bg-red-900 text-red-300"
                          : "bg-yellow-900 text-yellow-300"
                      }`}
                    >
                      {user.isActive ? "active" : "blocked"}
                    </span>
                  </td>
                  <td>{user.role.split(".")[1]}</td>
                  <td>{user.dateOfBirth}</td>
                  <td>
                    <button
                      onClick={() => openBlockModal(user)}
                      className="text-gray-400 hover:text-white"
                      disabled={isBlocking}
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6">
            <Pagination
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Block/Unblock Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.isBlocked ? "Unblock User" : "Block User"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="mb-4">
              Are you sure you want to{" "}
              {selectedUser?.isBlocked ? "unblock" : "block"}{" "}
              {selectedUser?.username}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                disabled={isBlocking}
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedUser && handleBlockUser(selectedUser.email)
                }
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
                disabled={isBlocking}
              >
                {isBlocking
                  ? "Processing..."
                  : !selectedUser?.isActive
                  ? "Unblock"
                  : "Block"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
