import React from "react";

const Footer = () => {
  return (
    <div className="px-[15%]">
      <div className="sm:block lg:flex gap-48 pb-20">
        <h1 className="text-white text-2xl font-bold">StreamRx</h1>{" "}
        <div>
          <ul className="text-white">
            <li className="text-gray-400 pb-6 pt-3">Products</li>
            <li className="pb-3 text-gray-100">studio</li>
            <li className="pb-3 text-gray-100">Multistreaming</li>
            <li className="pb-3 text-gray-100">Community</li>
            <li className="pb-3 text-gray-100">upload and stream</li>
          </ul>
        </div>
        <div>
          <ul className="text-white">
            <li className="text-gray-400 pb-6 pt-3">Products</li>
            <li className="pb-3 text-gray-100">studio</li>
            <li className="pb-3 text-gray-100">Multistreaming</li>
            <li className="pb-3 text-gray-100">Community</li>
            <li className="pb-3 text-gray-100">upload and stream</li>
          </ul>
        </div>
        <div>
          <ul className="text-white">
            <li className="text-gray-400 pb-6 pt-3">Products</li>
            <li className="pb-3 pb-3 text-gray-100">studio</li>
            <li className="pb-3 pb-3 text-gray-100">Multistreaming</li>
            <li className="pb-3 pb-3 text-gray-100">Community</li>
            <li className="pb-3 pb-3 text-gray-100">upload and stream</li>
          </ul>
        </div>
        <div>
          <ul className="text-white">
            <li className="text-gray-400 pb-6 pt-3">Products</li>
            <li className="pb-3 text-gray-300">studio</li>
            <li className="pb-3 text-gray-100">Multistreaming</li>
            <li className="pb-3 text-gray-100">Community</li>
            <li className="pb-3 text-gray-100">upload and stream</li>
          </ul>
        </div>
      </div>
      <div className="bg-gray-500 h-[1px] w-full"></div>
      <div className="lg:flex justify-between pb-6">
        <p className="pt-4 w-80 text-gray-500 opacity-70">© 2024 Restream, Inc. All Rights Reserved.
        Restream® is the property of Restream, Inc.</p>
        <img  className="pt-4" src="/assets/footer/List.png"/>
      </div>
    </div>
  );
};

export default Footer;
