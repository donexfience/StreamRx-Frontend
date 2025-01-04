import {
  Accessibility,
  Camera,
  ChevronDown,
  X,
  Globe,
  Lock,
  User,
  Loader2,
} from "lucide-react";
import React, { memo, useCallback, useEffect, useState } from "react";
import NotificationBanner from "../notificationBanners/NotificationBanner";
import { MdSecurity } from "react-icons/md";
import CategorySelector from "../formFields/CategorySelector";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { useCreateStreamerRequestMutation } from "@/redux/services/user/userApi";
import toast from "react-hot-toast";
import { getUserFromCookies } from "@/app/lib/action/auth";

interface StreamerRequestInterface {
  onClose: () => void;
}

interface FormData {
  channelProfileImageURL: string | null;
  email: string;
  category: string[];
  channelName: string;
  experience: string;

  message: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    youtube: string;
  };
  accessibility: string;
}

interface InputWithIconProps {
  icon: React.ElementType;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (field: keyof FormData, value: any) => void;
  name: keyof FormData;
}

interface ChannelTypeProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  selected: boolean;
}

interface ChannelAccessProps {
  value: string;
  onChange: (field: keyof FormData, value: any) => void;
  error?: string;
}

export interface FormErrors {
  channelProfileImageURL?: string;
  category?: string;
  channelName?: string;
  experience?: string;
  message?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  accessibility?: string;
}

