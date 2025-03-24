import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  X,
  Type,
  Palette,
  Image,
  Layers,
  LogIn,
  Check,
  RefreshCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { uploadToCloudinary } from "@/app/lib/action/user";

const defaultBackgrounds = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1557683316-973673baf926",
    name: "Gradient 1",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85",
    name: "Abstract 1",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    name: "Nature 1",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1",
    name: "Texture 1",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1552083974-186346191183",
    name: "Pattern 1",
  },
];

const defaultOverlays = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5",
    name: "Overlay 1",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1557682257-2f9c37a3ad9a",
    name: "Overlay 2",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1557682260-96773eb01377",
    name: "Overlay 3",
  },
];

const defaultLogos = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1557683311-eac922347aa1",
    name: "Logo 1",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1557683325-3ba8f0df79de",
    name: "Logo 2",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1557682251-1b9d5a5a4d9a",
    name: "Logo 3",
  },
];

const fonts = [
  "Default",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Oswald",
  "Lato",
];

const themes = [
  { name: "Default", bg: "bg-black/50", text: "text-white" },
  { name: "Light", bg: "bg-white/80", text: "text-black" },
  { name: "Blue", bg: "bg-blue-500/50", text: "text-white" },
  { name: "Purple", bg: "bg-purple-500/50", text: "text-white" },
  { name: "Green", bg: "bg-green-500/50", text: "text-white" },
  { name: "Red", bg: "bg-red-500/50", text: "text-white" },
];

interface DesignOptionsProps {
  onSettingsChange: (settings: any) => void;
  savedSettings: any;
  setActiveTool: (value: any) => void;
  activeTool: string;
}

