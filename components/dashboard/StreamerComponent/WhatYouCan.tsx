import React from "react";

const WhatYoucan = () => {
  const features = [
    {
      icon: "/assets/icons/company-updates.png",
      title: "Company & Industry updates",
      description:
        "Share company announcements to your community across all social platforms.",
    },
    {
      icon: "/assets/icons/interviews.png",
      title: "Interviews and Q&As",
      description:
        "Host interviews, AMA’s, and Q&A sessions in a matter of minutes.",
    },
    {
      icon: "/assets/icons/product-launches.png",
      title: "Product launches & demos",
      description:
        "Launch new products live and demonstrate how it solves your customer’s needs.",
    },
    {
      icon: "/assets/icons/flash-sales.png",
      title: "Flash Sales & promotional offers",
      description:
        "Increase customer base and revenue with limited-time offers and personalized sales.",
    },
    {
      icon: "/assets/icons/webinars.png",
      title: "Webinars, classes, & workshops",
      description:
        "Share your knowledge with the world by going live with webinars, classes, and workshops.",
    },
    {
      icon: "/assets/icons/meetups.png",
      title: "Meetups & Conferences",
      description:
        "Run live or hybrid live streaming for thousands of attendees seamlessly.",
    },
  ];

  return (
    <div className="px-6 lg:px-20 py-12">
      {/* Title */}
      <h2 className="text-center text-2xl font-bold mb-8">
        What you can do with StreamRx Studio
      </h2>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-start"
          >
            {/* Icon */}
            <img
              src={feature.icon}
              alt={feature.title}
              className="w-12 h-12 mb-4"
            />
            {/* Title */}
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            {/* Description */}
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhatYoucan;
