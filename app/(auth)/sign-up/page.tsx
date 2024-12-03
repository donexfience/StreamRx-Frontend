"use client";
import { credentialsSignup } from "@/app/lib/action/auth";
import { useRegistrationStatusQuery } from "@/redux/services/auth/graphqlAuthApi";
import { error } from "console";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RegistrationFormData {
  email: string;
  password: string;
  username: string;
  dateOfBirth: string;
  phoneNumber: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  username?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  general?: string;
}

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    password: "",
    username: "",
    dateOfBirth: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const { data: registrationStatusData, isLoading: isStatusLoading } =
    useRegistrationStatusQuery(
      { email: formData.email },
      { skip: !formData.email }
    );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await credentialsSignup(formData);
      console.log(response, "kiit mwone login pageil");
      if (response.success) {
        switch (response.status) {
          case "pending":
            console.log("hello");
            router.push(
              `/otp-verification?email=${encodeURIComponent(formData.email)}`
            );
            break;
          case "Already Started":
            console.log("hello2");
            router.push(
              `/otp-verification?email=${encodeURIComponent(formData.email)}`
            );
            break;
          default:
            setErrors({ general: response.message || "Registration failed" });
        }
      } else {
        if (response.errors) {
          setErrors(response.errors);
        } else {
          setErrors({ general: response.message || "Registration failed" });
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ general: "An unexpected error occurred" });
    }
  };
  useEffect(() => {
    console.log(registrationStatusData, "gggggggggggggggggggggggggggggggg");
    if (!isStatusLoading && registrationStatusData?.data?.registrationStatus) {
      const status = registrationStatusData.data.registrationStatus.status;
      console.log(status, "status page load");
      switch (status) {
        case "pending_verification":
          router.push(
            `/otp-verification?email=${encodeURIComponent(formData.email)}`
          );
          break;
        case "verified":
          router.push("/dashboard");
          break;
        case "expired":
          setErrors({ general: "Registration expired. Please start again." });
          break;
        case "max_attempts_reached":
          setErrors({ general: "Maximum verification attempts reached" });
          break;
        default:
          console.warn("Unknown status:", status);
      }
    }
  }, [registrationStatusData, isStatusLoading, router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/dashboard" });
      if (result?.error) {
        toast.error("Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("An unexpected error occurred during Google login");
    }
  };

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
              "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 5%, rgba(99, 102, 241, 0) 90%)",
            transform: "scale(1.2)",
          }}
        />
        <h2 className="text-white text-2xl font-semibold text-center mb-6">
          StreamRx
        </h2>
        <h2 className="text-white text-xl font-semibold text-center mb-6">
          Sign in to your account
        </h2>

        {/* Card Content */}
        <div
          style={{ backgroundColor: "#000009" }}
          className="relative backdrop-blur-xl z-10 rounded-3xl p-10 w-[32rem] max-w-2xl min-h-[600px]"
        >
          {/* Background Image */}
          <img
            className="absolute w-full object-fill opacity-70 top-[50%] pointer-events-none"
            src="/assets/register/gradient.png"
            alt="Background"
          />

          <div className="space-y-6">
            {/* Google Sign In */}
            <button
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg py-3 px-4 transition-colors"
              onClick={handleGoogleLogin}
            >
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
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block  text-white font-bold mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block  text-white font-bold mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your streamer name"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block  text-white font-bold mb-2">
                  Date of birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="Enter your date of birth"
                  style={{ backgroundColor: "#01010C" }}
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block  text-white font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ backgroundColor: "#01010C" }}
                  placeholder="Enter your password"
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block  text-white font-bold mb-2">
                  Phonenumber
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{ backgroundColor: "#01010C" }}
                  placeholder="Enter your number"
                  className="w-full border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
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
