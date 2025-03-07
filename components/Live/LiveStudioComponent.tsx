"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import * as mediasoupClient from "mediasoup-client";
import io from "socket.io-client";
import {
  Camera,
  Mic,
  Monitor,
  User,
  MessageCircle,
  Settings,
  Share2,
  X,
  Play,
  Users,
  ThumbsUp,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  MoreVertical,
  ChevronLeft,
  Plus,
  Music,
  Code,
  MessageSquare,
  FileText,
  HelpCircle,
  ArrowLeftRight,
  PenTool,
  AlignJustify,
  Grid2X2,
  Filter,
  Layers,
  Award,
  ImageIcon,
  Router,
  Tablet,
  Monitor as MonitorIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { saveAs } from "file-saver";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { uploadToS3 } from "@/app/lib/action/s3";
import { useEditStreamMutation } from "@/redux/services/streaming/streamingApi";
import { useRouter } from "next/navigation";
import { ParticipantVideo } from "./ParticipantVideo";
import toast from "react-hot-toast";

interface Caption {
  id: string;
  text: string;
  timestamp: Date;
}

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: "webcam" | "screen" | "media";
  mediaUrl?: string;
  channelId?: string;
}

interface Participant {
  userId: string;
  name: string;
}

interface LiveStudioProps {
  streams: {
    id: string;
    title: string;
    description?: string;
    broadcastType: string;
    category: string;
    visibility: string;
    thumbnail?: string;
    status: "pending" | "scheduled" | "started" | "stopped";
    createdAt: Date;
    fallbackVideoUrl?: string;
    updatedAt: Date;
    schedule?: { dateTime: string };
  }[];
  user: any;
  channelData: any;
  role?: "host" | "guest";
}

