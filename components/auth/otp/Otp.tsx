import Link from "next/link";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

const OtpPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[url('/assets/otp/bg.png')] bg-cover relative">
      <div className="w-full max-w-md px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)", // Transparent background
            backdropFilter: "blur(16px)", // Blur effect
          }}
          className="rounded-lg shadow-lg p-8 sm:p-10 z-50 w-[700px]" // Removed opacity class
        >
          <div className="flex flex-col">
            {/* Rest of the code remains the same */}
            <div className="flex gap-64 items-center justify-between w-full mb-6">
              <img src="/assets/otp/Featured icon.png" alt="Featured Icon" />
              <AiOutlineClose
                className="text-gray-500 hover:text-gray-600 cursor-pointer"
                size={34}
              />
            </div>

            {/* Content with full opacity */}
            <div className="">
              <p className="text-lg text-black font-bold mb-2">
                Set up two-author authentication
              </p>
              <p className="text-gray-600">
                To authorise transactions, please scan this QR code with your
                Google Authenticator App and enter the verification code below.
              </p>
            </div>

            {/* QR Code */}
            <div className="w-full max-w-xs pt-8 h-48 mb-8">
              <img
                src="/assets/otp/QR.png"
                alt="QR Code"
                className="w-full h-full object-contain mx-14"
              />
            </div>

            {/* OTP Entry */}
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Enter OTP
            </h2>
            <p className="text-gray-600 mb-6">
              We have shared a code to your registered email address
              robertallen@example.com
            </p>
            <div className="text-gray-600 pb-3">Verification code</div>
            <div className="flex space-x-5 mb-2">
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
              <input
                type="text"
                className="w-14 h-14 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={1}
              />
            </div>
            <p className="flex text-gray-600 mb-4">
              Didn't get a code?{" "}
              <Link href="/resend" className="underline text-blue-600">
                Click to resend
              </Link>
            </p>

            {/* Buttons */}
            <div className="justify-center flex w-full gap-4">
              <button className="px-14 py-2 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg">
                Cancel
              </button>
              <button className="px-14 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
