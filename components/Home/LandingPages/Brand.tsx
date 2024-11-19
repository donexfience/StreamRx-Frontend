import Image from "next/image";
import React from "react";

const Brand = () => {
  return (
    <div className="w-full h-full py-8">
      {/* Heading */}
      <div className="flex items-center justify-center mb-6">
        <h4 className="text-white text-lg md:text-xl lg:text-2xl font-bold">
          Over 8 million happy customers
        </h4>
      </div>

      {/* Brand Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex items-center justify-center gap-4 px-4 sm:px-8 md:px-12 lg:px-20">
        <Image
          src="/assets/companyBrandes/1.png"
          alt="Brand image 1"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/companyBrandes/2.png"
          alt="Brand image 2"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/companyBrandes/3.png"
          alt="Brand image 3"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/companyBrandes/4.png"
          alt="Brand image 4"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
        <Image
          src="/assets/companyBrandes/5.png"
          alt="Brand image 5"
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
          src="/assets/companyBrandes/7.png"
          alt="Brand image 7"
          width={700}
          height={400}
          className="h-16 sm:h-20 md:h-24 lg:h-20 w-auto object-contain"
        />
      </div>
    </div>
  );
};

export default Brand;
