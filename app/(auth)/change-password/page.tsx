"use client";
import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { MdSecurityUpdate } from "react-icons/md";
import { useChangePasswordMutation } from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

const ForgetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedToken = searchParams.get("token");
  const token = encodedToken ? decodeURIComponent(encodedToken) : "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handlePasswordSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill out both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      console.log(token, "token in the frontend");
      const response = await changePassword({
        newPassword: password,
        token: token,
      }).unwrap();
      console.log(response.data, "response in password change");

      if (response?.data?.changePassword?.success) {
        toast.success(
          response.data?.changePassword?.message ||
            "Password changed successfully!"
        );
        router.replace("/");
      } else {
        toast.error(
          response.data?.changePassword.message ||
            "Failed to change password. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('/assets/otp/bg.png')] bg-cover relative">
      <div className="w-full max-w-4xl px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)",
            backdropFilter: "blur(16px)",
          }}
          className="rounded-lg shadow-2xl p-8 sm:p-10 z-50 w-full max-w-2xl transform transition-all hover:shadow-3xl"
        >
          <div className="flex flex-col">
            <div className="flex gap-4 items-center justify-between w-full mb-6">
              <div className="flex items-center">
                <Link href="/">
                  <AiOutlineClose
                    className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                    size={28}
                  />
                </Link>
                <p className="text-white text-lg ml-2">Back</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="mb-6 bg-blue-500/20 p-4 rounded-full shadow-lg">
                <MdSecurityUpdate
                  className="text-blue-400"
                  size={48}
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
                New Password
              </h2>

              <p className="text-gray-400 mb-6 text-center max-w-md">
                Enter and confirm your new password below to reset your account.
              </p>

              <input
                type="password"
                name="password"
                placeholder="New Password"
                className="w-full max-w-md px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 
                  mb-6 transition-all duration-300 hover:border-blue-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                className="w-full max-w-md px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 
                  mb-6 transition-all duration-300 hover:border-blue-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                onClick={handlePasswordSubmit}
                disabled={isLoading}
                className={`mb-4 w-full max-w-md px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 
                  text-white rounded-lg hover:opacity-90 transition-all duration-300 
                  shadow-xl hover:shadow-2xl active:scale-[0.98] ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
