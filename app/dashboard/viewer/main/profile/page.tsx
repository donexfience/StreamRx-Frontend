"use client";
import { getUser, uploadToCloudinary } from "@/app/lib/action/user";
import { APIUserResponse, UserProfile } from "@/types/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { useFormik } from "formik";

interface FormValues {
  email: string;
  username: string;
  bio: string;
  dateOfBirth: string;
  profilePicture: string | null;
  tags: string[];
  socialLinks: { platform: string; url: string }[];
  phonenumber: string;
}

// Memoized Input Component
const InputField = memo(
  ({ label, ...props }: { label: string; [key: string]: any }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
      />
    </div>
  )
);

// Memoized TextArea Component
const TextArea = memo(
  ({ label, ...props }: { label: string; [key: string]: any }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition min-h-[100px]"
      />
    </div>
  )
);

// Memoized Profile Picture Section
const ProfilePictureSection = memo(
  ({
    profilePicture,
    isSubmitting,
    onImageUpload,
  }: {
    profilePicture: string | null;
    isSubmitting: boolean;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Profile Picture</h3>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
          <img
            src={profilePicture || "/assets/avathar/avatar.png"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          id="profilePictureUpload"
          disabled={isSubmitting}
        />
        <label
          htmlFor="profilePictureUpload"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
        >
          Update Profile Picture
        </label>
      </div>
    </div>
  )
);

// Memoized Social Links Section
const SocialLinksSection = memo(
  ({
    socialLinks,
    newPlatform,
    newUrl,
    onNewPlatformChange,
    onNewUrlChange,
    onAddLink,
    onRemoveLink,
  }: {
    socialLinks: { platform: string; url: string }[];
    newPlatform: string;
    newUrl: string;
    onNewPlatformChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNewUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddLink: () => void;
    onRemoveLink: (index: number) => void;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Social Media</h3>
      <div className="space-y-4">
        {socialLinks.map((link, index) => (
          <div key={index} className="flex gap-4 items-center">
            <input
              type="text"
              value={link.platform}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-700 text-gray-400 rounded-md border border-gray-700"
            />
            <input
              type="text"
              value={link.url}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-700 text-gray-400 rounded-md border border-gray-700"
            />
            <button
              type="button"
              onClick={() => onRemoveLink(index)}
              className="p-2 text-red-500 hover:text-red-400 transition"
            >
              Remove
            </button>
          </div>
        ))}
        <div className="flex gap-4">
          <input
            type="text"
            value={newPlatform}
            onChange={onNewPlatformChange}
            placeholder="Platform (e.g., Twitter)"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
          <input
            type="text"
            value={newUrl}
            onChange={onNewUrlChange}
            placeholder="URL"
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
          <button
            type="button"
            onClick={onAddLink}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
);

// Memoized Tags Section
const TagsSection = memo(
  ({
    tags,
    inputTag,
    onInputTagChange,
    onAddTag,
    onRemoveTag,
  }: {
    tags: string[];
    inputTag: string;
    onInputTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddTag: () => void;
    onRemoveTag: (tag: string) => void;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Tags</h3>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-800 text-white rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="text-gray-400 hover:text-white transition"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputTag}
            onChange={onInputTagChange}
            className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
            placeholder="Add a tag"
            maxLength={20}
          />
          <button
            type="button"
            onClick={onAddTag}
            disabled={tags.length >= 5}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Tag
          </button>
        </div>
        <p className="text-sm text-gray-400">
          You can add up to 5 tags ({5 - tags.length} remaining)
        </p>
      </div>
    </div>
  )
);

// Memoized Profile Content
const ProfileContent = memo(
  ({
    formik,
    isLoading,
    isSubmitting,
    inputTag,
    setInputTag,
    newPlatform,
    setNewPlatform,
    newUrl,
    setNewUrl,
    handleImageUpload,
    handleAddTag,
    handleRemoveTag,
    handleAddSocialLink,
    handleRemoveSocialLink,
  }: {
    formik: any;
    isLoading: boolean;
    isSubmitting: boolean;
    inputTag: string;
    setInputTag: (value: string) => void;
    newPlatform: string;
    setNewPlatform: (value: string) => void;
    newUrl: string;
    setNewUrl: (value: string) => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddTag: () => void;
    handleRemoveTag: (tag: string) => void;
    handleAddSocialLink: () => void;
    handleRemoveSocialLink: (index: number) => void;
  }) => {
    const handleNewPlatformChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlatform(e.target.value);
      },
      [setNewPlatform]
    );

    const handleNewUrlChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewUrl(e.target.value);
      },
      [setNewUrl]
    );

    const handleInputTagChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputTag(e.target.value);
      },
      [setInputTag]
    );

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <ProfilePictureSection
            profilePicture={formik.values.profilePicture}
            isSubmitting={isSubmitting}
            onImageUpload={handleImageUpload}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Profile Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Date of Birth"
                type="date"
                {...formik.getFieldProps("dateOfBirth")}
              />
              <InputField
                label="Username"
                type="text"
                {...formik.getFieldProps("username")}
                placeholder="Enter username"
              />
            </div>
            <TextArea
              label="Bio"
              {...formik.getFieldProps("bio")}
              placeholder="Tell us about yourself"
            />
          </div>

          <SocialLinksSection
            socialLinks={formik.values.socialLinks}
            newPlatform={newPlatform}
            newUrl={newUrl}
            onNewPlatformChange={handleNewPlatformChange}
            onNewUrlChange={handleNewUrlChange}
            onAddLink={handleAddSocialLink}
            onRemoveLink={handleRemoveSocialLink}
          />

          <TagsSection
            tags={formik.values.tags}
            inputTag={inputTag}
            onInputTagChange={handleInputTagChange}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    );
  }
);

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputTag, setInputTag] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const tabs = [
    { id: "profile", name: "Profile" },
    { id: "stream", name: "Likes and watch history" },
    { id: "security", name: "Security" },
    { id: "preferences", name: "Preferences" },
    { id: "notifications", name: "Notifications" },
  ];

  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      bio: "",
      dateOfBirth: "",
      profilePicture: null as string | null, 
      tags: [] as string[], 
      socialLinks: [] as { platform: string; url: string }[], 
      phonenumber: "",
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error("Failed to update profile");
        }

        alert("Profile updated successfully!");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.error("No user found in localStorage");
          return;
        }

        const userParsed = JSON.parse(storedUser);
        const result = await getUser(userParsed.email);

        if (result.success && result.data) {
          formik.setValues({
            email: result.data.email || "",
            username: result.data?.username || "",
            bio: result.data.bio || "",
            dateOfBirth: result.data.date_of_birth || "",
            profilePicture: result.data.profileImageURL,
            tags: Array.isArray(result.data.tags) ? result.data.tags : [],
            socialLinks: Array.isArray(result.data.social_links)
              ? result.data.social_links.map((link: any) => ({
                  platform: link.platform || "",
                  url: link.url || "",
                }))
              : [],
            phonenumber: result.data.phone_number || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsSubmitting(true);
        const imageUrl = await uploadToCloudinary(file);
        formik.setFieldValue("profilePicture", imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formik]
  );

  const handleAddTag = useCallback(() => {
    if (inputTag && formik.values.tags.length < 5) {
      formik.setFieldValue("tags", [...formik.values.tags, inputTag]);
      setInputTag("");
    }
  }, [inputTag, formik.values.tags]);

  const handleAddSocialLink = useCallback(() => {
    if (newPlatform && newUrl) {
      formik.setFieldValue("socialLinks", [
        ...formik.values.socialLinks,
        { platform: newPlatform, url: newUrl },
      ]);
      setNewPlatform("");
      setNewUrl("");
    }
  }, [newPlatform, newUrl, formik.values.socialLinks]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      formik.setFieldValue(
        "tags",
        formik.values.tags.filter((tag: string) => tag !== tagToRemove)
      );
    },
    [formik.values.tags]
  );

  const handleRemoveSocialLink = useCallback(
    (index: number) => {
      formik.setFieldValue(
        "socialLinks",
        formik.values.socialLinks.filter((_: any, i: number) => i !== index)
      );
    },
    [formik.values.socialLinks]
  );

  return (
    <div className="min-h-screen bg-black w-full">
      <div className="border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white p-6">Settings</h1>
        <nav className="flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-1 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              } transition-colors duration-200`}
            >
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-6">
        {activeTab === "profile" && (
          <ProfileContent
            formik={formik}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            inputTag={inputTag}
            setInputTag={setInputTag}
            newPlatform={newPlatform}
            setNewPlatform={setNewPlatform}
            newUrl={newUrl}
            setNewUrl={setNewUrl}
            handleImageUpload={handleImageUpload}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            handleAddSocialLink={handleAddSocialLink}
            handleRemoveSocialLink={handleRemoveSocialLink}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
