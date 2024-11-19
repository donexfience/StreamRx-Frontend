import Link from "next/link";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

const ForgetPasswordPage = () => {
  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('/assets/otp/bg.png')] bg-cover relative">
      <div className="w-full max-w-4xl px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)", // Transparent background
            backdropFilter: "blur(16px)", // Blur effect
          }}
          className="rounded-lg shadow-lg p-8 sm:p-10 z-50 w-full max-w-2xl"
        >
          <div className="flex flex-col">
            <div className="flex gap-4 items-center justify-between w-full mb-6">
              <div className="flex items-center">
                <Link href="/">
                  <AiOutlineClose
                    className="text-gray-500 hover:text-gray-600 cursor-pointer"
                    size={28}
                  />
                </Link>
                <p className="text-white text-lg ml-2">Back</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Forgot Password
              </h2>
              <p className="text-gray-400 mb-6">
                Enter your registered email address, we'll send you a code to reset
                your password.
              </p>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full max-w-md px-4 py-3 bg-transparent border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-6"
              />
              <button className="w-full max-w-md px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:bg-blue-700">
                Send OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;