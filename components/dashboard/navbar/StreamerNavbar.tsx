"use client";
import Link from "next/link";
import React, { useState } from "react";
import { X, Menu } from "lucide-react";

const StreamerNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { label: "Products", href: "#" },
    { label: "About", href: "#" },
    { label: "Customers", href: "#" },
    { label: "Pricing", href: "#" },
  ];
  return (
    <div>
      <>
        {/* Main Navbar */}
        <nav className="z-50 fixed top-0 left-0 w-full z-100 flex items-center justify-between p-2 backdrop-blur-sm bg-transparent mb-24 border border-b-2">
          {/* Left section */}
          <div className="flex items-center lg:ml-64 lg:gap-11 lg:pl-36">
            <div className="text-blue-500 text-2xl font-bold">StreamRx</div>

            {/* Desktop Menu Items */}
          </div>

          {/* Right section */}
          <div className="hidden lg:flex items-center space-x-4 pr-72 mr-36 pt-3">
            <Link
              className="text-black hover:text-blue-500"
              href="/sign-in/viewer"
            >
              Sign up
            </Link>
            <div
              className="flex items-center px-3 py-2 border-2 border-black text-black rounded-2xl 
                backdrop-blur-lg bg-white/20 hover:bg-blue-500 hover:text-white transition cursor-pointer"
            >
              Get Started
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white/40 ml-2"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </nav>

        {/* Mobile Menu Modal */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            style={{ backgroundColor: "#01010C" }}
          >
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <div className="text-white text-3xl font-bold">StreamRx</div>
                <button
                  onClick={toggleMenu}
                  className="text-white p-2"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col p-4 space-y-4">
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-white text-sm font-bold hover:text-blue-500 py-2"
                    onClick={toggleMenu}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 border-t border-gray-800">
                  <a
                    href="#"
                    className="text-white text-sm font-bold hover:text-blue-500 py-2 block"
                    onClick={toggleMenu}
                  >
                    Sign In
                  </a>
                  <div
                    className="flex items-center justify-center w-44 mt-4 px-3 py-2 border font-bold border-gray-300 text-white rounded-xl hover:bg-blue-500 hover:text-white transition cursor-pointer"
                    style={{ backgroundColor: "#7267FF" }}
                  >
                    Get Started
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-white/40"
                    >
                      <path
                        d="M10.75 8.75L14.25 12L10.75 15.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default StreamerNavbar;
