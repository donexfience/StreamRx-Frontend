"use client";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useVerifyRegistrationMutation,
  useRegistrationStatusQuery,
} from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";

const OtpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedEmail = searchParams.get("email");
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : "";
  const [
    verifyRegistration,
    { isLoading: isVerifying, isError: isVerifyError },
  ] = useVerifyRegistrationMutation();

  const { data: registrationStatus, refetch } = useRegistrationStatusQuery(
    { email: email as string },
    { pollingInterval: 60000 }
  );

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(180);
  const [canResend, setCanResend] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerIntervalRef.current!);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      registrationStatus?.data?.registrationStatus?.expiresIn !== undefined &&
      registrationStatus.data.registrationStatus.expiresIn <= 0
    ) {
      toast.error(
        "Session expired. Please start the registration process again."
      );
      router.push("/");
    }
  }, [registrationStatus, router]);

  const handleChange = (index: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter a complete 6-digit OTP");
      return;
    }

    try {
      const result = await verifyRegistration({
        email: email as string,
        otp: otpCode,
      }).unwrap();
      router.push("/dashboard");
    } catch (error) {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    try {
      setCanResend(false);
      setResendTimer(180);
      timerIntervalRef.current = setInterval(() => {
        setResendTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerIntervalRef.current!);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
      alert("New OTP has been sent to your email");
    } catch (error) {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('/assets/otp/bg.png')] bg-cover relative">
      <div className="w-full max-w-2xl px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)",
            backdropFilter: "blur(16px)",
          }}
          className="rounded-lg shadow-lg sm:p-8 lg:px-6 z-50 w-full max-w-4xl"
        >
          <div className="flex ml-9 flex-col lg:p-0 p-3">
            {/* Header */}
            <div className="flex gap-64 items-center justify-between w-full mb-6">
              <img src="/assets/otp/Featured icon.png" alt="Featured Icon" />
              <AiOutlineClose
                className="text-gray-500 hover:text-gray-600 cursor-pointer"
                size={34}
                onClick={() => router.push("/")} // Optional: handle close
              />
            </div>

            {/* Content */}
            <div className="">
              <p className="text-lg text-white font-bold mb-2">
                Verify to complete authentication
              </p>
              <p className="text-gray-600">
                We have sent a verification code to {email}
              </p>
            </div>

            {/* OTP Entry */}
            <h2 className="text-2xl font-semibold mb-4 mt-4 text-white">
              Enter OTP
            </h2>
            <div className="text-white pb-3">Verification code</div>
            <div className="flex space-x-5 mt-4 mb-4 lg:px-0 px-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  className="w-16 h-16 border bg-transparent border-gray-400 rounded text-center text-2xl font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              ))}
            </div>

            {/* Resend Section */}
            <p className="flex text-white mb-4 mt-3 gap-3 items-center">
              <span>Didn't get a code?</span>
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="underline text-blue-600 disabled:opacity-50"
                >
                  Click to resend
                </button>
              ) : (
                <span className="text-gray-400">
                  Resend in {formatTimer(resendTimer)}
                </span>
              )}
            </p>

            {/* Buttons */}
            <div className="justify-center flex w-full gap-4">
              <button
                onClick={() => router.push("/")}
                className="px-14 py-3 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-14 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
