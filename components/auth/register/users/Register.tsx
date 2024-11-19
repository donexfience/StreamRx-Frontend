import React from "react";

const SignupPage = () => {
  return (
    <div
      style={{ backgroundColor: "#01010C" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      {/* Card Container with Glow Effect */}
      <div className="relative">
        {/* Glow Effect */}
        <div
          className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 5%, rgba(99, 102, 241, 0) 70%)",
            transform: "scale(1.2)",
          }}
        />

        {/* Card Content */}
        <div
          style={{ backgroundColor: "#000009" }}
          className="relative backdrop-blur-xl z-10 rounded-3xl p-10 w-[24rem] max-w-2xl  min-h-[600px]"
        >
          {/* Background Image */}
          <img
            className="absolute w-full object-fill opacity-70 top-[50%] pointer-events-none"
            src="/assets/register/gradient.png"
            alt="Background"
          />
          <h2 className="text-white text-xl font-semibold text-center mb-6">
            Sign up As a Streamer
          </h2>

          <div className="space-y-6">
            {/* Google Sign In */}
            <button className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors">
              <img
                src="/api/placeholder/20/20"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-800"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-800"></div>
            </div>

            {/* Signup Form */}
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Streamer Name"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <input
                  type="date"
                  placeholder="Date of birth"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  style={{ backgroundColor: "#01010C" }}
                  placeholder="Password"
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-violet-500 hover:bg-blue-700 text-white rounded-lg py-3 px-4 font-medium transition-colors"
              >
                Sign up
              </button>
            </form>

            {/* Footer Links */}
            <div className="flex items-center gap-40 justify-between text-sm">
              <a href="#" className="text-gray-400 hover:text-white">
                New to StreamRx?
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Already have an account?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