export const LiveStudio: React.FC<LiveStudioProps> = ({
  streams,
  user,
  channelData,
  role = "host",
}) => {
  const [isMuted, setIsMuted] = useState(role === "guest" ? true : false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(1);
  const [saveLocally, setSaveLocally] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>(() => {
    const savedScenes = localStorage.getItem(`scenes_${channelData?._id}`);
    return savedScenes
      ? JSON.parse(savedScenes)
      : [
          {
            id: "1",
            name: "Webcam",
            isActive: true,
            type: "webcam",
            channelId: channelData?._id,
          },
          {
            id: "2",
            name: "Demo",
            isActive: false,
            type: "screen",
            channelId: channelData?._id,
          },
          {
            id: "3",
            name: "Pink Gradient 1",
            isActive: false,
            type: "media",
            mediaUrl: "https://example.com/pink-gradient-1.jpg",
            channelId: channelData?._id,
          },
          {
            id: "4",
            name: "Pink Gradient 2",
            isActive: false,
            type: "media",
            mediaUrl: "https://example.com/pink-gradient-2.jpg",
            channelId: channelData?._id,
          },
        ];
  });
  const [isPro, setIsPro] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [deviceInitialized, setDeviceInitialized] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [newPrivateMessage, setNewPrivateMessage] = useState("");
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [streamerLeft, setStreamerLeft] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const [quality, setQuality] = useState("720p");
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [showPrivateChat, setShowPrivateChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: "Viewer1", message: "Great stream!", time: "12:51" },
    {
      id: 2,
      user: "Viewer2",
      message: "Can you explain that again?",
      time: "12:52",
    },
    {
      id: 3,
      user: "Viewer3",
      message: "Looking forward to this!",
      time: "12:53",
    },
  ]);
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const [userInitials, setUserInitials] = useState("DF");
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canGoLive, setCanGoLive] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [guestToRemove, setGuestToRemove] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [guestToApprove, setGuestToApprove] = useState<any>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  // Participant and stream states
  const [participants, setParticipants] = useState<Participant[]>([
    { userId: user?._id, name: user?.username || "Host" },
  ]);
  const [participantStreams, setParticipantStreams] = useState<{
    [userId: string]: MediaStream;
  }>({});

  // API
  const [editStream] = useEditStreamMutation();

  //to fix device initialization before starting the webcam stream
  const [pendingProducers, setPendingProducers] = useState<
    { producerId: string; userId: string }[]
  >([]);

  // Refs
  const socket = useRef<any>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [producerTransport, setProducerTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [consumerTransport, setConsumerTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [videoProducer, setVideoProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const [audioProducer, setAudioProducer] = useState<any>(null);
  const [screenProducer, setScreenProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const [screenAudioProducer, setScreenAudioProducer] =
    useState<mediasoupClient.types.Producer | null>(null);

  // Constants
  const currentStream: any = streams[0];
  const streamTitle = currentStream?.title || "Live Stream";
  const streamStatus = currentStream?.status || "pending";
  const streamDate =
    currentStream?.schedule?.dateTime?.toLocaleString() ||
    new Date().toLocaleString();
  const roomId = channelData?._id || "default-room";
  const channelId = channelData?._id;
  const [captions, setCaptions] = useState<Caption[]>(() => {
    const savedCaptions = localStorage.getItem(`captions_${channelId}`);
    return savedCaptions ? JSON.parse(savedCaptions) : [];
  });
  const qualityOptions = [
    { label: "480p", constraints: { width: 854, height: 480 } },
    { label: "720p", constraints: { width: 1280, height: 720 } },
    { label: "1080p", constraints: { width: 1920, height: 1080 } },
  ];

  const isSingleParticipant = participants.length === 1;

  useEffect(() => {
    Object.values(participantVideoRefs.current).forEach((video) => {
      if (video) video.volume = volume / 100;
    });
  }, [volume, participantStreams]);

  useEffect(() => {
    console.log("Participant Streams Updated:", participantStreams);
  }, [participantStreams]);

  // Effects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const guestId = urlParams.get("guestId");
    console.log(token, "token", guestId, "guestId");
    console.log(user, "userrssssssssssssssssssssssssss");
    socket.current = io("http://localhost:3011", {
      auth: { userId: user?._id, token: token, role: role },
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socket.current.on("connect", () => {
      console.log(
        role,
        guestName,
        "dssssssssssssssssssslfsdfklddddddddddddddd"
      );
      if (role === "guest") {
        if (!guestName) {
          setIsNameModalOpen(true);
        } else {
          socket.current.emit("requestJoin", {
            roomId,
            userId: user?._id || guestId,
          });
          setPendingApproval(true);
        }
      } else if (role === "host") {
        socket.current.emit(
          "joinRoom",
          { roomId, userId: user?._id },
          (response: any) => {
            if (response.success) initMediaSoup();
          }
        );
      }
    });

    const handleChatMessage = (message: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          user: message.sender,
          message: message.message,
          time:
            message.time ||
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        },
      ]);
    };

    const handlePrivateMessage = ({
      message,
      from,
      sender,
    }: {
      message: any;
      from: any;
      sender: string;
    }) => {
      setPrivateMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          user: sender,
          message: message,
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    };

    if (role === "guest" && (isCameraOn || isScreenSharing)) {
      const stream =
        webcamVideoRef.current?.srcObject || screenVideoRef.current?.srcObject;
      if (stream) {
        setParticipantStreams((prev) => ({
          ...prev,
          [user?._id]: stream as MediaStream,
        }));
      }
    }

    socket.current.on("joinApproved", () => {
      setPendingApproval(false);
      socket.current.emit(
        "joinRoom",
        { roomId, userId: user?._id || guestId, guestId, guestName },
        (response: any) => {
          if (response.success) initMediaSoup();
        }
      );
    });

    socket.current.on(
      "newProducer",
      async ({ producerId, userId }: { producerId: any; userId: any }) => {
        if (userId === user?._id) return;
        if (!deviceInitialized) {
          setPendingProducers((prev) => [...prev, { producerId, userId }]);
          return;
        }
        await consumeProducer(producerId, userId);
      }
    );

    socket.current.on("joinDenied", ({ message }: { message: string }) => {
      setPendingApproval(false);
      toast.error(message || "Join request denied");
      router.push("/dashboard/streamer/main");
    });
    //guesting adding removing

    socket.current.on(
      "guestAdded",
      ({ guestId, guestName }: { guestId: any; guestName: any }) => {
        toast.success(
          `${guestName} has joined the stream with guest ID ${guestId}`
        );
      }
    );

    //join request

    socket.current.on(
      "joinRequest",
      ({ guestId, guestSocketId }: { guestId: any; guestSocketId: any }) => {
        setGuestToApprove({ guestId, guestSocketId });
        console.log("Join request received for guest:", guestId);
        setIsApprovalModalOpen(true);
      }
    );

    socket.current.on("guestRemoved", ({ guestId }: { guestId: any }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== guestId));
      setParticipantStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[guestId];
        return newStreams;
      });
      if (guestId === user?._id) {
        cleanupStream();
        socket.current.disconnect();
        router.push("/dashboard/streamer/main");
      }
    });

    socket.current.on("participantsUpdated", (updatedParticipants: any) => {
      setParticipants(updatedParticipants);
      setParticipantStreams((prev) => {
        const newStreams = { ...prev };
        Object.keys(newStreams).forEach((userId) => {
          if (!updatedParticipants.some((p: any) => p.userId === userId)) {
            delete newStreams[userId];
          }
        });
        return newStreams;
      });
    });

    socket.current.on("guestRemoved", ({ guestId }: { guestId: string }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== guestId));
    });
    socket.current.on("streamStarted", () => setIsLive(true));
    socket.current.on("streamStopped", () => setIsLive(false));
    socket.current.on("streamerLeft", ({ hostId }: { hostId: any }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== hostId));
      setIsLive(false);
      setStreamerLeft(true);
    });

    socket.current.on("chatMessage", handleChatMessage);
    socket.current.on("privateMessage", handlePrivateMessage);

    socket.current.on("sceneChanged", ({ sceneId }: { sceneId: any }) => {
      setScenes(
        scenes.map((scene) => ({ ...scene, isActive: scene.id === sceneId }))
      );
    });

    socket.current.on("captionAdded", ({ caption }: { caption: any }) => {
      setCaptions((prev) => [...prev, caption]);
    });

    if (user?.username) {
      const nameParts = user.username.split(" ");
      setUserInitials(
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[1][0]}`
          : nameParts[0][0]
      );
    }

    socket.current.on(
      "streamerLeft",
      ({ roomId: receivedRoomId }: { roomId: string }) => {
        if (receivedRoomId === roomId) setStreamerLeft(true);
      }
    );

    socket.current.on(
      "existingProducers",
      ({ producers }: { producers: any }) => {
        producers.forEach(
          ({ producerId, userId }: { producerId: any; userId: any }) => {
            if (userId !== user?._id) {
              if (!deviceInitialized) {
                setPendingProducers((prev) => [
                  ...prev,
                  { producerId, userId },
                ]);
              } else {
                consumeProducer(producerId, userId);
              }
            }
          }
        );
      }
    );

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.current.off("streamerLeft");
      socket.current.off("newProducer");
      socket.current.off("sceneChanged");
      socket.current.off("captionAdded");
      socket.current.off("chatMessage", handleChatMessage);
      socket.current.off("privateMessage", handlePrivateMessage);
      if (isLive) cleanupStream();
    };
  }, [
    user?.username,
    user?._id,
    currentStream,
    isLive,
    channelId,
    role,
    guestName,
  ]);

  useEffect(() => {
    if (deviceInitialized && pendingProducers.length > 0) {
      pendingProducers.forEach(({ producerId, userId }) => {
        consumeProducer(producerId, userId);
      });
      setPendingProducers([]);
    }
  }, [deviceInitialized, pendingProducers]);

  //consuming producer helper

  const consumeProducer = async (producerId: any, userId: any) => {
    if (!device || !consumerTransport || !socket.current) {
      console.log("Device or consumer transport not initialized");
      return;
    }
    socket.current.emit(
      "consume",
      {
        producerId,
        rtpCapabilities: device.rtpCapabilities,
        transportId: consumerTransport.id,
        roomId,
      },
      async (params: any) => {
        if (!params || !params.id) {
          console.error("Invalid consumer params:", params);
          return;
        }
        try {
          const consumer = await consumerTransport.consume(params);
          const stream = new MediaStream([consumer.track]);
          setParticipantStreams((prev) => ({
            ...prev,
            [userId]: stream,
          }));
          const videoElement = participantVideoRefs.current[userId];
          if (videoElement) {
            videoElement.srcObject = stream;
            videoElement
              .play()
              .catch((err) =>
                console.error(`Error playing video for ${userId}:`, err)
              );
          }
        } catch (err) {
          console.error(`Error consuming producer ${producerId}:`, err);
        }
      }
    );
  };

  const initMediaSoup = async () => {
    try {
      const mediasoupDevice = new mediasoupClient.Device();
      socket.current?.emit(
        "getRouterRtpCapabilities",
        {},
        async (
          routerRtpCapabilities: mediasoupClient.types.RtpCapabilities
        ) => {
          if (!routerRtpCapabilities) {
            console.error("Failed to get router RTP capabilities");
            return;
          }
          await mediasoupDevice.load({ routerRtpCapabilities });
          setDevice(mediasoupDevice);
          setDeviceInitialized(true);
          const transport: any = await createConsumerTransport(mediasoupDevice);
          setConsumerTransport(transport);
        }
      );
    } catch (err) {
      console.error("Error initializing MediaSoup:", err);
    }
  };

  const participantVideoRefs = useRef<{
    [userId: string]: HTMLVideoElement | null;
  }>({});

  useEffect(() => {
    Object.entries(participantStreams).forEach(([userId, stream]) => {
      const videoElement = participantVideoRefs.current[userId];
      if (videoElement && stream) {
        console.log(stream, "stream coming");
        videoElement.srcObject = stream;
        videoElement
          .play()
          .catch((err) =>
            console.error(`Error playing video for ${userId}:`, err)
          );
      } else if (!stream) {
        console.warn(`No stream found for user ${userId}`);
      } else if (!videoElement) {
        console.warn(`No video element found for user ${userId}`);
      }
    });
  }, [participantStreams]);
  useEffect(() => {
    if (device && deviceInitialized && isCameraOn) startWebcamStream();
  }, [device, deviceInitialized, isCameraOn]);

  console.log(
    role,
    "rooooooooooooooooooooooooooooooooleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  );

  useEffect(() => {
    if (role === "host") {
      localStorage.setItem(`scenes_${channelId}`, JSON.stringify(scenes));
      localStorage.setItem(`captions_${channelId}`, JSON.stringify(captions));
    }
    if (musicUrl) localStorage.setItem(`music_${channelId}`, musicUrl);
  }, [scenes, captions, musicUrl, channelId, role]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setFullScreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Countdown logic for scheduled streams
  useEffect(() => {
    if (currentStream?.schedule?.dateTime && !isLive) {
      const scheduleTime = new Date(currentStream.schedule.dateTime).getTime();
      const now = Date.now();
      const timeDiff = (scheduleTime - now) / 1000;

      if (timeDiff > 0) {
        const countdownStart = Math.max(timeDiff - 10, 0);
        const timeoutId = setTimeout(() => {
          setCountdown(10);
          const intervalId = setInterval(() => {
            setCountdown((prev) => {
              if (prev === 1) {
                clearInterval(intervalId);
                setCanGoLive(true);
                return null;
              }
              return prev! - 1;
            });
          }, 1000);
        }, countdownStart * 1000);

        return () => clearTimeout(timeoutId);
      } else {
        setCanGoLive(true);
      }
    } else {
      setCanGoLive(true);
    }
  }, [currentStream, isLive]);

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isLive && role === "host") {
      socket.current?.emit("streamerLeft", { roomId });
      e.preventDefault();
      e.returnValue = "You are streaming. Are you sure you want to leave?";
    }
  };
  const handleGuestExit = () => {
    if (role !== "guest") return;
    socket.current.emit("leaveRoom", { roomId, userId: user?._id });
    cleanupStream();
    socket.current.disconnect();
    router.push("/dashboard/streamer/main");
  };
  let isProducing = false;

  const startWebcamStream = async () => {
    if (isProducing) {
      console.log("Already producing, please wait...");
      return;
    }
    isProducing = true;

    try {
      if (!device || !deviceInitialized || !socket.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.muted = true;
        webcamVideoRef.current.addEventListener(
          "loadedmetadata",
          () => {
            webcamVideoRef.current
              ?.play()
              .catch((err) => console.error("Error playing video:", err));
          },
          { once: true }
        );
      }

      const transport: any =
        producerTransport || (await createProducerTransport());
      if (!producerTransport) setProducerTransport(transport);

      // Handle audio producer
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        if (audioProducer) {
          if (audioProducer) {
            audioProducer.close();
            setAudioProducer(null);
          }
        }
        const newAudioProducer = await transport.produce({
          track: audioTrack,
          appData: { userId: user?._id },
        });
        setAudioProducer(newAudioProducer);
        if (isMuted) await newAudioProducer.pause();
        else await newAudioProducer.resume();
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && isCameraOn) {
        if (videoProducer) {
          videoProducer.close();
          setVideoProducer(null);
        }
      }

      const newVideoProducer = await transport.produce({
        track: videoTrack,
        appData: { userId: user?._id },
      });
      setVideoProducer(newVideoProducer);
      setParticipantStreams((prev) => ({ ...prev, [user?._id]: stream }));
    } catch (err) {
      console.error("Error starting webcam stream:", err);
      setIsCameraOn(false);
    } finally {
      isProducing = false;
    }
  };

  const handleRemoveGuest = (guestId: string) => {
    setGuestToRemove(guestId);
    setShowRemoveModal(true);
  };

  const confirmRemoveGuest = () => {
    if (guestToRemove && role === "host") {
      socket.current.emit(
        "removeGuest",
        { roomId, guestId: guestToRemove },
        (response: any) => {
          if (response.success) {
            setParticipants((prev) =>
              prev.filter((p) => p.userId !== guestToRemove)
            );
          }
        }
      );
      setShowRemoveModal(false);
      setGuestToRemove(null);
    }
  };

  const changeQuality = async (newQuality: string) => {
    setQuality(newQuality);
    if (isCameraOn && device) {
      const selectedQuality = qualityOptions.find(
        (q) => q.label === newQuality
      );
      await restartWebcamStream(selectedQuality?.constraints);
    }
  };

  const restartWebcamStream = async (constraints?: {
    width: number;
    height: number;
  }) => {
    if (videoProducer) {
      videoProducer.close();
      setVideoProducer(null);
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: constraints || true,
      audio: true,
    });
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = stream;
      webcamVideoRef.current.style.transform = isMirrored
        ? "scaleX(-1)"
        : "scaleX(1)";
    }

    const transport: any =
      producerTransport || (await createProducerTransport());
    const videoTrack = stream.getVideoTracks()[0];
    const newVideoProducer = await transport.produce({ track: videoTrack });
    setVideoProducer(newVideoProducer);
  };

  const createProducerTransport = async () => {
    return new Promise((resolve) => {
      socket.current.emit(
        "createProducerTransport",
        {},
        async (params: any) => {
          const transport = device!.createSendTransport(params);
          transport.on("connect", async ({ dtlsParameters }, callback) => {
            socket.current?.emit(
              "connectProducerTransport",
              { transportId: transport.id, dtlsParameters, roomId },
              callback
            );
          });
          transport.on("produce", async ({ kind, rtpParameters }, callback) => {
            socket.current?.emit(
              "produce",
              { transportId: transport.id, kind, rtpParameters, roomId },
              (id: string) => callback({ id })
            );
          });
          resolve(transport);
        }
      );
    });
  };

  const createConsumerTransport = async (device: mediasoupClient.Device) => {
    return new Promise((resolve, reject) => {
      socket.current.emit(
        "createConsumerTransport",
        {},
        async (params: any) => {
          if (!params || !params.id) {
            console.error("Invalid transport params:", params);
            reject(new Error("Missing or invalid transport parameters"));
            return;
          }
          try {
            const transport = device.createRecvTransport(params);
            transport.on("connect", async ({ dtlsParameters }, callback) => {
              socket.current.emit(
                "connectConsumerTransport",
                { transportId: transport.id, dtlsParameters, roomId },
                callback
              );
            });
            resolve(transport);
          } catch (error) {
            console.error("Error creating consumer transport:", error);
            reject(error);
          }
        }
      );
    });
  };
  const startRecording = async () => {
    const activeStream =
      webcamVideoRef.current?.srcObject || screenVideoRef.current?.srcObject;
    if (!activeStream) return;

    const stream = activeStream as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });
    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      if (saveLocally) {
        const fileName = `recording_${channelId}_${Date.now()}.webm`;
        saveAs(blob, fileName);
      } else {
        const buffer = Buffer.from(await blob.arrayBuffer());
        const key = `recordings/${channelId}/${Date.now()}.webm`;
        try {
          const s3Url = await uploadToS3(buffer, key, "video/webm");
          setRecordingUrl(s3Url);
          socket.current?.emit("recordingAvailable", { roomId, url: s3Url });
        } catch (error) {
          console.error("Error uploading to S3:", error);
        }
      }
    };

    mediaRecorder.start();
    setIsRecordingActive(true);
    socket.current?.emit("startRecording", { roomId });

    const stopRecording = () => {
      mediaRecorder.stop();
      setIsRecordingActive(false);
      socket.current?.emit("stopRecording", { roomId });
    };
    stopRecordingRef.current = stopRecording;
    return stopRecording;
  };

  const toggleRecording = () => {
    if (!isRecording) {
      if (!isCameraOn && !isScreenSharing) {
        console.log("Cannot record: Camera and Screen Share are off");
        return;
      }
      const stopRecording = startRecording();
      setIsRecording(true);
      setTimeout(() => {
        if (stopRecordingRef.current) {
          stopRecordingRef.current();
          setIsRecording(false);
        }
      }, 60000);
    } else {
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
        setIsRecording(false);
        stopRecordingRef.current = null;
      }
    }
  };

  const toggleFullScreen = () => {
    if (!fullScreen) studioRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };
  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (audioProducer) {
      if (newMutedState) {
        await audioProducer.pause();
      } else {
        await audioProducer.resume();
      }
    }
  };
  const toggleCamera = async () => {
    if (!device || !deviceInitialized) return;
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);

    if (!newCameraState) {
      if (videoProducer) {
        await new Promise<void>((resolve, reject) => {
          socket.current.emit(
            "closeProducer",
            { producerId: videoProducer.id, roomId },
            (response: any) => {
              if (response.success) {
                console.log(`Producer ${videoProducer.id} closed successfully`);
                setVideoProducer(null);
                resolve();
              }
            }
          );
        });

        if (webcamVideoRef.current?.srcObject) {
          const stream = webcamVideoRef.current.srcObject as MediaStream;
          stream.getVideoTracks().forEach((track) => track.stop());
          if (audioProducer && !isMuted) {
            const audioStream = new MediaStream([audioProducer.track]);
            webcamVideoRef.current.srcObject = audioStream;
            await webcamVideoRef.current.play();
          } else {
            webcamVideoRef.current.srcObject = null;
          }
          webcamVideoRef.current.style.transform = isMirrored
            ? "scaleX(-1)"
            : "scaleX(1)";
        }
      }
    } else {
      await startWebcamStream();
    }
  };
  const handleAddMediaScene = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    if (role !== "host") return;
    event.preventDefault();
    const fileInput = event.currentTarget.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput?.files?.length) {
      const file = fileInput.files[0];
      try {
        const mediaUrl = await uploadToCloudinary(file);
        const newScene: Scene = {
          id: (scenes.length + 1).toString(),
          name: `Media Scene ${scenes.length + 1}`,
          isActive: false,
          type: "media",
          mediaUrl,
          channelId,
        };
        setScenes([...scenes, newScene]);
        setIsMediaModalOpen(false);
      } catch (error) {
        console.error("Failed to upload media:", error);
      }
    }
  };

  const selectScene = (id: string) => {
    if (role !== "host") return;
    setScenes(scenes.map((scene) => ({ ...scene, isActive: scene.id === id })));
    socket.current.emit("selectScene", { roomId, sceneId: id });
  };

  const toggleScreenShare = async () => {
    if (!device || !socket.current || !deviceInitialized) return;

    if (!isScreenSharing) {
      setIsScreenSharing(true);
      try {
        const screenStream: any = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          await screenVideoRef.current.play();
          screenStream.oninactive = async () => {
            setIsScreenSharing(false);
            if (screenProducer) {
              screenProducer.close();
              await new Promise<void>((resolve) => {
                socket.current.emit(
                  "producerClosed",
                  { producerId: screenProducer.id, roomId },
                  () => resolve()
                );
              });
              setScreenProducer(null);
            }
            if (screenAudioProducer) {
              screenAudioProducer.close();
              await new Promise<void>((resolve) => {
                socket.current.emit(
                  "producerClosed",
                  { producerId: screenAudioProducer.id, roomId },
                  () => resolve()
                );
              });
              setScreenAudioProducer(null);
            }
            if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
          };
        }

        const transport: any =
          producerTransport || (await createProducerTransport());
        if (!producerTransport) setProducerTransport(transport);

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        if (screenVideoTrack) {
          const newScreenProducer = await transport.produce({
            track: screenVideoTrack,
            appData: { userId: user?._id },
          });
          setScreenProducer(newScreenProducer);
          await new Promise<void>((resolve) => {
            socket.current.emit(
              "produce",
              {
                transportId: transport.id,
                kind: newScreenProducer.kind,
                rtpParameters: newScreenProducer.rtpParameters,
                roomId,
              },
              () => resolve()
            );
          });
        }

        const screenAudioTrack = screenStream.getAudioTracks()[0];
        if (screenAudioTrack) {
          const newScreenAudioProducer = await transport.produce({
            track: screenAudioTrack,
            appData: { userId: user?._id },
          });
          setScreenAudioProducer(newScreenAudioProducer);
          await new Promise<void>((resolve) => {
            socket.current.emit(
              "produce",
              {
                transportId: transport.id,
                kind: newScreenAudioProducer.kind,
                rtpParameters: newScreenAudioProducer.rtpParameters,
                roomId,
              },
              () => resolve()
            );
          });
        }

        setParticipantStreams((prev) => ({
          ...prev,
          [user?._id]: screenStream,
        }));
      } catch (err) {
        console.error("Error starting screen share:", err);
        setIsScreenSharing(false);
        if (screenVideoRef.current?.srcObject) {
          const stream = screenVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          screenVideoRef.current.srcObject = null;
        }
      }
    } else {
      if (screenProducer) {
        screenProducer.close();
        await new Promise<void>((resolve) => {
          socket.current.emit(
            "producerClosed",
            { producerId: screenProducer.id, roomId },
            (response) => {
              if (response?.success) {
                console.log(
                  `Screen producer ${screenProducer.id} closed successfully`
                );
              }
              resolve();
            }
          );
        });
        setScreenProducer(null);
      }

      if (screenAudioProducer) {
        screenAudioProducer.close();
        await new Promise<void>((resolve) => {
          socket.current.emit(
            "producerClosed",
            { producerId: screenAudioProducer.id, roomId },
            (response) => {
              if (response?.success) {
                console.log(
                  `Screen audio producer ${screenAudioProducer.id} closed successfully`
                );
              }
              resolve();
            }
          );
        });
        setScreenAudioProducer(null);
      }

      if (screenVideoRef.current?.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        screenVideoRef.current.srcObject = null;
      }

      setIsScreenSharing(false);
      setParticipantStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[user?._id];
        return newStreams;
      });
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (webcamVideoRef.current) webcamVideoRef.current.volume = value[0] / 100;
    if (screenVideoRef.current) screenVideoRef.current.volume = value[0] / 100;
    if (audioRef.current) audioRef.current.volume = value[0] / 100;
  };

  const toggleVolumeSlider = () => setShowVolumeSlider(!showVolumeSlider);

  const toggleLive = async () => {
    if (role !== "host") {
      console.log("Only the host can start or stop the stream.");
      return;
    }
    if (isLive) {
      cleanupStream();
      socket.current?.emit("stopStream", { roomId });
      setIsLive(false);
      setStreamerLeft(false);
      try {
        await editStream({
          id: currentStream.id,
          updateData: { status: "stopped" },
        });
      } catch (error) {
        console.error("Failed to stop stream:", error);
      }
    } else {
      socket.current?.emit("startStream", { roomId });
      setIsLive(true);
      if (isCameraOn) startWebcamStream();
    }
  };

  const cleanupStream = () => {
    const stopTracks = (stream: MediaStream | null) =>
      stream?.getTracks().forEach((track) => track.stop());
    stopTracks(webcamVideoRef.current?.srcObject as MediaStream);
    stopTracks(screenVideoRef.current?.srcObject as MediaStream);
    videoProducer?.close();
    audioProducer?.close();
    screenProducer?.close();
    producerTransport?.close();
    consumerTransport?.close();
    setVideoProducer(null);
    setAudioProducer(null);
    setScreenProducer(null);
    setProducerTransport(null);
    setConsumerTransport(null);
    setIsScreenSharing(false);
    setIsCameraOn(false);
    setIsMuted(true);
    setParticipantStreams({});
  };
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: user?.username || "User",
        message: newMessage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, message]);
      socket.current?.emit("chatMessage", { roomId, message });
      setNewMessage("");
    }
  };

  const sendPrivateMessage = (e: any, targetUserId: any) => {
    e.preventDefault();
    if (newPrivateMessage.trim()) {
      const message = {
        id: privateMessages.length + 1,
        user: user?.username || "User",
        message: newPrivateMessage,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setPrivateMessages([...privateMessages, message]);
      socket.current?.emit("privateMessage", {
        roomId,
        message,
        userId: user?._id,
        targetUserId: role === "host" ? targetUserId : undefined,
      });
      setNewPrivateMessage("");
    }
  };

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMusicUrl(url);
      localStorage.setItem(`music_${channelId}`, url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsMusicPlaying(true);
      }
    }
  };

  const playMusic = () => {
    if (musicUrl && audioRef.current) {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const addCaption = () => {
    if (role !== "host") return;
    if (newCaption.trim()) {
      const caption: Caption = {
        id: Date.now().toString(),
        text: newCaption,
        timestamp: new Date(),
      };
      setCaptions([...captions, caption]);
      setNewCaption("");
      socket.current.emit("addCaption", { roomId, caption });
    }
  };

  const deleteCaption = (id: string) => {
    if (role !== "host") return;
    setCaptions(captions.filter((caption) => caption.id !== id));
  };

  const layouts = [
    {
      id: 1,
      icon: <Grid2X2 className="h-4 w-4" />,
      className: "grid grid-cols-1 gap-4",
    },
    {
      id: 2,
      icon: <AlignJustify className="h-4 w-4" />,
      className: "grid grid-cols-2 gap-4",
    },
    {
      id: 3,
      icon: <Layers className="h-4 w-4" />,
      className: "grid grid-cols-3 gap-4",
    },
    {
      id: 4,
      icon: <LayoutGrid className="h-4 w-4" />,
      className: "grid grid-cols-4 gap-4",
    },
  ];

  const getParticipantPosition = (
    userId: string,
    totalParticipants: number
  ) => {
    if (totalParticipants <= 1) return "w-full";
    const index = participants.findIndex((p) => p.userId === userId);
    switch (selectedLayout) {
      case 1:
        return "w-full";
      case 2:
        return index === 0 ? "w-1/2" : "w-1/2 ml-auto";
      case 3:
        return `w-1/3 ${
          index === 0 ? "ml-0" : index === 1 ? "ml-1/3" : "ml-2/3"
        }`;
      case 4:
        return `w-1/4 ${
          index === 0
            ? "ml-0"
            : index === 1
            ? "ml-1/4"
            : index === 2
            ? "ml-2/4"
            : "ml-3/4"
        }`;
      default:
        return "w-full";
    }
  };

  const getInitials = (username: string) => {
    const nameParts = username.split(" ");
    return nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : nameParts[0][0].toUpperCase() || "U";
  };

  const toggleView = () => setIsMobileView(!isMobileView);

  const generateInviteLink = () => {
    if (role !== "host") return;
    socket.current.emit(
      "generateInvite",
      { roomId, userId: user?._id },
      (response: any) => {
        if (response.inviteLink) {
          setInviteLink(response.inviteLink);
          navigator.clipboard.writeText(response.inviteLink);
          console.log("Invite link copied:", response.inviteLink);
        }
      }
    );
  };
  if (pendingApproval) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold mb-2">
          Waiting for host approval...
        </h2>
        <p className="text-gray-400 text-sm">This may take a moment</p>
      </div>
    );
  }
  // Render
  return (
    <motion.div
      className={`flex flex-col w-full h-full ${
        isMobileView ? "flex-row" : "flex-col"
      } bg-[#0a152c]`}
      ref={studioRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Countdown Overlay */}
      {countdown !== null && !isLive && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={countdown}
            className="text-white text-9xl font-bold"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {countdown}
          </motion.div>
        </motion.div>
      )}
      <div
        className={`flex items-center justify-between px-4 py-2 bg-[#0a152c] border-b border-[#1a2641] w-full`}
      >
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <Button
            onClick={() => router.replace("/dashboard/streamer/main")}
            variant="ghost"
            size="sm"
            className="text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {streamTitle} - {streamStatus}, {streamDate}
            {role === "host" && (
              <Badge className="ml-2 bg-green-500">Host</Badge>
            )}
          </Button>
        </motion.div>
        <motion.div
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            className="text-white bg-[#3a1996] border-none hover:bg-[#4c22c0]"
          >
            GO PRO
          </Button>

          {role === "host" && (
            <div className="flex items-center gap-2 ml-4">
              <Switch
                id="recording"
                checked={isRecording}
                onCheckedChange={toggleRecording}
                disabled={!isCameraOn && !isScreenSharing}
              />
              <Label htmlFor="recording" className="text-white">
                Record
              </Label>
              <Switch
                id="save-locally"
                checked={saveLocally}
                onCheckedChange={setSaveLocally}
                disabled={isRecording}
              />
              <Label htmlFor="save-locally" className="text-white">
                {saveLocally ? "Save Locally" : "Save to Cloud"}
              </Label>
            </div>
          )}
          {role === "host" && (
            <Button
              variant="default"
              size="sm"
              className="bg-[#ff4d00] hover:bg-[#ff6b2c] text-white border-none"
              onClick={toggleLive}
              disabled={!isLive && !canGoLive}
            >
              {isLive ? "Stop Live" : "Go Live"}
            </Button>
          )}
        </motion.div>
      </div>
      <div
        className={`flex flex-grow w-full h-full ${
          isMobileView ? "flex-col" : "flex-row"
        }`}
      >
        <motion.div
          className={`bg-[#0a152c] border-r border-[#1a2641] p-2 ${
            isMobileView ? "w-[34%] h-auto" : "w-64 h-full"
          }`}
          initial={{ width: 0 }}
          animate={{ width: isMobileView ? "100%" : 256 }}
          transition={{ duration: 0.3 }}
        >
          {role === "host" && (
            <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center mb-3 text-black border-[#1a2641] hover:bg-[#1a2641]"
                  onClick={() => setIsMediaModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Media Scene
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Add Media Scene
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMediaScene} className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      e.target.files && setNewMediaUrl(e.target.files[0].name)
                    }
                  />
                  <Button type="submit">Upload Scene</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <div className="space-y-2 h-full ">
            {scenes.map((scene) => (
              <motion.div
                key={scene.id}
                className={`p-2 rounded cursor-pointer ${
                  scene.isActive
                    ? "bg-[#1a2641] border-l-2 border-[#ff4d00]"
                    : "hover:bg-[#1a2641]"
                }`}
                onClick={() => selectScene(scene.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-full h-12 bg-gradient-to-br from-[#e91e63] to-[#2196f3] rounded mb-1 flex justify-center items-center">
                    {scene.type === "webcam" && (
                      <User className="h-5 w-5 text-white" />
                    )}
                    {scene.type === "screen" && (
                      <Monitor className="h-5 w-5 text-white" />
                    )}
                    {scene.type === "media" && scene.mediaUrl && (
                      <ImageIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-white">{scene.name}</span>
                </div>
              </motion.div>
            ))}
            <div className="w-64 bg-[#0a152c] border-l border-[#1a2641] p-4 flex flex-col items-start">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Participants
              </h3>

              <div className="w-full">
                {participants.map((p: any) => (
                  <div
                    key={p.userId}
                    className="text-white mb-2 flex items-center p-2 rounded-lg hover:bg-[#1a2641] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      {p.name}{" "}
                      <span className="text-sm text-gray-400">({p.role})</span>
                    </span>
                  </div>
                ))}
              </div>

              {role === "host" && (
                <Button
                  onClick={generateInviteLink}
                  className="mt-4 bg-[#ff4d00] text-white hover:bg-[#e64500] transition-colors flex items-center justify-center w-full py-2 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Invite Guest
                </Button>
              )}

              {inviteLink && role === "host" && (
                <div className="mt-4 text-white text-sm p-2 bg-[#1a2641] rounded-lg w-full">
                  <span className="font-medium">Link:</span> {inviteLink}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div
          className={`flex-grow flex flex-col bg-[#0a152c] ${
            isMobileView ? "ml-0 h-full" : "ml-5 h-full"
          }`}
        >
          <div className="p-2 flex items-center">
            <span className="text-white text-sm mr-2">
              Resolution: {quality}
            </span>
          </div>

          <div className="flex-grow flex justify-center relative h-full">
            {streamerLeft &&
            currentStream?.fallbackVideoUrl &&
            !(role === "guest" && (isCameraOn || isScreenSharing)) ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                <video
                  ref={fallbackVideoRef}
                  src={currentStream.fallbackVideoUrl}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute text-white text-lg bg-black/70 p-4 rounded">
                  The streamer is not available. Playing fallback content.
                </div>
              </div>
            ) : (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 h-full"
                  style={{
                    backgroundImage:
                      scenes.find((s) => s.isActive)?.type === "media" &&
                      scenes.find((s) => s.isActive)?.mediaUrl
                        ? `url(${scenes.find((s) => s.isActive)?.mediaUrl})`
                        : "linear-gradient(to bottom right, #ff416c, #ff4b2b)",
                  }}
                />
                <motion.div
                  className={`relative w-full max-w-5xl h-screen flex items-center justify-center ${
                    isSingleParticipant
                      ? ""
                      : layouts[selectedLayout - 1].className
                  } transition-all duration-300 ease-in-out ${
                    isMobileView ? "max-w-full h-full" : ""
                  }`}
                  layout
                >
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.userId}
                      className={`rounded-md overflow-hidden relative w-full bg-black ${getParticipantPosition(
                        participant.userId,
                        participants.length
                      )} h-full z-10`}
                      layout
                      transition={{ duration: 0.3 }}
                    >
                      {participant.userId === user?._id ? (
                        <>
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
                                  style={{
                                    transform: isMirrored
                                      ? "scaleX(-1)"
                                      : "scaleX(1)",
                                  }}
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

                          {isScreenSharing && isCameraOn && (
                            <motion.div
                              className="absolute top-2 right-2 w-32 h-24 rounded-md overflow-hidden bg-black z-20"
                              initial={{ x: 100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: 100, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <video
                                ref={webcamVideoRef}
                                autoPlay
                                playsInline
                                muted={true}
                                className="w-full h-full object-cover"
                                style={{
                                  transform: isMirrored
                                    ? "scaleX(-1)"
                                    : "scaleX(1)",
                                }}
                              />
                            </motion.div>
                          )}
                        </>
                      ) : participantStreams[participant.userId] ? (
                        <ParticipantVideo
                          userId={participant.userId}
                          stream={participantStreams[participant.userId]}
                          ref={(el) => {
                            participantVideoRefs.current[participant.userId] =
                              el;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
                            <span className="text-4xl font-bold text-white">
                              {getInitials(participant.name)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0a152c40] z-10 flex justify-between items-center">
                        <span className="text-white text-sm">
                          {participant.name}
                        </span>
                        {role === "host" &&
                          participant.userId !== user?._id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() =>
                                handleRemoveGuest(participant.userId)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        {role === "host" &&
                          participant.userId === user?._id && (
                            <Badge className="ml-2 bg-green-500 text-xs">
                              Host
                            </Badge>
                          )}
                      </div>
                    </motion.div>
                  ))}

                  <div className="absolute bottom-4 left-4 z-10">
                    {captions.map((caption) => (
                      <motion.div
                        key={caption.id}
                        className="bg-black/70 text-white p-2 rounded-md mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {caption.text}
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    className="absolute top-2 right-2 flex flex-col gap-1 z-10"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
                        onClick={toggleVolumeSlider}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
                        onClick={toggleFullScreen}
                      >
                        {fullScreen ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#0a152c] border-[#1a2641] text-white">
                          <DropdownMenuItem
                            onClick={() => setIsMirrored(!isMirrored)}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            {isMirrored ? "Unmirror Camera" : "Mirror Camera"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                Quality
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-[#0a152c] border-[#1a2641] text-white">
                                {qualityOptions.map((option) => (
                                  <DropdownMenuItem
                                    key={option.label}
                                    onClick={() => changeQuality(option.label)}
                                  >
                                    {option.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          className="bg-black/60 p-2 rounded-md w-32 z-10"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Slider
                            defaultValue={[volume]}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                          />
                          <div className="flex justify-between mt-1">
                            <VolumeX className="h-3 w-3 text-white" />
                            <Volume2 className="h-3 w-3 text-white" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-[#0a152c] rounded-md p-1 flex">
                      {layouts.map((layout) => (
                        <Button
                          key={layout.id}
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-12 p-1 ${
                            selectedLayout === layout.id && !isSingleParticipant
                              ? "bg-[#1e3a8a] text-white"
                              : "text-gray-400 hover:bg-[#1a2641]"
                          }`}
                          onClick={() =>
                            !isSingleParticipant && setSelectedLayout(layout.id)
                          }
                          disabled={isSingleParticipant}
                        >
                          {layout.icon}
                        </Button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-10 w-10 p-0 rounded-full ${
                                  isMuted
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-[#0a152c] border-[#1a2641] text-white"
                                }`}
                                onClick={toggleMute}
                              >
                                {isMuted ? (
                                  <VolumeX className="h-5 w-5" />
                                ) : (
                                  <Mic className="h-5 w-5" />
                                )}
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isMuted ? "Unmute" : "Mute"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-10 w-10 p-0 rounded-full ${
                                  !isCameraOn
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-[#0a152c] border-[#1a2641] text-white"
                                }`}
                                onClick={toggleCamera}
                              >
                                <Camera className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className={`h-10 w-10 p-0 rounded-full ${
                                  isScreenSharing
                                    ? "bg-green-500 text-white border-green-500"
                                    : "bg-[#0a152c] border-[#1a2641] text-white"
                                }`}
                                onClick={toggleScreenShare}
                              >
                                <Monitor className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isScreenSharing
                              ? "Stop Screen Share"
                              : "Start Screen Share"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {role === "host" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                                  onClick={generateInviteLink}
                                >
                                  <Users className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Invite Guest</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {role === "guest" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 w-10 p-0 rounded-full bg-[#ff4d00] text-white"
                                  onClick={handleGuestExit}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>Exit Stream</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                              >
                                <Settings className="h-5 w-5" />
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent>Settings</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}

            <motion.div
              className="absolute top-4 right-4 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-bold">S</span>
                </div>
                <span className="text-xl font-bold text-white">StremRx</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="px-4 py-2 bg-[#0a152c] border-t border-[#1a2641] flex justify-between items-center w-full z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-black border-[#1a2641] hover:bg-[#1a2641]"
              onClick={() => setShowPrivateChat(!showPrivateChat)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Private Chat
            </Button>
            <AnimatePresence>
              {showPrivateChat && (
                <motion.div
                  className="absolute bottom-16 left-4 w-64 bg-[#0a152c] border border-[#1a2641] p-2 rounded-md shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-white text-lg font-semibold mb-2">
                    Private Chat
                  </h3>
                  <div className="bg-black p-2 rounded-md h-48 overflow-y-auto z-30">
                    {privateMessages.map((message) => (
                      <div key={message.id} className="text-white mb-2">
                        <span className="font-bold">{message.user}:</span>{" "}
                        {message.message}{" "}
                        <span className="text-gray-400">({message.time})</span>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={sendPrivateMessage}
                    className="flex gap-2 mt-2"
                  >
                    <Input
                      value={newPrivateMessage}
                      onChange={(e) => setNewPrivateMessage(e.target.value)}
                      placeholder="Type a private message..."
                      className="bg-[#1a2641] text-white border-[#1a2641]"
                    />
                    <Button type="submit" className="bg-[#ff4d00] text-white">
                      Send
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              {inviteLink && role === "host" && (
                <motion.div
                  className="bg-black font-semibold p-2 rounded-md text-white mb-2 flex items-center "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>Invite Link: {inviteLink}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInviteLink(null)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={`text-white ${!isMobileView ? "bg-[#1a2641]" : ""}`}
                onClick={toggleView}
              >
                <Monitor className="h-4 w-4 mr-1" />
                {!isMobileView && "Desktop"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-white ${isMobileView ? "bg-[#1a2641]" : ""}`}
                onClick={toggleView}
              >
                <User className="h-4 w-4 mr-1" />
                {isMobileView && "Mobile"}
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div
          className={`w-64 bg-[#0a152c] border-l border-[#1a2641] flex flex-col items-center py-4 ${
            isMobileView ? "w-full border-t h-auto" : "h-full"
          }`}
          initial={{ width: 0 }}
          animate={{ width: isMobileView ? "100%" : 256 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4 w-full px-2">
            <div className="space-y-2">
              <h3 className="text-white text-lg font-semibold">Music</h3>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleMusicUpload}
                className="bg-[#1a2641] text-white border-[#1a2641]"
              />
              <Button
                onClick={playMusic}
                className="w-full bg-[#3a1996] text-white hover:bg-[#4c22c0]"
                disabled={isMusicPlaying || !musicUrl}
              >
                <Play className="h-4 w-4 mr-2" /> Play Music
              </Button>
              <Button
                onClick={stopMusic}
                className="w-full bg-[#ff4d00] text-white hover:bg-[#ff6b2c]"
                disabled={!isMusicPlaying}
              >
                <X className="h-4 w-4 mr-2" /> Stop Music
              </Button>
            </div>

            {role === "host" && (
              <div className="space-y-2">
                <h3 className="text-white text-lg font-semibold">Captions</h3>
                <Input
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Add caption..."
                  className="bg-[#1a2641] text-white border-[#1a2641]"
                />
                <Button
                  onClick={addCaption}
                  className="w-full bg-[#3a1996] text-white hover:bg-[#4c22c0]"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Caption
                </Button>
                <div className="bg-[#1a2641] p-2 rounded-md max-h-24 overflow-y-auto">
                  {captions.map((caption) => (
                    <div
                      key={caption.id}
                      className="text-white flex justify-between items-center mb-1"
                    >
                      {caption.text}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCaption(caption.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-white text-lg font-semibold">Chat</h3>
              <div className="bg-black p-2 rounded-md h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="text-white mb-2">
                    <span className="font-bold">{message.user}:</span>{" "}
                    {message.message}{" "}
                    <span className="text-gray-400">({message.time})</span>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-[#1a2641] text-white border-[#1a2641]"
                />
                <Button type="submit" className="bg-[#ff4d00] text-white">
                  Send
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
      <audio ref={audioRef} />
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
          </DialogHeader>
          <Input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            placeholder="Your name"
            className="bg-[#1a2641] text-white border-[#1a2641]"
          />
          <Button
            onClick={() => {
              console.log(inputName, "iinputtttttttttttt");
              if (inputName.trim()) {
                setGuestName(inputName.trim());
                setIsNameModalOpen(false);
                const urlParams = new URLSearchParams(window.location.search);
                const guestId = urlParams.get("guestId");
                socket.current.emit("requestJoin", {
                  roomId,
                  userId: user?._id || guestId,
                });
                setPendingApproval(true);
              }
            }}
            className="bg-[#ff4d00] text-white hover:bg-[#ff6b2c]"
          >
            Join
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Guest Join Request</DialogTitle>
          </DialogHeader>
          <p>
            Guest {guestToApprove?.guestId} wants to join the stream. Approve?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsApprovalModalOpen(false);
                setGuestToApprove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (guestToApprove) {
                  socket.current.emit("denyJoin", {
                    roomId,
                    guestId: guestToApprove.guestId,
                  });
                }
                setIsApprovalModalOpen(false);
                setGuestToApprove(null);
              }}
            >
              Deny
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (guestToApprove) {
                  socket.current.emit("approveJoin", {
                    roomId,
                    guestId: guestToApprove.guestId,
                    guestSocketId: guestToApprove.guestSocketId,
                  });
                }
                setIsApprovalModalOpen(false);
                setGuestToApprove(null);
              }}
            >
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showRemoveModal} onOpenChange={setShowRemoveModal}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Remove Guest</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this guest?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setShowRemoveModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveGuest}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
