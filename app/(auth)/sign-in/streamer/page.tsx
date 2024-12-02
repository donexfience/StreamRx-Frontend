'use client'
import React, { useState, useRef } from "react";

const StreamerLogin = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white p-8 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Welcome */}
          <div className="flex flex-col items-center space-y-4 mb-8">
            <img
              src="/assets/Logos/LogoS.png"
              alt="Logo"
              className="w-11 h-12"
            />
            <h1 className="text-black font-bold text-2xl">Welcome back</h1>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors">
              <img
                src="/api/placeholder/20/20"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition-colors">
              <img
                src="/api/placeholder/20/20"
                alt="Facebook"
                className="w-5 h-5"
              />
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Login Form */}
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-lg py-3 font-medium transition-all"
            >
              Log in
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex items-center justify-between text-sm">
            <a href="#" className="text-gray-600 hover:text-blue-600">
              New to StreamRx? <span className="text-blue-600">Sign up</span>
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Forgot password?
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Video Preview */}
      <div className="lg:flex w-full bg-[url('/assets/login/Aside.png')] bg-cover bg-center lg:w-2/3 xl:w-3/4 p-8 items-center justify-center relative overflow-hidden">
        {/* Content Container */}
        <div className="relative max-w-3xl w-full space-y-8">
          {/* Video Player Preview */}
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {/* Play Button */}
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                {isPlaying ? (
                  // Pause Icon
                  <div className="flex gap-1">
                    <div className="w-2 h-8 bg-white"></div>
                    <div className="w-2 h-8 bg-white"></div>
                  </div>
                ) : (
                  // Play Icon
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                )}
              </div>
            </button>

            {/* Video */}
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-3xl"
              src="https://embed-ssl.wistia.com/deliveries/b9bacc2c4222345b70059f6ea87f077268965043.bin?disposition=attachment&filename=hero.mp4"
              autoPlay={false}
              preload="auto"
              muted
              loop
              playsInline
            />

            {/* Video Title */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-white text-2xl font-bold">
                Meet <span className="text-purple-400">Playlists</span>
              </h2>

              {/* Video Progress Bar */}
              <div className="mt-4 h-1 bg-gray-700 rounded-full">
                <div className="w-1/3 h-full bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center">
            <h3 className="text-white text-2xl font-bold mb-4">
              Introducing a new way to stream
            </h3>
            <p className="text-gray-300 text-lg">
              Merge your videos into one smooth stream and enhance it with
              dynamic graphics. With Playlists, the show goes on — even when
              you're offline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerLogin;
