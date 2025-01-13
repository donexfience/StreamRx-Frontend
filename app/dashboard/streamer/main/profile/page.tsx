"use client";
import {
  getUser,
  updateProfile,
  uploadToCloudinary,
} from "@/app/lib/action/user";
import { APIUserResponse, SocialLink, UserProfile } from "@/types/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState, memo, useCallback } from "react";
import { useFormik } from "formik";
import { getUserFromCookies } from "@/app/lib/action/auth";
import * as Yup from "yup";
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/redux/services/user/userApi";

interface FormValues {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  tags: string[];
  social_links: SocialLink[];
  date_of_birth: string;
  bio: string;
  profileImageURL: string;
  phone_number: string;
}

const ProfileValidationSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .required("Username is required"),

  bio: Yup.string().max(500, "Bio must be less than 500 characters"),

  dateOfBirth: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),

  phonenumber: Yup.string().matches(
    /^\+?[\d\s-]+$/,
    "Invalid phone number format"
  ),
});

// Memoized Input Component
const InputField = memo(
  ({
    label,
    error,
    touched,
    ...props
  }: {
    label: string;
    error?: string;
    touched?: boolean;
    [key: string]: any;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        {...props}
        className={`w-full px-3 py-2  text-black rounded-md border ${
          error && touched ? "border-red-500" : "border-gray-700"
        } focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition`}
        max={30}
        min={30}
      />
      {error && touched && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
);

// Memoized TextArea Component
const TextArea = memo(
  ({
    label,
    error,
    touched,
    ...props
  }: {
    label: string;
    error?: string;
    touched?: boolean;
    [key: string]: any;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className={`w-full px-3 py-2 bg-white text-black rounded-md border ${
          error && touched ? "border-red-500" : "border-gray-700"
        } focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition min-h-[100px]`}
      />
      {error && touched && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
);

// Memoized Profile Picture Section
const ProfilePictureSection = memo(
  ({
    profileImageURL,
    isSubmitting,
    onImageUpload,
  }: {
    profileImageURL: string | null;
    isSubmitting: boolean;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-4 ">
      <h3 className="text-lg font-medium text-white">Profile Picture</h3>
      <div className="flex items-center space-x-4">
        <div className="relative w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
          {isSubmitting && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
          <img
            src={profileImageURL || "/assets/avathar/avatar.png"}
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

const SocialLinksSection = memo(
  ({
    socialLinks,
    newPlatform,
    newUrl,
    onNewPlatformChange,
    onNewUrlChange,
    onAddLink,
    onRemoveLink,
    errors,
    touched,
  }: {
    socialLinks: { platform: string; url: string }[];
    newPlatform: string;
    newUrl: string;
    onNewPlatformChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNewUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddLink: () => void;
    onRemoveLink: (index: number) => void;
    errors?: any;
    touched?: any;
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Social Media</h3>
      <div className="space-y-4">
        {socialLinks.map((link, index) => (
          <div key={index} className="space-y-2">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={link.platform}
                readOnly
                className={`flex-1 px-3 py-2 bg-white text-gray-400 rounded-md border ${
                  errors?.socialLinks?.[index]?.platform &&
                  touched?.socialLinks?.[index]?.platform
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
              />
              <input
                type="text"
                value={link.url}
                readOnly
                className={`flex-1 px-3 py-2 bg-white text-gray-400 rounded-md border ${
                  errors?.socialLinks?.[index]?.url &&
                  touched?.socialLinks?.[index]?.url
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
              />
              <button
                type="button"
                onClick={() => onRemoveLink(index)}
                className="p-2 text-red-500 hover:text-red-400 transition"
              >
                Remove
              </button>
            </div>
            {errors?.socialLinks?.[index]?.platform &&
              touched?.socialLinks?.[index]?.platform && (
                <p className="text-sm text-red-500">
                  {errors.socialLinks[index].platform}
                </p>
              )}
            {errors?.socialLinks?.[index]?.url &&
              touched?.socialLinks?.[index]?.url && (
                <p className="text-sm text-red-500">
                  {errors.socialLinks[index].url}
                </p>
              )}
          </div>
        ))}
        <div className="flex gap-4">
          <input
            type="text"
            value={newPlatform}
            onChange={onNewPlatformChange}
            placeholder="Platform (e.g., Twitter)"
            className="flex-1 px-3 py-2 bg-white text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
          />
          <input
            type="text"
            value={newUrl}
            onChange={onNewUrlChange}
            placeholder="URL"
            className="flex-1 px-3 py-2bg-white text-white rounded-md border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
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

// Updated TagsSection Component
const TagsSection = memo(
  ({
    tags,
    inputTag,
    onInputTagChange,
    onAddTag,
    onRemoveTag,
    error,
    touched,
  }: {
    tags: string[];
    inputTag: string;
    onInputTagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddTag: () => void;
    onRemoveTag: (tag: string) => void;
    error?: string;
    touched?: boolean;
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
          <div className="flex-1">
            <input
              type="text"
              value={inputTag}
              onChange={onInputTagChange}
              className={`w-full px-3 py-2 bg-white text-white rounded-md border ${
                error && touched ? "border-red-500" : "border-gray-700"
              } focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition`}
              placeholder="Add a tag"
              maxLength={20}
            />
            {error && touched && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>
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
    isSubmitting,
    sessionUser,
    inputTag,
    isUserDataLoading,
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
    isSubmitting: boolean;
    inputTag: string;
    isUserDataLoading: boolean;
    setInputTag: (value: string) => void;
    newPlatform: string;
    sessionUser: any;
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

    if (!sessionUser || isUserDataLoading) {
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
            profileImageURL={formik.values.profileImageURL}
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
                error={formik.errors.dateOfBirth}
                touched={formik.touched.dateOfBirth}
              />
              <InputField
                label="Username"
                type="text"
                {...formik.getFieldProps("username")}
                error={formik.errors.username}
                touched={formik.touched.username}
                placeholder="Enter username"
              />
            </div>
            <TextArea
              label="Bio"
              {...formik.getFieldProps("bio")}
              error={formik.errors.bio}
              touched={formik.touched.bio}
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
            errors={formik.errors}
            touched={formik.touched}
          />

          <TagsSection
            tags={formik.values.tags}
            inputTag={inputTag}
            onInputTagChange={handleInputTagChange}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            error={formik.errors.tags}
            touched={formik.touched.tags}
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
  const [updateUser] = useUpdateUserMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputTag, setInputTag] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const user = await getUserFromCookies();
        setSessionUser(user?.user);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    fetchSessionUser();
  }, []);

  const {
    data: userData,
    isLoading: isUserDataLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserQuery(
    { email: sessionUser?.email },
    {
      skip: isLoadingSession || !sessionUser?.email,
      pollingInterval: 0,
      refetchOnMountOrArgChange: true,
    }
  );

  // Add some debugging
  useEffect(() => {
    console.log("Session User:", sessionUser);
    console.log("User Data:", userData);
    console.log("Loading:", isUserDataLoading);
    console.log("Error:", userError);
  }, [sessionUser, userData, isUserDataLoading, userError]);
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
      profileImageURL: null as string | null,
      tags: [] as string[],
      socialLinks: [] as { platform: string; url: string }[],
      phonenumber: "",
    },
    validationSchema: ProfileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log(values, "before submitting");
      setIsSubmitting(true);
      try {
        // Combine existing and new data while removing duplicates
        const existingData: any = userData || {};
        const existingTags = Array.isArray(existingData.tags)
          ? existingData.tags
          : [];
        const uniqueTags = Array.from(
          new Set([...existingTags, ...values.tags])
        );

        const existingSocialLinks = Array.isArray(existingData.social_links)
          ? existingData.social_links
          : [];

        const socialLinksMap = new Map();
        [...existingSocialLinks, ...values.socialLinks].forEach((link) => {
          socialLinksMap.set(link.platform, link);
        });
        const uniqueSocialLinks = Array.from(socialLinksMap.values());
        const updatedValues = {
          ...values,
          tags: uniqueTags,
          socialLinks: uniqueSocialLinks,
        };
        const updateResult = await updateUser({
          email: sessionUser.email,
          data: updatedValues,
        });
        if (updateResult) {
          await refetchUser();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (userData) {
      formik.setValues({
        email: userData?.user?.email || "",
        username: userData?.user?.username || "",
        bio: userData?.user?.bio || "",
        dateOfBirth: userData?.user?.date_of_birth || "",
        profileImageURL: userData?.user?.profileImageURL,
        tags: Array.isArray(userData?.user?.tags) ? userData?.user?.tags : [],
        socialLinks: Array.isArray(userData?.user?.social_links)
          ? userData?.user?.social_links.map((link: any) => ({
              platform: link.platform || "",
              url: link.url || "",
            }))
          : [],
        phonenumber: userData?.user?.phone_number || "",
      });
    }
  }, [userData]);
  console.log(userData, "user data set in the formikkkkkkkkkkkkk");
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsSubmitting(true);
        const imageUrl = await uploadToCloudinary(file);
        console.log(imageUrl, "image link");
        formik.setFieldValue("profileImageURL", imageUrl);
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
      if (!formik.values.tags.includes(inputTag)) {
        formik.setFieldValue("tags", [...formik.values.tags, inputTag]);
      }
      setInputTag("");
    }
  }, [inputTag, formik.values.tags]);

  const handleAddSocialLink = useCallback(() => {
    if (newPlatform && newUrl) {
      const isDuplicate = formik.values.socialLinks.some(
        (link) => link.platform.toLowerCase() === newPlatform.toLowerCase()
      );

      if (!isDuplicate) {
        formik.setFieldValue("socialLinks", [
          ...formik.values.socialLinks,
          { platform: newPlatform, url: newUrl },
        ]);
      }
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
    <div className="min-h-screen bg-white w-full sp">
      <div className="border-b">
        <h1 className="text-2xl font-bold text-black p-6  ml-32">
          Profile Settings
        </h1>
        <nav className="flex space-x-8 px-6 overflow-x-auto ml-32">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-4 px-1 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-black"
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
            sessionUser={sessionUser}
            isSubmitting={isSubmitting}
            inputTag={inputTag}
            setInputTag={setInputTag}
            newPlatform={newPlatform}
            setNewPlatform={setNewPlatform}
            isUserDataLoading={isUserDataLoading}
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
