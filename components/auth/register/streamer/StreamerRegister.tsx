import React from "react";

const StreamerRegister = () => {
  return (
    <div className="flex min-h-screen justify-center items-center bg-[url('/assets/login/Aside.png')] relative">
      {/* Stars overlay effect */}

      <div className="flex flex-col items-center w-full max-w-md px-6">
        {/* Logo/Title */}
        <h1 className="text-white text-xl font-bold mb-6">StreamRx</h1>

        {/* Main Card */}
        <div className="w-full bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <h2 className="text-xl font-semibold text-center mb-6">
            Create your account
          </h2>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-colors text-sm">
              <img
                src="/api/placeholder/20/20"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign Up Form */}
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-medium transition-colors text-sm"
            >
              Sign Up
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-700">
                Log In
              </a>
            </p>
          </div>
        </div>

        {/* Terms Text */}
        <p className="text-gray-400 text-xs text-center mt-6 max-w-sm">
          By signing up, you agree to the Terms of Service. You also agree to
          receive emails from StreamRx.
        </p>
      </div>
    </div>
  );
};

export default StreamerRegister;
