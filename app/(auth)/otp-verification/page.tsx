"use client";
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useVerifyRegistrationMutation,
  useRegistrationStatusQuery,
  useResendOtpMutation,
} from "@/redux/services/auth/graphqlAuthApi";
import toast from "react-hot-toast";
import CypherIcon from "/assets/otp/cyber.svg";
import { clearAuthCookie, setAuthCookies } from "@/app/lib/action/auth";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/services/auth/authSlice";
const MAX_RESEND_ATTEMPTS = 3;

const OtpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedEmail = searchParams.get("email");
  const email = encodedEmail ? decodeURIComponent(encodedEmail) : "";
  const dispatch = useDispatch();

  const [
    verifyRegistration,
    { isLoading: isVerifying, isError: isVerifyError },
  ] = useVerifyRegistrationMutation();

  const { data: registrationStatus, refetch } = useRegistrationStatusQuery(
    { email: email as string },
    { pollingInterval: 60000 }
  );
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState<number>(180);
  const [canResend, setCanResend] = useState(false);
  const [resendAttempts, setResendAttempts] = useState<number>(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const userKey = `user_${email}`;
    const storedUserData = JSON.parse(localStorage.getItem(userKey) || "{}");

    if (storedUserData?.lastResetTimestamp) {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (storedUserData.lastResetTimestamp < twentyFourHoursAgo) {
        const resetData = {
          resendAttempts: 0,
          resendTimer: 180,
          lastResetTimestamp: Date.now(),
        };
        localStorage.setItem(userKey, JSON.stringify(resetData));
        setResendAttempts(0);
        setResendTimer(180);
        setCanResend(true);
      } else {
        setResendAttempts(storedUserData.resendAttempts || 0);
        const savedTimer = storedUserData.resendTimer || 180;
        setResendTimer(savedTimer);
        setCanResend(savedTimer <= 0);
      }
    } else {
      const initialData = {
        resendAttempts: 0,
        resendTimer: 180,
        lastResetTimestamp: Date.now(),
      };
      localStorage.setItem(userKey, JSON.stringify(initialData));
    }
  }, [email]);

  // Timer logic: run only one interval at a time
  useEffect(() => {
    // Clear any existing intervals
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (resendTimer > 0 && !canResend) {
      timerIntervalRef.current = setInterval(() => {
        setResendTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerIntervalRef.current!);
            setCanResend(true);
            updateLocalStorage(0);
            return 0;
          }
          const newTimer = prevTimer - 1;
          updateLocalStorage(newTimer);
          return newTimer;
        });
      }, 1000);
    }

    // Check if the maximum verification attempts have been reached
    if (
      registrationStatus?.data.registrationStatus.attemptsRemaining !==
        undefined &&
      registrationStatus?.data?.registrationStatus.status ===
        "Maximum verification attempts reached"
    ) {
      setCanResend(false);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [resendTimer, canResend, registrationStatus]); // Add registrationStatus as a dependency

  // console.log(registrationStatus, "registeration", canResend);

  const updateLocalStorage = (newTimer: number) => {
    const userKey = `user_${email}`;
    const storedUserData = JSON.parse(localStorage.getItem(userKey) || "{}");
    const updatedUserData = {
      ...storedUserData,
      resendTimer: newTimer,
    };
    localStorage.setItem(userKey, JSON.stringify(updatedUserData));
  };

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

      if (result?.data) {
        const { accessToken, refreshToken } =
          result.data.verifyRegistration?.token!;
        await setAuthCookies(accessToken, refreshToken);
        await clearAuthCookie("registration_initiated");
        if (result.data.verifyRegistration?.user != null) {
          dispatch(
            setCredentials({ user: result.data.verifyRegistration?.user })
          );
        }
        toast.success("OTP verified successfully!");
        router.replace("/dashboard");
      }

      if (result?.errors && result.errors.length > 0) {
        result.errors.forEach((error: { message: string }) => {
          toast.error(error.message);
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleResend = async () => {
    const userKey = `user_${email}`;
    const storedUserData = JSON.parse(localStorage.getItem(userKey) || "{}");
    const userResendAttempts = storedUserData.resendAttempts || 0;

    if (userResendAttempts >= MAX_RESEND_ATTEMPTS) {
      toast.error("Maximum resend attempts reached. Please try later.");
      return;
    }

    setResendTimer(180);
    setCanResend(false);

    const newAttempts = userResendAttempts + 1;
    const updatedUserData = {
      resendAttempts: newAttempts,
      resendTimer: 180,
      lastResetTimestamp: Date.now(),
    };
    localStorage.setItem(userKey, JSON.stringify(updatedUserData));
    setResendAttempts(newAttempts);
    if (
      registrationStatus?.data.registrationStatus.attemptsRemaining !=
        undefined &&
      registrationStatus?.data?.registrationStatus.status ==
        "Maximum verification attempts reached"
    ) {
      setCanResend(false);
    }
    try {
      const result = await resendOtp({ email }).unwrap();
      console.log("resend otp result", result);
      toast.success(result.message || "A new OTP has been sent to your email.");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to resend OTP. Please try again."
      );
    }
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-[url('/assets/otp/bg.png')] bg-cover relative">
      <div className="w-full max-w-2xl px-4 sm:px-6 flex justify-center">
        <div
          style={{
            backgroundColor: "rgba(21, 22, 25, 0.65)",
            backdropFilter: "blur(16px)",
          }}
          className="rounded-2xl shadow-2xl border border-gray-700/30 z-50 w-full max-w-4xl transform transition-all hover:scale-[1.01] hover:shadow-3xl"
        >
          <div className="flex ml-4 sm:ml-9 flex-col lg:p-9 p-6">
            <div className="flex items-center justify-between w-full mb-6">
              <img src="/assets/otp/Featured icon.png" alt="Featured Icon" />
              <AiOutlineClose
                className="text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
                size={34}
                onClick={() => router.push("/")}
              />
            </div>
            <div className="mb-4">
              <p className="text-2xl text-white font-bold mb-2">
                Make the Authentication easier
              </p>
              <p className="text-gray-400">
                To authorise transactions, please scan this QR code with your
                Google Authenticator App and enter the verification code below.
              </p>
            </div>
            <div className="flex justify-center mb-6">
              <img
                src="/assets/otp/cyber.png"
                alt="Verification Process"
                className="max-w-full h-24 rounded-xl"
              />
            </div>

            <p className="mt-3 text-lg text-white font-bold mb-2">
              Verify to complete authentication
            </p>

            <p className="text-gray-500 text-sm mb-4">
              We have sent a verification code to {email}
            </p>

            <h2 className="text-3xl mt-3 text-white font-bold mb-4">
              Enter OTP
            </h2>
            <div className="max-w-lg flex space-x-2 sm:space-x-5 mt-4 mb-6 px-2 sm:px-24 justify-center">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) {
                      inputRefs.current[index] = el;
                    }
                  }}
                  type="text"
                  className="w-10 h-10 sm:w-16 sm:h-16 border bg-transparent border-gray-400 border-2 rounded-xl text-center text-xl sm:text-2xl font-medium text-white
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                    transition-all duration-300 hover:border-blue-400"
                  maxLength={1}
                  value={otp[index] || ""}
                  onChange={(e) => handleChange(index, e.target.value)}
                />
              ))}
            </div>
            <div className="flex text-white mb-6 mt-6 gap-3 items-center justify-between">
              <span className="text-white font-extrabold">
                Didn't get a code?
              </span>
              {canResend ? (
                resendAttempts < MAX_RESEND_ATTEMPTS ? (
                  <button
                    onClick={handleResend}
                    className="underline text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Click to resend
                  </button>
                ) : (
                  <span className="text-red-400 font-semibold">
                    No resends left
                  </span>
                )
              ) : (
                <span className="text-white font-bold">
                  Resend in {formatTimer(resendTimer)}
                </span>
              )}
            </div>

            <div className="flex justify-center w-full gap-4 sm:gap-6 mb-4">
              <button
                onClick={() => router.push("/")}
                className="px-8 sm:px-14 py-3 bg-gray-700 text-white hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-8 sm:px-14 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 rounded-lg disabled:opacity-50 transition-all"
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
