"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import * as mediasoupClient from "mediasoup-client";
import io from "socket.io-client";
import { saveAs } from "file-saver";
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
  Calendar,
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

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: "webcam" | "screen" | "media";
  mediaUrl?: string;
  channelId?: string;
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
    schedule: { dateTime: Date };
    status: "pending" | "scheduled" | "started" | "stopped";
    createdAt: Date;
    updatedAt: Date;
  }[];
  user: any;
  channelData: any;
}

export const LiveStudio: React.FC<LiveStudioProps> = ({
  streams,
  user,
  channelData,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(1);
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
  const [isHost, setIsHost] = useState(false);
  const [deviceInitialized, setDeviceInitialized] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);


  const [isMirrored, setIsMirrored] = useState(false);
  const [quality, setQuality] = useState("720p");
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [producerTransport, setProducerTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [videoProducer, setVideoProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const [audioProducer, setAudioProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const [screenProducer, setScreenProducer] =
    useState<mediasoupClient.types.Producer | null>(null);
  const socket = useRef<any>(null);

  const studioRef = useRef<HTMLDivElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
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
    {
      id: 4,
      user: "Viewer4",
      message: "Looking forward to this!",
      time: "12:53",
    },
    {
      id: 5,
      user: "Viewer5",
      message: "Looking forward to this!",
      time: "12:53",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [userInitials, setUserInitials] = useState("DF");

  const currentStream: any = streams[0];
  const streamTitle = currentStream?.title || "Live Stream";
  const streamStatus = currentStream?.status || "pending";
  const streamDate =
    currentStream?.schedule?.dateTime?.toLocaleString() ||
    new Date().toLocaleString();
  const roomId = channelData?._id || "default-room";
  const channelId = channelData?._id;

  const qualityOptions = [
    { label: "480p", constraints: { width: 854, height: 480 } },
    { label: "720p", constraints: { width: 1280, height: 720 } },
    { label: "1080p", constraints: { width: 1920, height: 1080 } },
  ];

  const participants = [
    user?.username || "Donex fdz",
    "Viewer1",
    "Viewer2",
    "viewer3",
    "viewer4",
  ];
  const isSingleParticipant = participants.length === 1;

  useEffect(() => {
    socket.current = io("https://localhost:3011", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socket.current.on("connect", () => {
      console.log(`Socket connected`);
    });

    socket.current.emit(
      "joinRoom",
      { roomId, userId: user?._id },
      (response: any) => {
        if (response.success) {
          initMediaSoup();
        }
      }
    );

    setIsHost(user?._id === currentStream?.createdBy);

    const initMediaSoup = async () => {
      try {
        const mediasoupDevice = new mediasoupClient.Device();
        socket.current?.emit(
          "getRouterRtpCapabilities",
          {},
          async (
            routerRtpCapabilities: mediasoupClient.types.RtpCapabilities
          ) => {
            await mediasoupDevice.load({ routerRtpCapabilities });
            setDevice(mediasoupDevice);
            setDeviceInitialized(true);
          }
        );
      } catch (err) {
        console.error("Error initializing MediaSoup:", err);
      }
    };

    if (user?.username) {
      const nameParts = user?.username.split(" ");
      if (nameParts.length >= 2) {
        setUserInitials(`${nameParts[0][0]}${nameParts[1][0]}`);
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        setUserInitials(nameParts[0][0]);
      }
    }

    const checkSchedule = () => {
      if (scheduledTime && !isLive) {
        const now = new Date();
        if (now >= scheduledTime) {
          toggleLive();
          setScheduledTime(null);
        }
      }
    };

    const scheduleInterval = setInterval(checkSchedule, 1000);

    return () => {
      clearInterval(scheduleInterval);
      cleanupStream();
    };
  }, [user?.username, user?._id, currentStream, scheduledTime, isLive]);

  useEffect(() => {
    if (device && deviceInitialized && isCameraOn) {
      startWebcamStream();
    }
  }, [device, deviceInitialized, isCameraOn]);

  useEffect(() => {
    localStorage.setItem(`scenes_${channelId}`, JSON.stringify(scenes));
  }, [scenes, channelId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const startWebcamStream = async () => {
    if (!device || !socket.current) return;

    try {
      const selectedQuality = qualityOptions.find((q) => q.label === quality);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedQuality?.constraints || true,
        audio: true,
      });

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.muted = isMuted;
        webcamVideoRef.current.style.transform = isMirrored
          ? "scaleX(-1)"
          : "scaleX(1)";
        try {
          await webcamVideoRef.current.play();
        } catch (err) {
          console.error("Error playing webcam video:", err);
        }
      }

      const transport: any =
        producerTransport || (await createProducerTransport());
      if (!producerTransport) setProducerTransport(transport);

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const audioProd = await transport.produce({ track: audioTrack });
        setAudioProducer(audioProd);
        audioTrack.enabled = !isMuted;
      }

      if (isCameraOn && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        const videoProd = await transport.produce({ track: videoTrack });
        setVideoProducer(videoProd);
      }
    } catch (err) {
      console.error("Error starting webcam stream:", err);
      setIsCameraOn(false);
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

  const startRecording = async () => {
    if (!webcamVideoRef.current?.srcObject) return;

    const stream = webcamVideoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      saveAs(blob, `recording-${new Date().toISOString()}.webm`);
    };

    mediaRecorder.start();
    setIsRecordingActive(true);
    socket.current?.emit("startRecording", { roomId });

    return () => {
      mediaRecorder.stop();
      setIsRecordingActive(false);
      socket.current?.emit("stopRecording", { roomId });
    };
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const stopRecording = startRecording();
      setIsRecording(true);
      setTimeout(() => {
        stopRecording && stopRecording();
        setIsRecording(false);
      }, 60000); // Stop after 1 minute
    } else {
      setIsRecording(false);
    }
  };

  const toggleFullScreen = () => {
    if (!fullScreen) {
      studioRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (webcamVideoRef.current?.srcObject) {
      const stream = webcamVideoRef.current.srcObject as MediaStream;
      stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !newMutedState));
    }
    if (audioProducer) {
      audioProducer.enabled = !newMutedState;
    }
  };

  const toggleCamera = async () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);

    if (!newCameraState) {
      if (videoProducer) {
        videoProducer.close();
        setVideoProducer(null);
      }
      if (webcamVideoRef.current?.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach((track) => track.stop());
      }

      if (audioProducer && !isMuted) {
        const stream = new MediaStream();
        if (audioProducer?.track) {
          stream.addTrack(audioProducer.track);
        }
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          await webcamVideoRef.current.play();
        }
      } else {
        webcamVideoRef.current!.srcObject = null;
      }
    } else {
      const selectedQuality = qualityOptions.find((q) => q.label === quality);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedQuality?.constraints || true,
        audio: true,
      });

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.style.transform = isMirrored
          ? "scaleX(-1)"
          : "scaleX(1)";
      }
    }
  };

  const handleAddMediaScene = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
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
    setScenes(scenes.map((scene) => ({ ...scene, isActive: scene.id === id })));
  };

  const toggleScreenShare = async () => {
    if (!device || !socket.current) return;

    if (!isScreenSharing) {
      setIsScreenSharing(true);
      setTimeout(async () => {
        try {
          const screenStream: any =
            await navigator.mediaDevices.getDisplayMedia({
              video: true,
            });
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
            try {
              await screenVideoRef.current.play();
            } catch (err) {
              console.error("Error playing screen share video:", err);
            }
            screenStream.oninactive = () => {
              setIsScreenSharing(false);
              screenProducer?.close();
              setScreenProducer(null);
              screenVideoRef.current!.srcObject = null;
            };
          }

          const transport: any =
            producerTransport || (await createProducerTransport());
          const screenTrack = screenStream.getVideoTracks()[0];
          const producer = await transport.produce({ track: screenTrack });

          setScreenProducer(producer);
          if (!producerTransport) setProducerTransport(transport);
        } catch (err) {
          console.error("Error sharing screen:", err);
          setIsScreenSharing(false);
        }
      }, 100);
    } else {
      if (screenProducer) {
        screenProducer.close();
        setScreenProducer(null);
      }
      if (screenVideoRef.current?.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (webcamVideoRef.current) webcamVideoRef.current.volume = value[0] / 100;
    if (screenVideoRef.current) screenVideoRef.current.volume = value[0] / 100;
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const toggleLive = () => {
    if (isLive) {
      cleanupStream();
      socket.current?.emit("stopStream", { roomId });
      setIsLive(false);
    } else {
      socket.current?.emit("startStream", { roomId });
      setIsLive(true);
      if (isCameraOn) startWebcamStream();
    }
  };

  const cleanupStream = () => {
    const stopTracks = (stream: MediaStream | null) => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };

    stopTracks(webcamVideoRef.current?.srcObject as MediaStream);
    stopTracks(screenVideoRef.current?.srcObject as MediaStream);
    if (webcamVideoRef.current && screenVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
      screenVideoRef.current.srcObject = null;
    }

    videoProducer?.close();
    audioProducer?.close();
    screenProducer?.close();
    producerTransport?.close();
    socket.current?.disconnect();

    setVideoProducer(null);
    setAudioProducer(null);
    setScreenProducer(null);
    setProducerTransport(null);
    setIsScreenSharing(false);
    setIsCameraOn(false);
    setIsMuted(true);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: "User",
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
    username: string,
    totalParticipants: number
  ) => {
    if (totalParticipants <= 1) return "w-full";
    const index = participants.indexOf(username);
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
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      return nameParts[0][0].toUpperCase();
    }
    return "U";
  };

  const toggleView = () => {
    setIsMobileView(!isMobileView);
  };

  return (
    <motion.div
      className={`flex flex-col w-full h-screen ${
        isMobileView ? "flex-row" : "flex-col"
      } bg-[#0a152c]`}
      ref={studioRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 bg-[#0a152c] border-b border-[#1a2641] w-full`}
      >
        <motion.div
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center"
        >
          <Button variant="ghost" size="sm" className="text-white">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {streamTitle} - {streamStatus}, {streamDate}
            {isHost && <Badge className="ml-2 bg-green-500">Host</Badge>}
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
          <div className="flex items-center gap-2 ml-4">
            <Switch
              id="recording"
              checked={isRecording}
              onCheckedChange={toggleRecording}
            />
            <Label htmlFor="recording" className="text-white">
              Record
            </Label>
          </div>
          <Button
            variant="default"
            size="sm"
            className="bg-[#ff4d00] hover:bg-[#ff6b2c] text-white border-none"
            onClick={toggleLive}
          >
            {isLive ? "Stop Live" : "Go Live"}
          </Button>
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
              <DialogHeader className="">
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

          <div className="space-y-2 h-full overflow-y-auto">
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
            <div
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{
                backgroundImage:
                  scenes.find((s) => s.isActive)?.type === "media" &&
                  scenes.find((s) => s.isActive)?.mediaUrl
                    ? `url(${scenes.find((s) => s.isActive)?.mediaUrl})`
                    : "linear-gradient(to bottom right, #ff416c, #ff4b2b)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <motion.div
              className={`relative w-full max-w-4xl h-full flex items-center justify-center ${
                isSingleParticipant ? "" : layouts[selectedLayout - 1].className
              } transition-all duration-300 ease-in-out ${
                isMobileView ? "max-w-full" : ""
              }`}
              layout
            >
              {participants.map((participant, index) => (
                <motion.div
                  key={index}
                  className={`rounded-md overflow-hidden relative w-full bg-black ${getParticipantPosition(
                    participant,
                    participants.length
                  )} h-full z-10`}
                  layout
                  transition={{ duration: 0.3 }}
                >
                  {participant === user?.username && (
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
                              muted={isMuted}
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
                              muted={isMuted}
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
                            muted={isMuted}
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
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0a152c40] z-10">
                    <span className="text-white text-sm">{participant}</span>
                    {isHost && participant === user?.username && (
                      <Badge className="ml-2 bg-green-500 text-xs">Host</Badge>
                    )}
                  </div>
                </motion.div>
              ))}

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
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule Stream
                            </div>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a152c] text-white">
                            <DialogHeader>
                              <DialogTitle>Schedule Stream</DialogTitle>
                            </DialogHeader>
                            <input
                              type="datetime-local"
                              onChange={(e) =>
                                setScheduledTime(new Date(e.target.value))
                              }
                              className="w-full p-2 bg-[#1a2641] rounded text-white"
                            />
                          </DialogContent>
                        </Dialog>
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
                            <Users className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>Guests</TooltipContent>
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
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Private Chat
            </Button>

            <div className="flex gap-2">
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

        <div
          className={`w-16 bg-[#0a152c] border-l border-[#1a2641] flex flex-col items-center py-4 ${
            isMobileView ? "w-full border-t h-auto" : "h-full"
          }`}
        ></div>
      </div>
    </motion.div>
  );
};
