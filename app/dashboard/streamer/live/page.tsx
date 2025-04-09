"use client";
import { useEffect, useRef, useState } from "react";
import {
  useGetChannelByChannelIdQuery,
  useGetChannelByEmailQuery,
  useGetChannelByIdQuery,
} from "@/redux/services/channel/channelApi";
import {
  useEditStreamMutation,
  useGetChannelStreamsQuery,
} from "@/redux/services/streaming/streamingApi";
import CreateStreamModal from "@/components/Live/CreateStreamModal";
import { StreamPreviewModal } from "@/components/Live/StreamPreviewModal";
import { WelcomeModal } from "@/components/Live/welcomeModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Calendar, Clock, Loader2, PlayCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ScheduledTimeDisplay } from "@/components/Live/sheduleTimeDisplay";
import { io } from "socket.io-client";
import LiveStudio from "@/components/Live/LiveStudio";
import NameTypingModal from "@/components/Live/studio/modal/NameTypingModal";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [role, setRole] = useState<"host" | "guest">("host");
  const [isLive, setIsLive] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<any>(null);
  const [streamId, setStreamId] = useState<string | null>(null);
  //guest approval states
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState("");
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [micOn, setIsMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const socketRef = useRef<any>(null);

  const router = useRouter();

  const handleStartStream = () => {
    setShowWelcome(false);
    setShowCreateStream(true);
  };

  const handleGoLive = () => {
    setShowPreviewModal(false);
    setIsLive(true);
  };

  // Fetch user data from cookies
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

  // Fetch user's own channel data
  const { data: channelData, isLoading: channelLoading } =
    useGetChannelByEmailQuery(users?.email, { skip: !users?.email });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (socketRef.current) {
      console.log("Disconnecting previous socket");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (token && userData?.user) {
      setIsGuest(true);
      socketRef.current = io("http://localhost:3011", {
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      console.log("Socket connected:", socketRef.current.id);

      socketRef.current.on("connect_error", (error: any) => {
        console.error("Socket connection error:", error);
      });

      socketRef.current.on("streamUpdate", (data: any) => {
        console.log(data, "data got in the streamUpdate from BE");
        const isApprovedParticipant = data?.participants?.some(
          (p: any) => p.userId === userData.user?._id
        );
        if (isApprovedParticipant) {
          setIsApproved(true);
          setIsWaitingForApproval(false);
        } else if (!isWaitingForApproval) {
          setShowUsernameModal(true);
        }
      });

      socketRef.current.on(
        "joinApproved",
        ({ streamId: newStreamId }: { streamId: any }) => {
          console.log("Join approved with streamId:", newStreamId);
          setStreamId(newStreamId);
          setIsWaitingForApproval(false);
          setIsApproved(true);
        }
      );

      socketRef.current.on("joinDenied", ({ message }: { message: any }) => {
        setIsWaitingForApproval(false);
        toast.error(message || "The host has denied your request to join.");
        router.push("/dashboard/streamer/main");
      });

      socketRef.current.emit(
        "verifyInvite",
        { token, username },
        (response: any) => {
          if (response.success) {
            setRole("guest");
            setActiveChannelId(response.roomId);
            if (response.streamId) {
              setStreamId(response.streamId);
              console.log(
                "Already approved guest, streamId:",
                response.streamId
              );

              socketRef.current.emit("joinStudio", {
                role: "guest",
                user: userData?.user,
                channelData: { _id: response.roomId },
              });
            } else {
              console.log("Valid invite, but not yet approved");
              setShowUsernameModal(true);
            }
          } else {
            toast.error(response.message || "Failed to verify invite.");
            console.error("Error verifying invite:", response.message);
            router.push("/dashboard/streamer/main");
            setShowUsernameModal(false);
          }
        }
      );
    } else if (!token && channelData?._id) {
      setIsGuest(false);
      setActiveChannelId(channelData._id);
    }

    return () => {
      if (socketRef.current) {
        console.log("Socket disconnecting on cleanup");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userData, channelData, router]);

  console.log(activeChannelId, "channel id ");
  console.log(isGuest, "is guest");

  // Fetch active channel data (host's channel for guests, user's channel for streamers)
  const { data: activeChannelData, isLoading: activeChannelLoading } =
    useGetChannelByChannelIdQuery(activeChannelId, { skip: !activeChannelId });
  console.log(activeChannelData, "active channel data");
  // Fetch streams for the active channel
  const {
    data: streams,
    isLoading,
    refetch,
  } = useGetChannelStreamsQuery(activeChannelId, { skip: !activeChannelId });

  const channelId: any = channelData?._id;

  // Fetch guest's own streams to check conflicts
  const { data: guestOwnStreams } = useGetChannelStreamsQuery(channelId, {
    skip: !isGuest || !channelData?._id,
  });

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

  // Check guest's own streams for CONFLICTS  AND NEED TO EXIT TO START THEIR OWN STREAM
  const guestHasStartedStream = guestOwnStreams?.data?.some(
    (stream: any) => stream.status === "started"
  );
  const guestHasPendingStream = guestOwnStreams?.data?.some(
    (stream: any) => stream.status === "pending" && !stream.schedule?.dateTime
  );
  const guestHasScheduledStream = guestOwnStreams?.data?.some(
    (stream: any) =>
      stream.schedule?.dateTime &&
      new Date(stream.schedule.dateTime) <= new Date()
  );

  useEffect(() => {
    if (isGuest) {
      if (guestHasStartedStream || guestHasPendingStream) {
        toast.error(
          "You cannot join as a guest while you have an active stream."
        );
        router.push("/dashboard/streamer/main");
      } else if (guestHasScheduledStream) {
        toast.error(
          "You have a scheduled stream starting soon. You may need to exit to start it."
        );
      }
    }
  }, [
    isGuest,
    guestHasStartedStream,
    guestHasPendingStream,
    guestHasScheduledStream,
    router,
  ]);

  // Streamer-specific modal logic
  useEffect(() => {
    if (isGuest) return;
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
  }, [
    startedStream,
    pendingStream,
    scheduledStreams,
    isLoading,
    streams,
    isGuest,
  ]);

  // Check for overdue scheduled streams and update status
  useEffect(() => {
    if (isGuest) return;
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
  }, [streams, scheduledStreams, updateStreamStatus, refetch, isGuest]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
    hover: { scale: 1.02, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" },
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
  console.log(activeChannelData, "active channel data");
  const isWithinWindow = (scheduleTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduleTime);
    const timeDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 5 && timeDiff >= 0;
  };

  const handleExitToOwnStream = () => {
    router.push("/dashboard/streamer/main");
  };

  const handleJoinRequest = (inputUsername: any) => {
    setUsername(inputUsername.username);
    setIsMicOn(inputUsername.micOn);
    setCameraOn(inputUsername.cameraOn);
    setShowUsernameModal(false);
    setIsWaitingForApproval(true);

    // Use the existing socket connection
    if (socketRef.current) {
      const token = new URLSearchParams(window.location.search).get("token");
      socketRef.current.emit("requestToJoin", {
        token,
        username: inputUsername.username,
        channelId: activeChannelId,
        userId: userData?.user?._id,
        cameraOn: inputUsername.cameraOn,
        micOn: inputUsername.micOn,
      });
    } else {
      toast.error("Connection error. Please refresh the page.");
    }
  };

  console.log("userdat and role", userData, role);

  return (
    <div className="min-h-screen bg-zinc-900 w-full z-20">
      {isLoading && (
        <div className="text-center text-gray-400 py-10">
          Loading streams...
        </div>
      )}

      {/* Streamer-specific modals */}
      {!isGuest &&
        !isLoading &&
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
      {!isGuest && showCreateStream && !startedStream && !pendingStream && (
        <CreateStreamModal
          onClose={() => setShowCreateStream(false)}
          setShowStreamPreview={setShowPreviewModal}
          existingStreams={streams?.data || []}
          refetchStreams={refetch}
        />
      )}
      {!isGuest && showPreviewModal && pendingStream && (
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

      {showUsernameModal && (
        <NameTypingModal
          onClose={() => {
            setShowUsernameModal(false);
            router.push("/dashboard/streamer/main");
          }}
          onJoin={handleJoinRequest}
        />
      )}

      {/* LiveStudio for guests or streamers with a started stream */}
      {(isGuest ? isApproved && activeChannelData : startedStream) && (
        <LiveStudio
          streams={startedStream ? [startedStream] : []}
          channelData={activeChannelData}
          user={userData?.user}
          role={isGuest ? "guest" : "host"}
          initialCameraOn={cameraOn}
          initialMicOn={micOn}
        />
      )}

      {/* Scheduled Streams Section for Streamers */}
      {!isGuest &&
        !isLoading &&
        !startedStream &&
        scheduledStreams?.length > 0 && (
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
                            } px-4 py-2 rounded-md`}
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
          </div>
        )}

      {!isGuest && !isLoading && !startedStream && !pendingStream && (
        <div className="flex justify-center pt-4 items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowCreateStream(true)}
              className="bg-black border hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              Create Stream
            </Button>
          </motion.div>
        </div>
      )}

      {/* Exit Option for Guests with Scheduled Streams */}
      {isGuest && guestHasScheduledStream && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={handleExitToOwnStream}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
          >
            Exit to Start Your Scheduled Stream
          </Button>
        </div>
      )}

      {isWaitingForApproval && (
        <AnimatePresence>
          {isWaitingForApproval && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-zinc-800 rounded-2xl p-8 border border-zinc-700 shadow-2xl text-center max-w-md w-full"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                  className="mx-auto mb-6 w-16 h-16"
                >
                  <Loader2 className="w-full h-full text-blue-500 animate-spin" />
                </motion.div>

                <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">
                  Waiting for Host Approval
                </h2>

                <p className="text-gray-400 text-sm leading-relaxed">
                  Your request to join is being reviewed. Please be patient
                  while the host makes a decision.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
