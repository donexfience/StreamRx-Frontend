"use client";

import { RootState } from "@/redux/store";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Modal } from "../modals/ProfileModall";
import { getUserFromCookies } from "@/app/lib/action/auth";

const ViewerHead: React.FC<{}> = ({}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsOpenModal] = useState(false);
  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const toggleModal = () => setIsOpenModal((prev) => !prev);
  const [users, setUsers] = useState<any>(null);

  useEffect(() => {
    // This check ensures that document is only used in the browser
    if (typeof document !== "undefined") {
      const style = document.createElement("style");
      style.textContent = `
        @keyframes shine {
          to {
            left: 100%;
          }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
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

    console.log(users, "user in the head");
    // Ensure this runs only on the client side
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    fetchData();
  }, [isDarkMode]);

  const [currentPath, setCurrentPath] = useState("");

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
          />
          <Search
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <button className="relative overflow-hidden bg-purple-600 text-white px-6 py-3 rounded-lg font-medium">
          <div className="flex items-center gap-2">
            <FaUser className="text-lg" />
            Become a streamer
          </div>
          {/* Shine effect overlay */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[25deg] animate-shine" />
          </div>
        </button>
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
    </header>
  );
};

export default ViewerHead;
