"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduledTimeDisplayProps {
  scheduleTime: string;
  status: string;
}

export function ScheduledTimeDisplay({
  scheduleTime,
  status,
}: ScheduledTimeDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const scheduleDateTime = new Date(scheduleTime);
  const timeDiff =
    (scheduleDateTime.getTime() - currentTime.getTime()) / (1000 * 60);
  const isPast = timeDiff < 0;
  const canStart = timeDiff <= 5 && timeDiff >= 0;

  return (
    <div
      className={`text-sm flex items-center ${
        isPast
          ? "text-yellow-400"
          : canStart
          ? "text-green-400"
          : "text-blue-400"
      }`}
    >
      <motion.div
        animate={canStart ? { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-2 h-2 rounded-full mr-2 bg-current"
      />
      {isPast
        ? "Scheduled time has passed"
        : timeDiff < 60
        ? `Starting in ${Math.ceil(timeDiff)} minutes`
        : `Starting in ${Math.floor(timeDiff / 60)} hours ${Math.ceil(
            timeDiff % 60
          )} minutes`}
      {status === "stopped" && (
        <span className="text-red-400 ml-2">• stopped</span>
      )}
    </div>
  );
}
