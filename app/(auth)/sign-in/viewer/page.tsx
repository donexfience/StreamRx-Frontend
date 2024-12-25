"use client";
import { credentialsLogin } from "@/app/lib/action/auth";
import { LoginFormSchema } from "@/app/lib/defintion";
import { useLoginMutation } from "@/redux/services/auth/graphqlAuthApi";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/redux/services/auth/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const [authError, setAuthError] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleCredentialsLogin = async () => {
    try {
      const result = await credentialsLogin({ email, password });

      if (result.success) {
        if (result.user != undefined) {
          dispatch(setCredentials({ user: result?.user }));
          localStorage.setItem("user", JSON.stringify(result.user));
        }
        toast.success("Login Successful!");

        router.replace("/dashboard");
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          toast.error(result.message);
        }
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      // toast.error("An unexpected error occurred");
    }
  };
  const handleGoogleLogin = async () => {
    const currenturl = new URL(window.location.href);
    currenturl.searchParams.delete("error");
    router.replace(currenturl.toString(), undefined);
    try {
      const result = await signIn("googleViewer", {
        callbackUrl: "/dashboard/viewer",
      }); // Redirect to the home page after login
      if (result?.error) {
        toast.error("Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("An unexpected error occurred during Google login");
    }
  };

  //method for next-auth

  // const handleSignIn = async () => {
  //   const validationResult = LoginFormSchema.safeParse({ email, password });
  //   if (!validationResult.success) {
  //     console.log("Validation failed:", validationResult.error.errors);
  //     const fieldErrors: { email?: string; password?: string } = {};
  //     validationResult.error.errors.forEach((error) => {
  //       if (error.path[0] === "email") fieldErrors.email = error.message;
  //       if (error.path[0] === "password") fieldErrors.password = error.message;
  //     });
  //     setErrors(fieldErrors);
  //     return;
  //   }
  //   console.log("Attempting login..."); // Debugging line
  //   const result = await signIn("credentials", {
  //     email,
  //     password,
  //     redirect: false,
  //   });
  //   console.log(result, "result");
  //   if (result?.error) {
  //     console.log("Login failed:", result.error);
  //     if (result.error === "CredentialsSignin") {
  //       console.log("kitti");
  //     } else {
  //       console.log("else");
  //     }
  //   }
  // };
  return (
    <div className="min-h-screen bg-black px-4 md:px-6 lg:px-8">
      <p className="text-red-400">{authError}</p>
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto pt-8 lg:pt-16">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end items-center lg:pr-8">
          <div className="relative w-full max-w-md lg:max-w-xl">
            {/* Main streaming illustration */}
            <div className="relative">
              <div className="w-60 md:w-80 lg:w-96 mx-auto">
                <img
                  src="/assets/login/main.png"
                  alt="Streaming illustration"
                  className="w-full h-auto lg:h-[450px] xl:h-[550px] object-contain"
                />
              </div>
              {/* Destination platforms with connecting lines */}
              <div className="absolute top-1/2 right-0 transform translate-x-1/2">
                {/* Add your platform icons and connecting lines here */}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col lg:pl-8 mt-28 lg:mt-28">
          <div className="max-w-md mx-auto w-full">
            {/* Heading */}
            <h1 className="text-white text-4xl lg:text-5xl font-bold mb-4">
              One live stream.
              <br />
              30+ destinations.
            </h1>

            <p className="text-gray-400 text-lg mb-8">
              Multistream & reach your audience, wherever they are.
            </p>

            {/* Sign Up Form */}
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white text-gray-800 rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:bg-gray-100 transition"
              >
                <img
                  src="/api/placeholder/20/20"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-800"></div>
                <span className="px-4 text-gray-400">
                  Or sign up with email
                </span>
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              {/* Email Input */}
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              {/* Password Input */}
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent border border-gray-800 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 bg-blue-600 text-white rounded-lg py-3 px-4 font-medium hover:bg-blue-700 transition"
                  onClick={handleCredentialsLogin}
                >
                  Login now
                </button>
                <button
                  className="flex-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg py-3 px-4 font-medium hover:bg-purple-700 transition"
                  onClick={() => router.push("/sign-in/streamer")}
                >
                  Login as a Streamer
                </button>
              </div>

              {/* Terms and Login Link */}
              <div className="text-sm text-gray-400 mt-4">
                <p>
                  By Sign In also, you agree to the Terms of Service.
                  <br />
                  You agree to receive our emails.
                </p>
                <div className="mt-4 flex justify-between">
                  <p>
                    Dont have an account?{" "}
                    <Link
                      className="underline text-white hover:text-blue-500"
                      href="/sign-up"
                    >
                      signup
                    </Link>
                  </p>

                  <Link
                    className="underline text-white hover:text-blue-500 ml-4 href='/forget-password"
                    href="/forget-password"
                  >
                    forgot password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-black mt-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between py-28 px-4 md:px-8">
          {/* Left: Copyright */}
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 StreamRx, Inc. All Rights Reserved.
          </p>

          {/* Center: Navigation Links */}
          <ul className="flex flex-wrap justify-center space-x-4 text-gray-400 text-sm mb-4 md:mb-0">
            <li>
              <a href="#" className="hover:text-blue-500">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Developers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Referral Program
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-500">
                Media Kit
              </a>
            </li>
          </ul>

          {/* Right: Social Media Icons */}
          <div className="flex space-x-4">
            <img src="/assets/Footer/List.png" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