const StreamerRequest: React.FC<StreamerRequestInterface> = ({ onClose }) => {
  const [users, setUsers] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      console.log(decodeUser, "decoded user");
      setUsers(decodeUser.user);

      setFormData((prev: any) => ({
        ...prev,
        email: decodeUser?.user?.email.toString(),
      }));
      console.log(decodeUser?.user?.email, "decoded user");
    };
    fetchData();
  }, []);
  console.log(users?.email, "user in the head");
  const [createStreamerRequest] = useCreateStreamerRequestMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    channelProfileImageURL: null,
    email: "",
    category: [],
    channelName: "",
    message: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      youtube: "",
    },
    experience: "",
    accessibility: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const ChannelTypeOption: React.FC<ChannelTypeProps> = ({
    icon: Icon,
    label,
    selected,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg ${
        selected ? "bg-blue-50" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          selected ? "bg-blue-100" : "bg-gray-100"
        }`}
      >
        <Icon
          size={20}
          className={selected ? "text-blue-600" : "text-gray-600"}
        />
      </div>
      <span
        className={`flex-1 ${
          selected ? "text-blue-600 font-medium" : "text-gray-700"
        }`}
      >
        {label}
      </span>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
      )}
    </div>
  );

  const InputWithIcon: React.FC<InputWithIconProps> = ({
    icon: Icon,
    label,
    placeholder,
    value,
    onChange,
    name,
  }) => (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon size={16} className="text-gray-600" />
          </div>
        </div>
        <input
          className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        />
      </div>
    </div>
  );

  const ChannelAccessibilitySelect: React.FC<ChannelAccessProps> = ({
    value,
    onChange,
    error,
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
      { id: "public", icon: Globe, label: "Public Channel" },
      { id: "private", icon: Lock, label: "Private Channel" },
      { id: "personal", icon: User, label: "Only For Me" },
    ];

    return (
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Channel Accessibility
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full bg-white border ${
              error ? "border-red-500" : "border-gray-200"
            } rounded-lg p-3 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              {value &&
                options.find((opt) => opt.id === value)?.icon &&
                React.createElement(
                  options.find((opt) => opt.id === value)!.icon,
                  {
                    size: 20,
                    className: "text-gray-600",
                  }
                )}
              <span className="flex justify-center items-center gap-2">
                {options.find((opt) => opt.id === value)?.label || (
                  <div className="w-full flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <MdSecurity size={16} className="text-gray-600" />
                    </div>
                    <h1 className="text-gray-500">selected accessibility</h1>
                  </div>
                )}
              </span>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transform transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {errors && (
            <p className="text-red-500 text-sm mt-1">{errors.accessibility}</p>
          )}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="p-1">
                {options.map((option) => (
                  <ChannelTypeOption
                    key={option.id}
                    icon={option.icon}
                    label={option.label}
                    selected={value === option.id}
                    onClick={() => {
                      onChange("accessibility", option.id);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 0:
        if (!formData.channelName.trim()) {
          newErrors.channelName = "Channel name is required";
        } else if (formData.channelName.length < 3) {
          newErrors.channelName = "Channel name must be at least 3 characters";
        }

        if (!formData.accessibility) {
          newErrors.accessibility = "Please select channel accessibility";
        }

        if (!formData.experience.trim()) {
          newErrors.experience = "Channel description is required";
        } else if (formData.experience.length < 20) {
          newErrors.experience = "Description must be at least 20 characters";
        }
        break;

      case 1:
        if (
          !Array.isArray(formData.category) ||
          formData.category.length === 0
        ) {
          newErrors.category = "Please select at least one category";
        }

        if (!formData.experience.trim()) {
          newErrors.experience = "Streaming experience is required";
        }
        const urlPattern =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

        const filledSocialLinks = Object.entries(formData.socialLinks).filter(
          ([_, url]) => url.trim().length > 0
        );

        if (filledSocialLinks.length > 0) {
          if (!newErrors.socialLinks) newErrors.socialLinks = {};

          filledSocialLinks.forEach(([platform, url]) => {
            if (!urlPattern.test(url)) {
              newErrors.socialLinks![
                platform as keyof FormData["socialLinks"]
              ] = `Please enter a valid ${platform} URL`;
            }
          });
        }
        console.log("Form data:", formData);
        console.log("Validation errors:", newErrors);
        break;

      case 2:
        if (!formData.message.trim()) {
          newErrors.message = "Additional information is required";
        } else if (formData.message.length < 50) {
          newErrors.message = "Please provide at least 50 characters";
        }
        break;
    }

    setErrors(newErrors);
    const hasSocialLinksErrors =
      newErrors.socialLinks && Object.keys(newErrors.socialLinks).length > 0;

    const hasOtherErrors =
      Object.keys(newErrors).filter((key) => key !== "socialLinks").length > 0;

    return !hasOtherErrors && !hasSocialLinksErrors;
  };
  const handleInputChange = (field: keyof FormData, value: any) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleCategoryChange = (selectedCategories: string[]) => {
    setFormData((prev: any) => ({
      ...prev,
      category: selectedCategories,
    }));
  };

  const handleSocialLinksChange = (
    field: keyof FormData["socialLinks"],
    value: string
  ) => {
    setErrors((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: undefined,
      },
    }));

    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

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
      <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4 shadow-md">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 16V7a4 4 0 014-4h10a4 4 0 014 4v9m-4-3a4 4 0 10-8 0 4 4 0 008 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-700">Profile Picture</h3>
          <p className="text-sm text-gray-500">
            Upload or update your channel profile picture
          </p>
        </div>
        <div className="relative">
          <div className="relative w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
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
            className="absolute -bottom-2 left-0 right-0 mx-auto text-center mt-2 px-4 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Update"}
          </label>
        </div>
      </div>
    )
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsSubmitting(true);
        const imageUrl = await uploadToCloudinary(file);
        console.log(imageUrl, "image link");
        formData.channelProfileImageURL = imageUrl;
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const handleSumbit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createStreamerRequest({ data: formData }).unwrap();
      if (response.success) {
        onClose();
        toast.success("Application submitted successfully!");
      } else {
        toast.error(
          response?.message || "Submission failed. Please try again."
        );
      }
    } catch (error) {
      toast.error("An error occurred while submitting your application");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const steps = [
    {
      title: "Streamer Application",
      subtitle: "Submit your application to become a streamer.",
      content: (
        <div className="space-y-6">
          {/* <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Camera className="text-gray-400" size={24} />
              </div>
              <div>
                <h3 className="font-medium">Upload Channel Banner</h3>
                <p className="text-gray-500 text-sm">
                  Upload a banner for your streaming channel
                </p>
              </div>
            </div> */}
          <ProfilePictureSection
            profileImageURL={formData.channelProfileImageURL}
            isSubmitting={isSubmitting}
            onImageUpload={handleImageUpload}
          />

          <NotificationBanner message="Please provide the correct information because admin needs to verify that." />

          <div className="grid grid-cols-2 gap-6">
            {/* <InputWithIcon
              icon={User}
              label="Channel Name"
              placeholder="Enter your channel name"
              value={formData.channelName}
              onChange={handleInputChange}
              name="channelName"
            /> */}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                channel Name
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                </div>
                <input
                  className={`w-full pl-14 pr-4 py-3 border ${
                    errors.channelName ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 ${
                    errors.channelName
                      ? "focus:ring-red-500"
                      : "focus:ring-blue-500"
                  }`}
                  placeholder="Channel name"
                  value={formData.channelName}
                  onChange={(e) =>
                    handleInputChange("channelName", e.target.value)
                  }
                />
              </div>
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.channelName}
                </p>
              )}
            </div>

            <ChannelAccessibilitySelect
              value={formData.accessibility}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short description about your channel
            </label>
            <textarea
              className={`w-full px-4 py-2 border ${
                errors.experience ? "border-red-500" : "border-gray-200"
              } rounded-lg focus:outline-none focus:ring-2 ${
                errors.experience ? "focus:ring-red-500" : "focus:ring-blue-500"
              } min-h-[100px]`}
              placeholder="Tell us about your streaming experience..."
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
            />
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1">{errors.experience}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Streaming Details",
      subtitle: "Tell us about your streaming experience and plans.",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <CategorySelector
              selectedCategories={formData.category}
              onCategoryChange={handleCategoryChange}
              errors={errors}
              setErrors={setErrors}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Streaming Experience
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Tell us about your streaming experience..."
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Media Links
            </label>
            <div className="space-y-3">
              {Object.entries(formData.socialLinks).map(([platform, value]) => (
                <div key={platform} className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        {platform === "twitter" ? (
                          <Globe size={16} className="text-gray-600" />
                        ) : platform === "instagram" ? (
                          <Camera size={16} className="text-gray-600" />
                        ) : (
                          <User size={16} className="text-gray-600" />
                        )}
                      </div>
                    </div>
                    <input
                      className={`w-full pl-14 pr-4 py-3 border ${
                        errors.socialLinks?.[
                          platform as keyof FormData["socialLinks"]
                        ]
                          ? "border-red-500"
                          : "border-gray-200"
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        errors.socialLinks?.[
                          platform as keyof FormData["socialLinks"]
                        ]
                          ? "focus:ring-red-500"
                          : "focus:ring-blue-500"
                      }`}
                      placeholder={`${
                        platform.charAt(0).toUpperCase() + platform.slice(1)
                      } Link`}
                      value={value}
                      onChange={(e) =>
                        handleSocialLinksChange(
                          platform as keyof FormData["socialLinks"],
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {errors.socialLinks?.[
                    platform as keyof FormData["socialLinks"]
                  ] && (
                    <p className="text-red-500 text-sm">
                      {
                        errors.socialLinks[
                          platform as keyof FormData["socialLinks"]
                        ]
                      }
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Additional Information",
      subtitle: "Add any extra details to support your application.",
      content: (
        <div className="space-y-2">
          <textarea
            className={`w-full px-4 py-2 border ${
              errors.message ? "border-red-500" : "border-gray-200"
            } rounded-lg focus:outline-none focus:ring-2 ${
              errors.message ? "focus:ring-red-500" : "focus:ring-blue-500"
            } min-h-[150px] resize-none`}
            placeholder="Add any additional information about your streaming plans..."
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            maxLength={500}
          />
          {errors.message && (
            <p className="text-red-500 text-sm">{errors.message}</p>
          )}
          <div className="text-xs text-gray-400 text-right">
            {formData.message.length}/500 characters
          </div>
        </div>
      ),
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        <div className="relative p-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>

          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Camera className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-500">{steps[currentStep].subtitle}</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 h-1 rounded-full mb-6">
            <div
              className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mb-6">{steps[currentStep].content}</div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 flex-1 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex-1 hover:bg-indigo-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSumbit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex-1 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? "submitting.." : "Submit Applications"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerRequest;
