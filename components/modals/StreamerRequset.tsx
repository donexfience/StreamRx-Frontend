import {
  Accessibility,
  Camera,
  ChevronDown,
  X,
  Globe,
  Lock,
  User,
} from "lucide-react";
import React, { useState } from "react";
import NotificationBanner from "../notificationBanners/NotificationBanner";
import { MdSecurity } from "react-icons/md";
import CategorySelector from "../formFields/CategorySelector";

interface StreamerRequestInterface {
  onClose: () => void;
}

interface FormData {
  channelBannerImage: string;
  channelProfileImageURL: string | null;
  category: string;
  channelName: string;
  experience: string;
  experiencedPlatforms: string[];
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
}

const StreamerRequest: React.FC<StreamerRequestInterface> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    channelBannerImage: "",
    channelProfileImageURL: null,
    category: "",
    channelName: "",
    experience: "",
    experiencedPlatforms: [],
    message: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      youtube: "",
    },
    accessibility: "",
  });

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
            className="w-full bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const steps = [
    {
      title: "Streamer Application",
      subtitle: "Submit your application to become a streamer.",
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
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
            </div>
          </div>

          <NotificationBanner message="Please provide the correct information because admin needs to verify that." />

          <div className="grid grid-cols-2 gap-6">
            <InputWithIcon
              icon={User}
              label="Channel Name"
              placeholder="Enter your channel name"
              value={formData.channelName}
              onChange={handleInputChange}
              name="channelName"
            />
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Describe your channel..."
              value={formData.experience}
              onChange={(e) => handleInputChange("experience", e.target.value)}
            />
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
                <InputWithIcon
                  key={platform}
                  icon={
                    platform === "twitter"
                      ? Globe
                      : platform === "instagram"
                      ? Camera
                      : User
                  }
                  placeholder={`${
                    platform.charAt(0).toUpperCase() + platform.slice(1)
                  } Link`}
                  value={value}
                  onChange={(_, newValue) =>
                    handleSocialLinksChange(
                      platform as keyof FormData["socialLinks"],
                      newValue
                    )
                  }
                  name={platform as keyof FormData}
                />
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
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-none"
            placeholder="Add any additional information about your streaming plans..."
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            maxLength={500}
          />
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
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex-1 hover:bg-indigo-700"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  console.log("Form submitted:", formData);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white flex-1 hover:bg-indigo-700"
              >
                Submit Application
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerRequest;
