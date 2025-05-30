import { clearAuthCookie } from "@/app/lib/action/auth";
import Link from "next/link";
import React from "react";
import { FaUser } from "react-icons/fa";

interface ModalProps {
  onClose: () => void;
  username: string;
  email: string;
  currentPath: string;
}

export const Modal: React.FC<ModalProps> = ({
  username,
  email,
  onClose,
  currentPath,
}) => {
  const handleLogout = async () => {
    await clearAuthCookie("refreshToken");
    await clearAuthCookie("accessToken");
  };
  const handleBackgroundClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start z-50"
      onClick={handleBackgroundClick}
    >
      <div className="relative rounded-lg p-[2px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500">
        {/* Border with the gradient */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 rounded-2xl opacity-75 blur-sm z-0" />

        {/* Modal Content */}
        <div className="bg-gray-900 p-4 w-64 z-10 relative">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">M</span>
            </div>
            <div className="ml-3">
              <h3 className="text-white text-lg">{username}</h3>
              <p className="text-gray-400 text-sm font-bold">{email}</p>
            </div>
          </div>

          <div className="space-y-1">
            {currentPath === "/dashboard/viewer/main/profile/" ? (
              <div className="ml-3 flex items-center gap-4">
                <FaUser className="text-white" />
                <button
                  className="text-white"
                  onClick={() => window.history.back()}
                >
                  Back
                </button>
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-4">
                <FaUser className="text-white" />
                <Link
                  href="/dashboard/viewer/main/profile/"
                  onClick={onClose}
                  className="text-white"
                >
                  Profile
                </Link>
              </div>
            )}
            {/* Logout Option */}
            <div
              className="flex items-center text-gray-300 p-3 hover:bg-gray-800 rounded cursor-pointer"
              onClick={handleLogout}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
