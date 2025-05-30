import React, { useCallback, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Settings,
  Share2,
  Calendar,
  Layout,
  ListPlus,
  Globe,
  Camera,
  User,
} from "lucide-react";
import { MdWifiChannel } from "react-icons/md";
import CategorySelector from "../formFields/CategorySelector";
import { uploadToCloudinary } from "@/app/lib/action/user";
import AccessiblilitySelector from "../formFields/AccessiblilitySelector";

// Types and Interfaces
interface ChannelData {
  channelName: string;
  category: string[];
  channelAccessibility: "public" | "private" | "unlisted";
  channelProfileImageUrl: string;
  channelBannerImageUrl: string;
  contentType: string;
  ownerEmail: string;
  schedulePreference?: "weekly" | "monthly" | "custom";
  streamSchedule?: {
    days: string[];
    times: string[];
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  integrations?: {
    youtube?: boolean;
    twitch?: boolean;
    discord?: boolean;
  };
}

interface FormErrors {
  streamDays?: string;
  channelName?: string;
  ownerEmail?: string;
  category?: string;
  channelAccessibility?: string;
  channelProfileImageUrl?: string;
  channelBannerImageUrl?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  integrations?: string;
  shedulePreference?: string;
  [key: string]: string | FormErrors["socialLinks"] | undefined;
}

interface EditChannelModalProps {
  onClose: () => void;
  onSubmit: (formData: ChannelData) => void;
  channelData: ChannelData;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({
  onClose,
  onSubmit,
  channelData,
}) => {
  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ChannelData>(channelData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const totalSteps = 5;

  // Navigation items
  const navItems = [
    { icon: <ListPlus className="h-4 w-4" />, label: "Channel Info", step: 1 },
    {
      icon: <Layout className="h-4 w-4" />,
      label: "Channel Accessibility",
      step: 2,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Channel Images",
      step: 3,
    },
    { icon: <Calendar className="h-4 w-4" />, label: "Schedule", step: 4 },
    { icon: <Share2 className="h-4 w-4" />, label: "Integration", step: 5 },
  ];

  // Form validation
  const validateForm = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.channelName.trim()) {
          newErrors.channelName = "Channel name is required";
        }
        if (!formData.category.length) {
          newErrors.category = "Please select at least one category";
        }
        break;

      case 2:
        if (!formData.channelAccessibility) {
          newErrors.channelAccessibility =
            "Please select channel accessibility";
        }
        break;

      case 3:
        if (!formData.channelProfileImageUrl) {
          newErrors.channelProfileImageUrl =
            "Channel profile image is required";
        }
        if (!formData.channelBannerImageUrl) {
          newErrors.channelBannerImageUrl = "Channel banner image is required";
        }
        break;

      case 4:
        if (!formData.schedulePreference) {
          newErrors.schedulePreference = "Please select a schedule preference";
        }
        if (!formData.streamSchedule?.days.length) {
          newErrors.streamDays = "Please select at least one streaming day";
        }
        if (formData.socialLinks) {
          const socialLinksErrors: { [key: string]: string } = {};
          Object.entries(formData.socialLinks).forEach(([platform, url]) => {
            if (url && !url.startsWith("https://")) {
              socialLinksErrors[
                platform
              ] = `${platform} URL must start with https://`;
            }
          });
          if (Object.keys(socialLinksErrors).length > 0) {
            newErrors.socialLinks = socialLinksErrors;
          }
        }
        break;

      case 5:
        if (!formData.ownerEmail.trim()) {
          newErrors.ownerEmail = "Owner email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          newErrors.ownerEmail = "Please enter a valid email address";
        }
        if (
          !Object.values(formData.integrations || {}).some((value) => value)
        ) {
          newErrors.integrations =
            "Please select at least one platform integration";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleSubmit = async () => {
    if (validateForm(currentStep)) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error("Error updating channel:", error);
        setErrors((prev) => ({
          ...prev,
          submit: "Failed to update channel. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleContinue = () => {
    const isValid = validateForm(currentStep);
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = useCallback(
    async (file: File, type: "profile" | "banner") => {
      if (!file) return;

      try {
        setIsSubmitting(true);
        const imageUrl = await uploadToCloudinary(file);
        setFormData((prev) => ({
          ...prev,
          [type === "profile"
            ? "channelProfileImageUrl"
            : "channelBannerImageUrl"]: imageUrl,
        }));
      } catch (error) {
        console.error(`Error uploading ${type} image:`, error);
        setErrors((prev) => ({
          ...prev,
          [type === "profile"
            ? "channelProfileImageUrl"
            : "channelBannerImageUrl"]: `Failed to upload ${type} image. Please try again.`,
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      await handleFileUpload(file, "profile");
    }
  };

  const handleSocialLinksChange = (
    field: keyof NonNullable<ChannelData["socialLinks"]>,
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

  // Form steps rendering (same as ChannelCreationModal but using formData state)
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="channelName">Channel Name</Label>
              <Input
                id="channelName"
                placeholder="Enter channel name..."
                value={formData.channelName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    channelName: e.target.value,
                  }))
                }
                className={errors.channelName ? "border-red-500" : ""}
              />
              {errors.channelName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.channelName}
                </p>
              )}
            </div>
            <CategorySelector
              selectedCategories={formData.category}
              onCategoryChange={(categories) =>
                setFormData((prev) => ({
                  ...prev,
                  category: categories,
                }))
              }
              errors={errors}
              setErrors={setErrors}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <AccessiblilitySelector
              errors={errors}
              setErrors={setErrors}
              selectedOption={formData.channelAccessibility}
              setSelectedOption={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  channelAccessibility: value as
                    | "public"
                    | "private"
                    | "unlisted",
                }))
              }
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="font-medium">Channel Profile Image</Label>
              <div
                className={`w-full border-2 ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-dashed"
                } p-6 rounded-lg text-center space-y-4`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formData.channelProfileImageUrl ? (
                      <img
                        src={formData.channelProfileImageUrl}
                        alt="Channel profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdWifiChannel className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "profile");
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("profileImage")?.click()
                    }
                  >
                    Change Profile Image
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label className="font-medium">Channel Banner Image</Label>
              <div
                className={`w-full border-2 ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-dashed"
                } p-6 rounded-lg text-center space-y-4`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {formData.channelBannerImageUrl ? (
                      <img
                        src={formData.channelBannerImageUrl}
                        alt="Channel banner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MdWifiChannel className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <Input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "banner");
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("bannerImage")?.click()
                    }
                  >
                    Change Banner Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Stream Schedule</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="schedulePreference">Schedule Type</Label>
                  <select
                    id="schedulePreference"
                    className="w-full mt-1 p-2 border rounded"
                    value={formData.schedulePreference}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        schedulePreference: e.target.value as
                          | "weekly"
                          | "monthly"
                          | "custom",
                      }))
                    }
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label>Stream Days</Label>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <label key={day} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.streamSchedule?.days.includes(day)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...(formData.streamSchedule?.days || []), day]
                              : formData.streamSchedule?.days.filter(
                                  (d) => d !== day
                                ) || [];
                            setFormData((prev) => ({
                              ...prev,
                              streamSchedule: {
                                ...prev.streamSchedule!,
                                days,
                              },
                            }));
                          }}
                        />
                        {day}
                      </label>
                    )
                  )}
                </div>

                <div>
                  <Label>Social Media Links</Label>
                  <div className="space-y-3">
                    {Object.entries(formData.socialLinks || {}).map(
                      ([platform, value]) => (
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
                            <Input
                              className={`w-full pl-14 pr-4 py-3 ${
                                errors.socialLinks?.[
                                  platform as keyof typeof formData.socialLinks
                                ]
                                  ? "border-red-500"
                                  : "border-gray-200"
                              }`}
                              placeholder={`${
                                platform.charAt(0).toUpperCase() +
                                platform.slice(1)
                              } Link`}
                              value={value || ""}
                              onChange={(e) =>
                                handleSocialLinksChange(
                                  platform as keyof NonNullable<
                                    ChannelData["socialLinks"]
                                  >,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {errors.socialLinks?.[
                            platform as keyof typeof formData.socialLinks
                          ] && (
                            <p className="text-red-500 text-sm">
                              {
                                errors.socialLinks[
                                  platform as keyof typeof formData.socialLinks
                                ]
                              }
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label>Platform Integrations</Label>
              <div className="space-y-4 mt-2">
                {["youtube", "twitch", "discord"].map((platform) => (
                  <label key={platform} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        formData.integrations?.[
                          platform as keyof typeof formData.integrations
                        ]
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          integrations: {
                            ...prev.integrations!,
                            [platform]: e.target.checked,
                          },
                        }))
                      }
                    />
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                ))}
              </div>
              {errors.integrations && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.integrations}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ownerEmail">Owner Email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="Enter owner email..."
                value={formData.ownerEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ownerEmail: e.target.value,
                  }))
                }
                className={errors.ownerEmail ? "border-red-500" : ""}
              />
              {errors.ownerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.ownerEmail}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl h-[80vh] mx-4 p-8 flex">
        {/* Left Sidebar */}
        <div className="w-64 border-r p-4 space-y-4 bg-gray-50">
          <div className="flex flex-col space-y-1">
            <MdWifiChannel className="text-2xl" />
            <h3 className="text-lg font-semibold">Edit Channel</h3>
            <p className="text-sm text-gray-500">
              Update your channel settings
            </p>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step)}
                className={`w-full flex items-center space-x-2 p-2 rounded-lg text-left transition-colors ${
                  currentStep === item.step
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                disabled={isSubmitting}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {navItems.find((item) => item.step === currentStep)?.label}
              </h2>
              <p className="text-sm text-gray-500">
                Update your channel settings
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-[400px]">{renderFormStep()}</div>

          {/* Error message */}
          {errors.submit && typeof errors.submit === "string" && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : currentStep === totalSteps ? (
                    "Update Channel"
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-1 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                role="progressbar"
                aria-valuenow={(currentStep / totalSteps) * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditChannelModal;
