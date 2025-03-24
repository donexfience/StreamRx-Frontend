import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Camera, Mic, CameraOff, MicOff } from "lucide-react";

const NameTypingModal: React.FC<{ onClose: any; onJoin: any }> = ({
  onClose,
  onJoin,
}) => {
  const [inputUsername, setInputUsername] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoContainer, setVideoContainer] = useState<HTMLDivElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null); // Reference to the video element

  useEffect(() => {
    if (!videoContainer) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (cameraOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Create video element if it doesn't exist
          if (!videoElRef.current) {
            videoElRef.current = document.createElement("video");
            videoElRef.current.autoplay = true;
            videoElRef.current.playsInline = true;
            videoElRef.current.muted = true;
            videoElRef.current.className = "w-full h-full object-cover rounded-full";
          }

          // Set the stream as the source
          videoElRef.current.srcObject = new MediaStream(stream.getVideoTracks());

          // Append to container if not already appended
          if (videoContainer && !videoContainer.contains(videoElRef.current)) {
            videoContainer.appendChild(videoElRef.current);
          }

          setVideoStream(stream);
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast.error("Failed to access camera");
          setCameraOn(false);
        }
      } else {
        stopStream();
      }
    };

    const stopStream = () => {
      // Remove the video element if it exists
      if (videoContainer && videoElRef.current && videoContainer.contains(videoElRef.current)) {
        videoContainer.removeChild(videoElRef.current);
      }

      // Stop the stream tracks
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }

      // Clear the video element reference
      videoElRef.current = null;
    };

    startCamera();

    // Cleanup on unmount or when cameraOn/videoContainer changes
    return () => {
      stopStream();
    };
  }, [cameraOn, videoContainer]);

  const handleJoin = () => {
    if (!inputUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    onJoin({ username: inputUsername, cameraOn, micOn });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center z-50 w-full h-full"
      style={{ backgroundImage: `url('/assets/GuestApprove/bg.png')` }}
    >
      <div className="flex items-center justify-center relative">
        {/* Restream Studio Logo */}
        <div className="absolute top-4 left-4 text-white text-lg font-semibold">
          StreamRx Studio
        </div>

        {/* Circular R Icon */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-blue-600 font-bold">R</span>
        </div>

        <div className="flex rounded-lg p-6 w-[800px] h-[450px] border border-zinc-700">
          {/* Left Side: Camera Preview */}
          <div className="w-2/3 flex flex-col items-center justify-center">
            <div
              className="relative w-48 h-48 rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden"
              ref={(el) => setVideoContainer(el)}
            >
              {!cameraOn && (
                <div className="w-full h-full flex items-center justify-center">
                  <CameraOff className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <button className="mt-4 text-gray-400 hover:text-gray-200">
              Edit Avatar
            </button>
          </div>

          {/* Right Side: Form and Toggles */}
          <div className="w-1/3 flex flex-col justify-center items-center space-y-4">
            <h2 className="text-white text-2xl font-bold mb-4">
              Ready to join?
            </h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              className="w-full p-2 rounded-md bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => setCameraOn(!cameraOn)}
                className={`p-2 rounded-full ${
                  cameraOn ? "bg-blue-500" : "bg-gray-500"
                }`}
              >
                {cameraOn ? (
                  <Camera className="w-6 h-6 text-white" />
                ) : (
                  <CameraOff className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={() => setMicOn(!micOn)}
                className={`p-2 rounded-full ${
                  micOn ? "bg-blue-500" : "bg-gray-500"
                }`}
              >
                {micOn ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md mt-4 font-semibold"
            >
              Join Stream
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-md font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameTypingModal;