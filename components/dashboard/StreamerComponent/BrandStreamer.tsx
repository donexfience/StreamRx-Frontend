import Image from "next/image";
import React from "react";

const BrandStreamer = () => {
  return (
    <div className="container mx-auto py-8 overflow-x-hidden">
      {/* Brand Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex items-center justify-center gap-4">
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/companyBrandes/6.png"
          alt="Brand image 6"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/StreamerDashboard/brand1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default BrandStreamer;
