"use client";

import { RootState } from "@/redux/store";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Modal } from "../modals/ProfileModall";
import { getUserFromCookies } from "@/app/lib/action/auth";
import StreamerRequset from "../modals/StreamerRequset";
import {
  useGetStreamerRequestByEmailQuery,
  useGetStreamerRequestByIdQuery,
} from "@/redux/services/user/userApi";
import { useRouter } from "next/navigation";
import { useSearchVideosQuery } from "@/redux/services/channel/videoApi";

const ViewerHead: React.FC<{}> = ({}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleModal = () => setIsOpenModal((prev) => !prev);
  const [users, setUsers] = useState<any>(null);
  const [isStreamRequestModal, setIsStreamRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { data: video } = useSearchVideosQuery({
    searchQuery: searchQuery,
  });

  console.log(video, "video got ");

  const toggleRequestModal = (request: any) => {
    if (request?.request?.status !== "rejected") {
      setIsStreamRequestModal((prev) => !prev);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/viewer/main/search?q=${encodeURIComponent(searchQuery)}`
      );
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes shine {
          to {
            left: 100%;
          }
        }

        .button-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 250px;
          height: 50px;
          background-color: #4a00e0; /* Purple background */
          color: white;
          font-weight: bold;
          font-size: 16px;
          text-transform: uppercase;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
        }

        .button-container .shine {
          position: absolute;
          top: 0;
          left: -100%; /* Starts off-screen */
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
          transform: skewX(-20deg); /* Diagonal skew */
          animation: shine 2s infinite; /* Shine animation */
        }

        .button-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      console.log(decodeUser, "decoded user");
      setUsers(decodeUser.user);
    };
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    fetchData();
  }, [isDarkMode]);

  const [currentPath, setCurrentPath] = useState("");
  const { data, error, isLoading } = useGetStreamerRequestByEmailQuery(
    { email: users?.email },
    { skip: !users?.email }
  );
  console.log(data, "streamerrequest got in header");
  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black dark:bg-white transition-all duration-500 ease-in-out">
      {/* Logo */}
      <div className="text-2xl font-bold text-white pl-4">StreamRx</div>
      <div className="flex-1 mx-8">
        <div className="relative w-full max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search for streamers, games"
            className="w-full px-4 py-2 bg-gray-800 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
            onClick={handleSearch}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <div className="relative inline-block">
          <button className="flex items-center px-4 py-2 bg-transparent text-gray-700 rounded-md  hover:bg-gray-300">
            <span className="mr-2">🌐</span>
            <span className="text-white font-bold">English</span>
            <span className="ml-2">▼</span>
          </button>
          <div className="dropdown-content absolute hidden bg-gray-200 text-gray-700 border border-gray-300 rounded-md mt-1 w-full">
            <a href="#" className="block px-4 py-2 hover:bg-gray-300">
              English
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-300">
              Hindi
            </a>
          </div>
        </div>

        <div
          className="button-container"
          onClick={() => toggleRequestModal(data)}
        >
          <div className="shine"></div>
          <div className="button-content">
            <FaUser />
            {data?.request?.status === "pending"
              ? "Request pending"
              : data?.request?.status === "rejected"
              ? "Request rejected"
              : data?.request?.status === "approved"
              ? "Request approved"
              : "Become a streamer"}
          </div>
        </div>
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg bg-gray-700 flex justify-center items-center"
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex justify-center items-center"></div>
          <h4 className="text-white font-bold" onClick={toggleModal}>
            {users?.email}
          </h4>
        </div>
      </div>
      {isModalOpen && (
        <Modal
          currentPath={currentPath}
          email={users?.email}
          username={users?.username}
          onClose={toggleModal}
        />
      )}
      {isStreamRequestModal && (
        <StreamerRequset onClose={() => toggleRequestModal(data)} />
      )}
    </header>
  );
};

export default ViewerHead;