const DesignOptions: React.FC<DesignOptionsProps> = ({
  onSettingsChange,
  savedSettings,
  setActiveTool,
  activeTool
}) => {
  const [selectedBackground, setSelectedBackground] = useState<any>(
    savedSettings?.background || null
  );
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(
    savedSettings?.overlay || null
  );
  const [selectedLogo, setSelectedLogo] = useState<string | null>(
    savedSettings?.logo || null
  );
  const [selectedFont, setSelectedFont] = useState<string>(
    savedSettings?.font || "Default"
  );
  const [selectedTheme, setSelectedTheme] = useState<any>(
    savedSettings?.theme || themes[0]
  );
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [customOverlay, setCustomOverlay] = useState<string | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("background");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const newSettings = useMemo(
    () => ({
      background: customBackground || selectedBackground,
      overlay: customOverlay || selectedOverlay,
      logo: customLogo || selectedLogo,
      font: selectedFont,
      theme: selectedTheme,
    }),
    [
      selectedBackground,
      selectedOverlay,
      selectedLogo,
      selectedFont,
      selectedTheme,
      customBackground,
      customOverlay,
      customLogo,
    ]
  );

  useEffect(() => {
    const savedSettingsStr = JSON.stringify(savedSettings);
    const newSettingsStr = JSON.stringify(newSettings);

    if (savedSettingsStr !== newSettingsStr) {
      console.log("Settings updated:", newSettings);
      onSettingsChange(newSettings);
    }
  }, [newSettings, onSettingsChange, savedSettings]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadError(null);
      try {
        const url = await uploadToCloudinary(file);
        if (type === "background") {
          setCustomBackground(url);
          setSelectedBackground(null);
          console.log("Custom background uploaded to Cloudinary:", url);
        }
        if (type === "overlay") {
          setCustomOverlay(url);
          setSelectedOverlay(null);
          console.log("Custom overlay uploaded to Cloudinary:", url);
        }
        if (type === "logo") {
          setCustomLogo(url);
          setSelectedLogo(null);
          console.log("Custom logo uploaded to Cloudinary:", url);
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError("Failed to upload image. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const resetToDefaults = () => {
    setSelectedBackground(defaultBackgrounds[0].url);
    setSelectedOverlay(null);
    setSelectedLogo(null);
    setSelectedFont("Default");
    setSelectedTheme(themes[0]);
    setCustomBackground(null);
    setCustomOverlay(null);
    setCustomLogo(null);
    setUploadError(null);
    console.log("Settings reset to defaults");
  };

  return (
    <div className="p-5 bg-gradient-to-b from-[#0e1e3c] to-[#1a2d4d] text-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-5 border-b border-blue-800 pb-3">
        <h3 className="text-xl font-semibold flex items-center">
          <Palette className="mr-2" size={20} />
          Design Settings
        </h3>
        <button
          onClick={resetToDefaults}
          className="flex items-center text-xs bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1 rounded-md"
        >
          <RefreshCcw size={14} className="mr-1" /> Reset
        </button>
        <button
          className="text-gray-400 hover:text-white"
          onClick={() => setActiveTool(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-4 bg-[#162a47] rounded-md p-2">
        <button
          className={`flex-1 py-2 rounded-md flex justify-center items-center text-sm ${
            activeTab === "background"
              ? "px-6 bg-blue-600 text-white"
              : "text-gray-300 hover:bg-[#1d3558]"
          } transition-colors`}
          onClick={() => setActiveTab("background")}
        >
          <Image size={16} className="mr-1" /> Background
        </button>
        <button
          className={`flex-1 py-2 rounded-md flex justify-center items-center text-sm ${
            activeTab === "overlay"
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-[#1d3558]"
          } transition-colors`}
          onClick={() => setActiveTab("overlay")}
        >
          <Layers size={16} className="mr-1" /> Overlay
        </button>
        <button
          className={`flex-1 py-2 rounded-md flex justify-center items-center text-sm ${
            activeTab === "logo"
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-[#1d3558]"
          } transition-colors`}
          onClick={() => setActiveTab("logo")}
        >
          <LogIn size={16} className="mr-1" /> Logo
        </button>
        <button
          className={`flex-1 py-2 rounded-md flex justify-center items-center text-sm ${
            activeTab === "typography"
              ? "bg-blue-600 text-white"
              : "text-gray-300 hover:bg-[#1d3558]"
          } transition-colors`}
          onClick={() => setActiveTab("typography")}
        >
          <Type size={16} className="mr-1" /> Typography
        </button>
      </div>

      {/* Background Selection */}
      {activeTab === "background" && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex items-center mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <Image size={16} className="mr-1 text-blue-400" /> Background
              Image
            </h4>
            <div className="ml-auto text-xs text-blue-300 flex items-center">
              <Info size={12} className="mr-1" /> Select or upload
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div
              className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 bg-gray-800 flex items-center justify-center ${
                selectedOverlay === null
                  ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                  : "border border-gray-700 hover:border-blue-400"
              }`}
              onClick={() => {
                setSelectedBackground(null);
                setCustomBackground(null);
                setUploadError(null);
                console.log("Overlay removed");
              }}
            >
              <X size={24} className="text-gray-400" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium">
                No Overlay
              </div>
            </div>

            {defaultBackgrounds.map((bg) => (
              <div
                key={bg.id}
                className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 ${
                  selectedBackground === bg.url
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                    : "border border-gray-700 hover:border-blue-400"
                }`}
                style={{
                  backgroundImage: `url(${bg.url})`,
                  backgroundSize: "cover",
                }}
                onClick={() => {
                  setSelectedBackground(bg.url);
                  setCustomBackground(null);
                  setUploadError(null);
                  console.log("Selected background:", bg.name);
                }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {selectedBackground === bg.url && (
                    <Check className="text-blue-400" size={20} />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium truncate">
                  {bg.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-[#162a47] p-3 rounded-md">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-white font-semibold transition-all border border-transparent p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-600 hover:to-indigo-700">
              <Upload size={18} className="text-white opacity-80" />
              {uploading ? "Uploading..." : "Upload Custom Background"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "background")}
                disabled={uploading}
              />
            </label>

            {uploadError && (
              <div className="mt-2 text-sm bg-red-900/30 p-2 rounded-md flex items-center text-red-300">
                <AlertTriangle size={14} className="mr-1" />
                {uploadError}
              </div>
            )}

            {customBackground && (
              <div className="mt-2 text-sm bg-blue-900/30 p-2 rounded-md flex items-center justify-between">
                <span className="flex items-center text-blue-200">
                  <Check size={14} className="mr-1 text-green-400" /> Custom
                  Background Applied
                </span>
                <button
                  onClick={() => {
                    setCustomBackground(
                      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/epJpfMAAAAASUVORK5CYII="
                    );
                    setUploadError(null);
                    console.log("Custom background set to transparent");
                  }}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Selection */}
      {activeTab === "overlay" && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex items-center mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <Layers size={16} className="mr-1 text-blue-400" /> Overlay
              Effects
            </h4>
            <div className="ml-auto text-xs text-blue-300 flex items-center">
              <Info size={12} className="mr-1" /> Optional
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div
              className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 bg-gray-800 flex items-center justify-center ${
                selectedOverlay === null
                  ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                  : "border border-gray-700 hover:border-blue-400"
              }`}
              onClick={() => {
                setSelectedOverlay(null);
                setCustomOverlay(null);
                setUploadError(null);
                console.log("Overlay removed");
              }}
            >
              <X size={24} className="text-gray-400" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium">
                No Overlay
              </div>
            </div>

            {defaultOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 ${
                  selectedOverlay === overlay.url
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                    : "border border-gray-700 hover:border-blue-400"
                }`}
                style={{
                  backgroundImage: `url(${overlay.url})`,
                  backgroundSize: "cover",
                }}
                onClick={() => {
                  setSelectedOverlay(overlay.url);
                  setCustomOverlay(null);
                  setUploadError(null);
                  console.log("Selected overlay:", overlay.name);
                }}
              >
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {selectedOverlay === overlay.url && (
                    <Check className="text-blue-400" size={20} />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium truncate">
                  {overlay.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-[#162a47] p-3 rounded-md">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-white font-semibold transition-all border border-transparent p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-600 hover:to-indigo-700">
              <Upload size={16} className="text-blue-400" />
              {uploading ? "Uploading..." : "Upload Custom Overlay"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "overlay")}
                disabled={uploading}
              />
            </label>

            {uploadError && (
              <div className="mt-2 text-sm bg-red-900/30 p-2 rounded-md flex items-center text-red-300">
                <AlertTriangle size={14} className="mr-1" />
                {uploadError}
              </div>
            )}

            {customOverlay && (
              <div className="mt-2 text-sm bg-blue-900/30 p-2 rounded-md flex items-center justify-between">
                <span className="flex items-center text-blue-200">
                  <Check size={14} className="mr-1 text-green-400" /> Custom
                  Overlay Applied
                </span>
                <button
                  onClick={() => {
                    setCustomOverlay(null);
                    setUploadError(null);
                    console.log("Custom overlay removed");
                  }}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logo Selection */}
      {activeTab === "logo" && (
        <div className="mb-4 animate-fadeIn">
          <div className="flex items-center mb-3">
            <h4 className="text-sm font-medium flex items-center">
              <LogIn size={16} className="mr-1 text-blue-400" /> Brand Logo
            </h4>
            <div className="ml-auto text-xs text-blue-300 flex items-center">
              <Info size={12} className="mr-1" /> Optional
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div
              className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 bg-gray-800 flex items-center justify-center ${
                selectedLogo === null
                  ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                  : "border border-gray-700 hover:border-blue-400"
              }`}
              onClick={() => {
                setSelectedLogo(null);
                setCustomLogo(null);
                setUploadError(null);
                console.log("Logo removed");
              }}
            >
              <X size={24} className="text-gray-400" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium">
                No Logo
              </div>
            </div>

            {defaultLogos.map((logo) => (
              <div
                key={logo.id}
                className={`relative w-full h-20 rounded-lg cursor-pointer overflow-hidden group transition-all duration-200 hover:scale-105 ${
                  selectedLogo === logo.url
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                    : "border border-gray-700 hover:border-blue-400"
                } bg-gray-800 flex items-center justify-center`}
                onClick={() => {
                  setSelectedLogo(logo.url);
                  setCustomLogo(null);
                  setUploadError(null);
                  console.log("Selected logo:", logo.name);
                }}
              >
                <div
                  className="h-12 w-2/3"
                  style={{
                    backgroundImage: `url(${logo.url})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {selectedLogo === logo.url && (
                    <Check className="text-blue-400" size={20} />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-xs text-center font-medium truncate">
                  {logo.name}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 bg-[#162a47] p-3 rounded-md">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-white font-semibold transition-all border border-transparent p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 hover:from-blue-600 hover:to-indigo-700">
              <Upload size={16} className="text-blue-400" />
              {uploading ? "Uploading..." : "Upload Custom Logo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "logo")}
                disabled={uploading}
              />
            </label>

            {uploadError && (
              <div className="mt-2 text-sm bg-red-900/30 p-2 rounded-md flex items-center text-red-300">
                <AlertTriangle size={14} className="mr-1" />
                {uploadError}
              </div>
            )}

            {customLogo && (
              <div className="mt-2 text-sm bg-blue-900/30 p-2 rounded-md flex items-center justify-between">
                <span className="flex items-center text-blue-200">
                  <Check size={14} className="mr-1 text-green-400" /> Custom
                  Logo Applied
                </span>
                <button
                  onClick={() => {
                    setCustomLogo(null);
                    setUploadError(null);
                    console.log("Custom logo removed");
                  }}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Typography Settings */}
      {activeTab === "typography" && (
        <div className="animate-fadeIn">
          {/* Font Selection */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <Type size={16} className="mr-1 text-blue-400" /> Font Family
              </h4>
            </div>

            <div className="bg-[#162a47] rounded-md overflow-hidden">
              <select
                className="w-full p-3 bg-[#162a47] text-sm border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedFont}
                onChange={(e) => {
                  setSelectedFont(e.target.value);
                  console.log("Font selected:", e.target.value);
                }}
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="mt-2 p-3 bg-[#152640] rounded-md text-center"
              style={{
                fontFamily:
                  selectedFont !== "Default" ? selectedFont : "inherit",
              }}
            >
              <div className="text-sm text-gray-400">Preview:</div>
              <div className="text-xl mt-1">
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="mb-4">
            <div className="flex items-center mb-3">
              <h4 className="text-sm font-medium flex items-center">
                <Palette size={16} className="mr-1 text-blue-400" /> Text Theme
              </h4>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.name}
                  className={`p-3 rounded-md cursor-pointer ${theme.bg} ${
                    theme.text
                  } text-center transition-all duration-200 hover:scale-105 ${
                    selectedTheme.name === theme.name
                      ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/30"
                      : "border border-gray-700"
                  }`}
                  onClick={() => {
                    setSelectedTheme(theme);
                    console.log("Theme selected:", theme.name);
                  }}
                >
                  <div className="text-xs mb-1 opacity-70">Theme</div>
                  <div className="text-sm font-medium">{theme.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-blue-800 text-xs text-blue-300 flex justify-between items-center">
        <div className="flex items-center">
          <AlertTriangle size={14} className="mr-1 text-yellow-400" />
          Changes are applied automatically
        </div>
        <button
          onClick={() =>
            console.log("Current settings:", {
              background: customBackground || selectedBackground,
              overlay: customOverlay || selectedOverlay,
              logo: customLogo || selectedLogo,
              font: selectedFont,
              theme: selectedTheme,
            })
          }
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1 rounded-md text-white"
        >
          Debug Settings
        </button>
      </div>
    </div>
  );
};

export default DesignOptions;
