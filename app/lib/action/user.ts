"use server";

import { store } from "@/redux/store";
import { httpUserApi } from "@/redux/services/user/userApi";
export async function getUser(email: string) {
  if (!email) {
    return {
      success: false,
      message: "Email is required",
    };
  }
  try {
    console.log("hello in the server action");
    const response = await store.dispatch(
      httpUserApi.endpoints.getUser.initiate({ email })
    );
    console.log(response, "response from backend");
    if (response.error) {
      return { success: false, message: "Failed to fetch user data" };
    }
    console.log(response.data, "user got");
    return { success: true, data: response.data?.user };
  } catch (error: any) {
    console.error("Error during user fetch:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

interface UserProfile {
  email: string;
  username: string;
  bio: string;
  dateOfBirth: string;
  profileImageURL: string | null;
  tags: string[];
  socialLinks: { platform: string; url: string }[];
  phonenumber: string;
}

export async function updateProfile(values: UserProfile, email: string) {
  if (!values) {
    return {
      success: false,
      message: "values required",
    };
  }
  try {
    console.log("hello in the server action of user update");
    const response = await store.dispatch(
      httpUserApi.endpoints.updateUser.initiate({ email, data: values })
    );
    console.log(response, "response from backend after user uddate");
    if (response.error) {
      return { success: false, message: "Failed to fetch user data" };
    }
    console.log(response.data, "user got");
    return { success: true, data: response.data?.user };
  } catch (error: any) {
    console.error("Error during user fetch:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "profile_pic");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};
