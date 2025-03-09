import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoStreamProps {
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isMirrored: boolean;
  userInitials: string;
  webcamVideoRef: React.RefObject<HTMLVideoElement>;
  screenVideoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoStream: React.FC<VideoStreamProps> = React.memo(
  ({
    isCameraOn,
    isScreenSharing,
    isMirrored,
    userInitials,
    webcamVideoRef,
    screenVideoRef,
  }) => {
    return (
      <AnimatePresence>
        {isScreenSharing ? (
          <motion.div
            key="screen"
            className="w-full h-full relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : isCameraOn ? (
          <motion.div
            key="webcam"
            className="w-full h-full relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <video
              ref={webcamVideoRef}
              autoPlay
              playsInline
              muted={true}
              className="w-full h-full object-cover"
              style={{ transform: isMirrored ? "scaleX(-1)" : "scaleX(1)" }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="off"
            className="w-full h-full flex items-center justify-center bg-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {userInitials}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
