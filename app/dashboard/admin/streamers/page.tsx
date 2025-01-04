"use client";
import React, { useState } from "react";
import {
  Bell,
  Clock,
  ArrowUpRight,
  Search,
  Grid2X2,
  Timer,
  XCircle,
} from "lucide-react";
import {
  useGetAllStreamerRequestsQuery,
  useGetStreamerRequestByIdQuery,
  useUpdateStreamerRequestMutation,
} from "@/redux/services/user/userApi";
import Pagination from "@/components/paginations/Pagination";
import { emitWarning } from "process";
import { useChangeRoleMutation } from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";

interface StreamerRequest {
  email: string;
  id: string;
  channelName: string;
  category: string[];
  experience: string;
  experiencedPlatforms: string[];
  message: string;
  socialLinks: Record<string, string>;
  accessibility: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const StreamerRequestsDashboard: React.FC = () => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );

  const [changeRole, { isLoading, isError, error }] = useChangeRoleMutation();
  const [updateUserstatus, { isLoading: isUpdating, isError: updateError }] =
    useUpdateStreamerRequestMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");

  const handleRoleChange = async (email: string): Promise<void> => {
    try {
      const { data, error } = await changeRole({
        email: email,
        role: "streamer",
      });

      const { data: updateData, error: updateError } = await updateUserstatus({
        data: { status: "approved" },
        id: selectedRequestId!,
      });
      console.log(updateData, updateError, "update data and error");
      if (error || updateError) {
        console.error("Error changing role:", error);
        return;
      }
      console.log(data, error, "got data and error");
      if (data?.data?.changeRole?.success) {
        if (updateData?.request?.status === "approved") {
          console.log("Role changed successfully", data);
          toast.success("Role changed successfully");
          refetch();
        }
      } else {
        console.error("Role change failed:", data?.data?.changeRole?.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleRejection =async (): Promise<void> => {
    try {
      const { data, error } = await updateUserstatus({
        data: { status: "rejected" },
        id: selectedRequestId!,
      });
      if (error) {
        console.error("Error changing role:", error);
        return;
      }
      if (data?.request?.status === "rejected") {
        toast.success("request rejected successfully");
        refetch();
      } else {
        console.error("Role change failed:", data?.message);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  }

  const { data: allRequests ,refetch} = useGetAllStreamerRequestsQuery<{
    data: { success: boolean; message: string; requests: StreamerRequest[] };
    error: unknown;
  }>();

  const { data: selectedRequest } = useGetStreamerRequestByIdQuery<{
    data: { success: boolean; message: string; request: StreamerRequest };
    error: unknown;
  }>({ id: selectedRequestId! }, { skip: !selectedRequestId });

  const requests = allRequests?.requests || [];
  const selectedRequestData = selectedRequest?.request;

  const filteredRequests =
    allRequests?.requests?.filter((request) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        request.channelName.toLowerCase().includes(searchLower) ||
        request.category.some((cat) =>
          cat.toLowerCase().includes(searchLower)
        ) ||
        request.accessibility.toLowerCase().includes(searchLower)
      );
    }) || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className=" bg-slate-900 min-h-screen p-6 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Streamer Requests Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5" />
          <Clock className="w-5 h-5" />
          <button className="bg-gray-100 px-4 py-2 rounded-lg font-bold">
            View More
          </button>
        </div>
      </div>
      {/* Promo Banner */}
      <div className="bg-blue-500 rounded-xl p-6 mb-8 flex justify-between items-center text-white">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-white/10 rounded">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="font-medium">
              Streamer Request Management System
            </span>
          </div>
          <p className="text-sm text-white/80">
            Manage and process streamer applications efficiently
          </p>
        </div>
        <button className="bg-white text-blue-500 px-4 py-2 rounded-lg font-bold">
          Get Started
        </button>
      </div>
      {/* Selected Request Details */}
      {selectedRequestData && (
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Channel Info Card */}
          <div className="bg-gradient-to-br from-red-600 to-blue-700 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Channel Info
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {selectedRequestData.channelName}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.isArray(selectedRequestData.category) &&
                    selectedRequestData.category.map((cat, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1 rounded-full bg-green-400"
                      >
                        {cat}
                      </span>
                    ))}
                </div>
              </div>
              <Timer className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-blue-700 rounded-xl p-6">
            <div className="space-y-4">
              {/* Experience Section */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg text-gray-600 mb-2 font-bold">
                    Experience
                  </h3>
                  <p className="text-sm text-gray-800 font-bold line-clamp-3">
                    {selectedRequestData.experience}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRequestData.experiencedPlatforms.map(
                      (platform, index) => (
                        <span
                          key={index}
                          className="text-xs bg-sky-100 px-2 py-1 rounded-full"
                        >
                          {platform}
                        </span>
                      )
                    )}
                  </div>
                </div>
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>

              {/* Social Links Section */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">
                  Social Presence
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedRequestData.socialLinks).map(
                    ([platform, link]) => (
                      <a
                        key={platform}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors group"
                      >
                        {platform.toLowerCase() === "twitter" && (
                          <svg
                            className="w-4 h-4 text-[#1DA1F2]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        )}
                        {platform.toLowerCase() === "twitch" && (
                          <svg
                            className="w-4 h-4 text-[#9146FF]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                          </svg>
                        )}
                        {platform.toLowerCase() === "youtube" && (
                          <svg
                            className="w-4 h-4 text-[#FF0000]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        )}
                        {platform.toLowerCase() === "instagram" && (
                          <svg
                            className="w-4 h-4 text-[#E4405F]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                          </svg>
                        )}
                        {![
                          "twitter",
                          "twitch",
                          "youtube",
                          "instagram",
                        ].includes(platform.toLowerCase()) && (
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        )}

                        <span className="text-xs text-white capitalize">
                          {platform}
                        </span>

                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </div>
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* Status Card */}
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600 to-blue-700 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-700  mb-2">
                  Request Status
                </h3>
                <p className="text-lg text-white/80 mb-3">
                  Accessibility: {selectedRequestData.accessibility}
                </p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      handleRoleChange(selectedRequestData.email);
                    }}
                    className="bg-green-500 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                    disabled={selectedRequestData.status === "approved"}
                  >
                    {selectedRequestData.status === "pending"
                      ? "Approve"
                      : "Approved"}
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600" onClick={(event)=>{
                    event.preventDefault();
                    handleRejection()}}>
                    Reject
                  </button>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}
      ;{/* Requests Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center p-6">
          <h3 className="font-semibold text-white ">All Streamer Requests</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests"
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-white">
              <Grid2X2 className="w-5 h-5 text-white" />
              Choose Criteria
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-300 border-b border-gray-400">
                <th className="text-left p-4 ">email</th>
                <th className="text-left p-4 ">Channel Name</th>
                <th className="text-left p-4 ">Category</th>
                <th className="text-left p-4 ">Access</th>
                <th className="text-left p-4 ">Status</th>
                <th className="text-left p-4 ">Date</th>
                <th className="text-right p-4 ">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRequests.map((request: StreamerRequest) => (
                <tr
                  key={request.id}
                  className=" cursor-pointer"
                  onClick={() => setSelectedRequestId(request.id)}
                >
                  <td className="p-4 text-white">
                    <div className="font-medium">{request.email}</div>
                  </td>
                  <td className="p-4 text-white">
                    <div className="font-medium">{request.channelName}</div>
                  </td>
                  <td className="p-4  text-white">
                    {request.category.join(", ")}
                  </td>
                  <td className="p-4  text-white">{request.accessibility}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-4  text-white">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequestId(request.id);
                      }}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6">
            <Pagination
              totalItems={currentRequests.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerRequestsDashboard;
