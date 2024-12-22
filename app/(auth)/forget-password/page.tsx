"use client";
import Link from "next/link";
import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { LockIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { useForgotPasswordMutation } from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";
import { RegisterationCookieSet } from "@/app/lib/action/auth";

const ForgetPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleEmailSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();
      console.log(response?.data);
      if (response?.data?.forgotPassword?.success) {
        await RegisterationCookieSet();
        toast.success(
          response.data?.forgotPassword.message || "OTP sent successfully!"
        );
      } else {
        toast.error(
          response.data?.forgotPassword.message ||
            "Failed to send OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('/assets/forgetPassword/otp.png')] bg-cover relative">
      <div className="w-full max-w-4xl px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)",
            backdropFilter: "blur(16px)",
          }}
          className="rounded-lg shadow-2xl p-8 sm:p-10 z-50 w-full max-w-2xl transform transition-all hover:shadow-3xl "
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
                <LockIcon
                  className="text-blue-400"
                  size={48}
                  strokeWidth={1.5}
                />
              </div>

              <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
                Forgot Password
              </h2>

              <p className="text-gray-400 mb-6 text-center max-w-md">
                Enter your registered email address, we'll send you a code to
                reset your password.
              </p>

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full max-w-md px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white 
                  focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 
                  mb-6 transition-all duration-300 hover:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                onClick={handleEmailSubmit}
                disabled={isLoading}
                className={`mb-4 w-full max-w-md px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 
                  text-white rounded-lg hover:opacity-90 transition-all duration-300 
                  shadow-xl hover:shadow-2xl active:scale-[0.98] ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
