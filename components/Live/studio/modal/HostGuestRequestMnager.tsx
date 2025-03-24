import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const HostGuestRequestManager: React.FC<{
  guestRequests: any;
  isWaitingForApproval: any;
  handleDenyGuest: any;
  handleApproveGuest: any;
}> = ({
  guestRequests,
  handleApproveGuest,
  handleDenyGuest,
  isWaitingForApproval,
}) => {
  return (
    <div className="p-4 bg-zinc-900 rounded-lg space-y-4">
      <AnimatePresence>
        {guestRequests.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {guestRequests.map((request:any) => (
              <motion.div
                key={request.socketId}
                variants={itemVariants}
                className="flex items-center justify-between bg-zinc-800 p-3 rounded-md border border-zinc-700 shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-gray-300"
                  >
                    {request.username[0].toUpperCase()}
                  </motion.span>
                  <span className="text-gray-300 font-medium">
                    {request.username}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApproveGuest(request)}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>Approve</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDenyGuest(request)}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                  >
                    <span>Deny</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HostGuestRequestManager;
