"use client";
import React from "react";
import { FormErrors } from "../modals/channelCreationModal";

interface AccessiblilityProps {
  setSelectedOption: (option: string) => void;
  selectedOption: string;
  errors?: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
}

const AccessiblilitySelector: React.FC<AccessiblilityProps> = ({
  setSelectedOption,
  selectedOption,
  errors,
  setErrors,
}) => {
  const options = [
    {
      value: "public",
      title: "Public",
      description: "Anyone can view your channel and its content.",
      icon: "🌎",
    },
    {
      value: "private",
      title: "Private",
      description:
        "Only invited members can view your channel and its content.",
      icon: "🔒",
    },
    {
      value: "unlisted",
      title: "Unlisted",
      description:
        "Only those with the link can view your channel and its content.",
      icon: "🔗",
    },
  ];

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    // Clear any existing accessibility errors when a valid option is selected
    setErrors((prev) => ({
      ...prev,
      channelAccessibility: undefined,
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-bold mb-2">Select Channel Type</h1>
      <p className="text-gray-500 mb-8">
        Choose how you want to share your channel with others
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleOptionSelect(option.value)}
            className={`cursor-pointer border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center ${
              selectedOption === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-4xl mb-4">{option.icon}</div>
            <h3 className="font-semibold text-lg">{option.title}</h3>
            <p className="text-gray-500 text-sm">{option.description}</p>
          </div>
        ))}
      </div>
      {errors?.channelAccessibility && (
        <p className="text-red-500 text-sm mt-4">
          {errors.channelAccessibility}
        </p>
      )}
    </div>
  );
};

export default AccessiblilitySelector;
