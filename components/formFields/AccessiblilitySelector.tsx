"use client";
import React, { useState } from "react";
import { FormErrors } from "../modals/StreamerRequset";

interface AccessiblilityProps {
  setSelectedOption: (option: string) => void;
  selectedOption: string;
  errors?: FormErrors;
  setErrors: any;
}
const AccessiblilitySelector: React.FC<AccessiblilityProps> = ({
  setSelectedOption,
  selectedOption,
}) => {
  const options = [
    {
      value: "blank",
      title: "Public",
      description: "Anyone can view your channel and its content.",
      icon: "+",
    },
    {
      value: "employee",
      title: "Private",
      description:
        "Only invited members can view your channel and its content.",
      icon: "👨‍💼",
    },
    {
      value: "contractor",
      title: "Only for me",
      description: "Only you can view your channel and its content.",
      icon: "📄",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center  bg-white">
      <h1 className="text-2xl font-bold mb-2">Select channel Type</h1>
      <p className="text-gray-500 mb-8">
        we want to protect your privacy and data. Please select the type of
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => setSelectedOption(option.value)}
            className={`cursor-pointer border-2 rounded-lg p-6 flex flex-col items-center justify-center text-center ${
              selectedOption === option.value
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
          >
            <div className="text-4xl mb-4">{option.icon}</div>
            <h3 className="font-semibold text-lg">{option.title}</h3>
            <p className="text-gray-500 text-sm">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessiblilitySelector;
