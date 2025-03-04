"use client";
import { useEffect, useState } from "react";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import {
  useEditStreamMutation,
  useGetChannelStreamsQuery,
} from "@/redux/services/streaming/streamingApi";
import CreateStreamModal from "@/components/Live/CreateStreamModal";
import { StreamPreviewModal } from "@/components/Live/StreamPreviewModal";
import { WelcomeModal } from "@/components/Live/welcomeModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { LiveStudio } from "@/components/Live/LiveStudioComponent";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar, Clock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ScheduledTimeDisplay } from "@/components/Live/sheduleTimeDisplay";
import { io } from "socket.io-client";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [role, setRole] = useState<"host" | "guest">("host");
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();

  const handleStartStream = () => {
    setShowWelcome(false);
    setShowCreateStream(true);
  };

  const handleGoLive = () => {
    setShowPreviewModal(false);
    setIsLive(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const { data: userData, isLoading: isUserDataLoading } = useGetUserQuery(
    { email: users?.email },
    { skip: !users?.email, refetchOnMountOrArgChange: true }
  );

  const { data: channelData, isLoading: channelLoading } =
    useGetChannelByEmailQuery(users?.email, {
      skip: !users?.email,
    });

  const channelId: any = channelData?._id;
  const {
    data: streams,
    isLoading,
    refetch,
  } = useGetChannelStreamsQuery(channelId, { skip: !channelId });

  const [updateStreamStatus] = useEditStreamMutation();

  const startedStream = streams?.data?.find(
    (stream: any) => stream.status === "started"
  );
  const pendingStream = streams?.data?.find(
    (stream: any) => stream.status === "pending" && !stream.schedule?.dateTime
  );
  const scheduledStreams = streams?.data
    ?.filter((stream: any) => stream.schedule?.dateTime)
    ?.sort(
      (a: any, b: any) =>
        new Date(a.schedule.dateTime).getTime() -
        new Date(b.schedule.dateTime).getTime()
    );

  useEffect(() => {
    console.log(
      "State Check:",
      "startedStream:",
      startedStream,
      "pendingStream:",
      pendingStream,
      "scheduledStreams:",
      scheduledStreams,
      "showCreateStream:",
      showCreateStream
    );
  }, [startedStream, pendingStream, scheduledStreams, showCreateStream]);

  useEffect(() => {
    if (!startedStream || !userData?.user) return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    const socket = io("https://localhost:3011", {
      transports: ["websocket", "polling"],
    });

    if (token) {
      socket.emit("verifyInvite", { token }, (response: any) => {
        if (response.success && response.roomId === channelData?._id) {
          setRole("guest");
        } else {
          toast.error("Invalid or expired invite token");
          router.push("/dashboard/streamer/main");
        }
        socket.disconnect();
      });
    } else if (userData?.user?._id === startedStream?.createdBy) {
      setRole("host");
    } else {
      setRole("guest");
    }

    return () => {
      socket.disconnect();
    };
  }, [startedStream, userData, channelData, router]);

  useEffect(() => {
    if (isLoading || !streams) return;

    if (startedStream) {
      setShowWelcome(false);
      setShowPreviewModal(false);
      setIsLive(true);
    } else if (pendingStream) {
      setShowWelcome(false);
      setShowPreviewModal(true);
    } else if (scheduledStreams?.length > 0) {
      setShowWelcome(false);
    } else {
      setShowWelcome(true);
    }
  }, [startedStream, pendingStream, scheduledStreams, isLoading, streams]);

  useEffect(() => {
    const checkOverdueStreams = async () => {
      if (!streams?.data) return;
      const now = new Date();
      const overdueStreams = scheduledStreams?.filter((stream: any) => {
        const scheduleTime = new Date(stream.schedule.dateTime);
        return stream.status === "pending" && now > scheduleTime;
      });

      for (const stream of overdueStreams || []) {
        try {
          await updateStreamStatus({
            id: stream._id,
            updateData: { status: "missed" },
          }).unwrap();
          refetch();
        } catch (error) {
          console.error("Failed to update overdue stream:", error);
        }
      }
    };

    const intervalId = setInterval(checkOverdueStreams, 60000);
    checkOverdueStreams();

    return () => clearInterval(intervalId);
  }, [streams, scheduledStreams, updateStreamStatus, refetch]);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const handleStartScheduledStream = async (streamId: string) => {
    if (startedStream || pendingStream) {
      toast.error("An active stream is already running.");
      return;
    }

    const stream = scheduledStreams?.find((s: any) => s._id === streamId);
    if (!stream || !stream.schedule?.dateTime) {
      toast.error("Invalid stream selected.");
      return;
    }

    if (!isWithinWindow(stream.schedule.dateTime)) {
      const now = new Date();
      const scheduled = new Date(stream.schedule.dateTime);
      const timeDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60);
      if (timeDiff > 5) {
        toast.error(
          "Too early! You can start this stream 5 minutes before its scheduled time."
        );
      } else {
        toast.error("Scheduled time has passed!");
      }
      return;
    }

    try {
      await updateStreamStatus({
        id: streamId,
        updateData: { status: "started" },
      }).unwrap();
      refetch();
      setIsLive(true);
    } catch (error) {
      console.error("Failed to start scheduled stream:", error);
      toast.error("Failed to start the stream.");
    }
  };

  const isWithinWindow = (scheduleTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduleTime);
    const timeDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 5 && timeDiff >= 0;
  };

  const earliestAccessibleStream = scheduledStreams?.find((stream: any) =>
    isWithinWindow(stream.schedule.dateTime)
  );
  console.log(startedStream);

  return (
    <div className="min-h-screen bg-zinc-900 w-full ">
      {isLoading && (
        <div className="text-center text-gray-400 py-10">
          Loading streams...
        </div>
      )}

      {!isLoading &&
        showWelcome &&
        !startedStream &&
        !pendingStream &&
        !scheduledStreams?.length && (
          <WelcomeModal
            onClose={() => {
              setShowWelcome(false);
              router.replace("/dashboard/streamer/main");
            }}
            onStartNow={handleStartStream}
            onScheduleLater={handleStartStream}
          />
        )}
      {showCreateStream && !startedStream && !pendingStream && (
        <CreateStreamModal
          onClose={() => setShowCreateStream(false)}
          setShowStreamPreview={setShowPreviewModal}
          existingStreams={streams?.data || []}
          refetchStreams={refetch}
        />
      )}
      {showPreviewModal && pendingStream && (
        <StreamPreviewModal
          channelId={channelData?._id || ""}
          stream={pendingStream}
          onClose={() => setShowPreviewModal(false)}
          onCloseCreateStream={() => setShowCreateStream(false)}
          refetchStreams={refetch}
          onGoLive={handleGoLive}
          isLoading={isLoading}
        />
      )}
      {startedStream && (
        <LiveStudio
          streams={[startedStream]}
          channelData={channelData}
          user={userData?.user}
          role={role}
        />
      )}

      {/* Scheduled Streams Section */}
      {!isLoading && !startedStream && scheduledStreams?.length > 0 && (
        <div className="bg-zinc-900 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-white text-2xl font-bold mt-4 ml-3"
              onClick={() => router.push("/dashboard/streamer/main")}
            >
              Scheduled Streams
            </h2>
            <Calendar className="text-blue-400 w-6 h-6" />
          </div>

          {scheduledStreams.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No scheduled streams available
            </div>
          ) : (
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {scheduledStreams.map((stream: any) => {
                const scheduleTime = new Date(stream.schedule.dateTime);
                const canStart = isWithinWindow(stream.schedule.dateTime);

                return (
                  <motion.li
                    key={stream._id}
                    variants={itemVariants}
                    whileHover="hover"
                    className={`rounded-lg overflow-hidden border border-zinc-700 ${
                      new Date() > scheduleTime
                        ? "bg-zinc-800/50"
                        : "bg-zinc-800"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="text-white font-semibold text-lg">
                            {stream.title}
                          </h3>

                          <div className="flex items-center text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {scheduleTime.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-2" />
                            {scheduleTime.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          <ScheduledTimeDisplay
                            scheduleTime={stream.schedule.dateTime}
                            status={stream.status}
                          />
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() =>
                              handleStartScheduledStream(stream._id)
                            }
                            disabled={!canStart}
                            className={`flex items-center ${
                              canStart
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-zinc-700 text-zinc-400"
                            } px-4 py-2 rounded-md transition-colors duration-200`}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start Stream
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {canStart && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        className="bg-green-400/10 border-t border-green-400/20"
                      >
                        <div className="p-3 text-sm text-green-400 flex items-center">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Ready to go live! You can start this stream now.
                        </div>
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </div>
      )}
      <div className="flex justify-center pt-4 items-center">
        {!isLoading && !startedStream && !pendingStream && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowCreateStream(true)}
              className="bg-black border hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Create Stream
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
