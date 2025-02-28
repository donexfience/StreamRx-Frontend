"use client";
import { useEffect, useState, useRef } from "react";
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

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: "webcam" | "screen" | "media";
  mediaUrl?: string;
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
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(1);
  const [scenes, setScenes] = useState<Scene[]>([
    { id: "1", name: "Webcam", isActive: true, type: "webcam" },
    { id: "2", name: "Demo", isActive: false, type: "screen" },
  ]);
  const [isPro, setIsPro] = useState(false);
  const [resolution, setResolution] = useState("720p");
  const [activeSidebarTab, setActiveSidebarTab] = useState("design");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [volume, setVolume] = useState(50);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [deviceInitialized, setDeviceInitialized] = useState(false);

  // MediaSoup and Socket states
  const [device, setDevice] = useState<mediasoupClient.Device | null>(null);
  const [producerTransport, setProducerTransport] =
    useState<mediasoupClient.types.Transport | null>(null);
  const [videoProducer, setVideoProducer] =
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
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [userInitials, setUserInitials] = useState("DF");

  const currentStream: any = streams;
  const streamTitle = currentStream?.title || "Live Stream";
  const streamStatus = currentStream?.status || "pending";
  const streamDate =
    currentStream?.schedule?.dateTime?.toLocaleString() ||
    new Date().toLocaleString();
  const roomId = channelData?._id || "default-room";
  console.log(channelData, "data of channel in the live");

  const participants = [
    user?.user?.username || "Donex fience",
    "Viewer1",
    "Viewer2",
  ];
  const isSingleParticipant = participants.length === 1;

  // Initialize socket connection and MediaSoup
  useEffect(() => {
    console.log("Initializing socket and MediaSoup");

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

    socket.current.emit("joinRoom", { roomId, userId: user?.user?.id });

    setIsHost(user?.user?.id === currentStream?.createdBy);

    const initMediaSoup = async () => {
      try {
        const mediasoupDevice = new mediasoupClient.Device();

        socket.current?.emit(
          "getRouterRtpCapabilities",
          {},
          async (rtpCapabilities: any) => {
            console.log("Got RTP capabilities:", rtpCapabilities);

            try {
              await mediasoupDevice.load({
                routerRtpCapabilities: rtpCapabilities,
              });

              console.log("MediaSoup device loaded successfully");
              setDevice(mediasoupDevice);
              setDeviceInitialized(true);
            } catch (err) {
              console.error("Error loading mediasoup device:", err);
            }
          }
        );
      } catch (err) {
        console.error("Error initializing MediaSoup:", err);
      }
    };

    initMediaSoup();

    socket.current.on("newProducer", (data: any) => {
      console.log("New producer joined:", data);
    });

    if (user?.user?.username) {
      const nameParts = user.user.username.split(" ");
      if (nameParts.length >= 2) {
        setUserInitials(`${nameParts[0][0]}${nameParts[1][0]}`);
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        setUserInitials(nameParts[0][0]);
      }
    }

    return () => {
      if (webcamVideoRef.current?.srcObject) {
        const stream = webcamVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      if (screenVideoRef.current?.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      socket.current?.disconnect();
    };
  }, [user?.user?.username, user?.user?.id, currentStream]);

  useEffect(() => {
    console.log(
      device,
      "device",
      deviceInitialized,
      "deviceInitialized",
      isCameraOn,
      "isCamerOn"
    );
    if (device && deviceInitialized && isCameraOn) {
      console.log(
        "Device initialized and camera is on, starting webcam stream"
      );
      startWebcamStream();
    }
  }, [device, deviceInitialized, isCameraOn]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const startWebcamStream = async () => {
    console.log("Starting webcam stream...");

    if (!device || !socket.current) {
      console.error("Device or socket not initialized");
      return;
    }

    try {
      console.log("Requesting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: !isMuted,
      });

      console.log("User media stream obtained:", stream);

      if (webcamVideoRef.current) {
        console.log("Setting webcam video source");
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded, playing...");
          webcamVideoRef.current?.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        };
      }

      console.log("Creating producer transport...");
      socket.current.emit(
        "createProducerTransport",
        {},
        async (params: any) => {
          console.log("Producer transport parameters:", params);

          try {
            const transport = device.createSendTransport(params);
            setProducerTransport(transport);

            transport.on("connect", async ({ dtlsParameters }, callback) => {
              socket.current?.emit(
                "connectProducerTransport",
                {
                  transportId: transport.id,
                  dtlsParameters,
                  roomId,
                },
                callback
              );
            });

            transport.on(
              "produce",
              async ({ kind, rtpParameters }, callback) => {
                console.log(`Transport produce event for ${kind}`);
                socket.current?.emit(
                  "produce",
                  {
                    transportId: transport.id,
                    kind,
                    rtpParameters,
                    roomId,
                  },
                  (id: string) => callback({ id })
                );
              }
            );

            const videoTrack = stream.getVideoTracks()[0];
            console.log("Creating video producer with track:", videoTrack);
            const producer = await transport.produce({ track: videoTrack });
            setVideoProducer(producer);
            console.log("Video producer created:", producer.id);

            // Also create audio producer if not muted
            if (!isMuted && stream.getAudioTracks().length > 0) {
              const audioTrack = stream.getAudioTracks()[0];
              console.log("Creating audio producer with track:", audioTrack);
              await transport.produce({ track: audioTrack });
            }
          } catch (err) {
            console.error("Error creating producer transport:", err);
          }
        }
      );
    } catch (err) {
      console.error("Error getting user media:", err);
      setIsCameraOn(false);
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
    setIsMuted(!isMuted);
    if (webcamVideoRef.current?.srcObject) {
      const stream = webcamVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
    }
  };

  const toggleCamera = async () => {
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);

    if (!newCameraState) {
      if (webcamVideoRef.current?.srcObject) {
        (webcamVideoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        webcamVideoRef.current.srcObject = null;
      }
      videoProducer?.close();
      setVideoProducer(null);
    } else {
      await startWebcamStream();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleAddScene = () => {
    const newScene = {
      id: (scenes.length + 1).toString(),
      name: `Scene ${scenes.length + 1}`,
      isActive: false,
      type: "media" as const,
      mediaUrl: "",
    };
    setScenes([...scenes, newScene]);
  };

  const selectScene = (id: string) => {
    setScenes(
      scenes.map((scene) => ({
        ...scene,
        isActive: scene.id === id,
      }))
    );
  };

  const toggleScreenShare = async () => {
    if (!device || !socket.current) return;

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          screenStream.oninactive = () => {
            setIsScreenSharing(false);
            screenProducer?.close();
            setScreenProducer(null);
          };
        }

        const transport =
          producerTransport ||
          device.createSendTransport(
            await new Promise((resolve) => {
              socket.current?.emit("createProducerTransport", {}, resolve);
            })
          );

        transport.on("connect", async ({ dtlsParameters }, callback) => {
          socket.current?.emit(
            "connectProducerTransport",
            { dtlsParameters },
            callback
          );
        });

        transport.on("produce", async ({ kind, rtpParameters }, callback) => {
          socket.current?.emit(
            "produce",
            {
              transportId: transport.id,
              kind,
              rtpParameters,
              roomId,
            },
            (id: string) => callback({ id })
          );
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const producer = await transport.produce({ track: screenTrack });
        setScreenProducer(producer);
        setIsScreenSharing(true);
        if (!producerTransport) setProducerTransport(transport);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      if (screenVideoRef.current?.srcObject) {
        (screenVideoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        screenVideoRef.current.srcObject = null;
      }
      screenProducer?.close();
      setScreenProducer(null);
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

  return (
    <div className="flex flex-col h-screen bg-[#0a152c]" ref={studioRef}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a152c] border-b border-[#1a2641]">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-white">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {streamTitle} - {streamStatus}, {streamDate}
            {isHost && <Badge className="ml-2 bg-green-500">Host</Badge>}
          </Button>
        </div>
        <div className="flex items-center gap-2">
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
            variant="outline"
            size="sm"
            className="text-white border-[#1a2641]"
          >
            <Plus className="h-4 w-4 mr-1" /> Channels
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-[#1a2641]"
          >
            <Calendar className="h-4 w-4 mr-1" /> Schedule
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#ff4d00] hover:bg-[#ff6b2c] text-white border-none"
          >
            Go Live
          </Button>
        </div>
      </div>

      <div className="flex flex-grow">
        <div className="w-42 bg-[#0a152c] border-r border-[#1a2641] p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start mb-3 text-white border-[#1a2641] hover:bg-[#1a2641]"
            onClick={handleAddScene}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Media Scene
          </Button>

          <div className="space-y-2">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`p-2 rounded cursor-pointer ${
                  scene.isActive
                    ? "bg-[#1a2641] border-l-2 border-[#ff4d00]"
                    : "hover:bg-[#1a2641]"
                }`}
                onClick={() => selectScene(scene.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-full h-12 bg-gradient-to-br from-[#e91e63] to-[#2196f3] rounded mb-1 flex justify-center items-center">
                    {scene.type === "webcam" && (
                      <User className="h-5 w-5 text-white" />
                    )}
                    {scene.type === "screen" && (
                      <Monitor className="h-5 w-5 text-white" />
                    )}
                    {scene.type === "media" && (
                      <ImageIcon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-white">{scene.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow flex flex-col bg-[#0a152c] ml-5">
          <div className="p-2 flex items-center">
            <span className="text-white text-sm mr-2">{resolution}</span>
          </div>

          <div className="flex-grow flex justify-center relative bg-gradient-to-br from-[#e91e63] to-[#2196f3]">
            <div
              className={`relative w-full max-w-4xl h-full flex items-center justify-center ${
                isSingleParticipant ? "" : layouts[selectedLayout - 1].className
              } transition-all duration-300 ease-in-out`}
            >
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className={`rounded-md overflow-hidden relative bg-black ${getParticipantPosition(
                    participant,
                    participants.length
                  )}`}
                >
                  {participant === user?.user?.username && (
                    <>
                      {/* Main display area */}
                      <div className="w-full h-full relative">
                        {scenes.find((s) => s.isActive)?.type === "screen" &&
                        isScreenSharing ? (
                          <video
                            ref={screenVideoRef}
                            autoPlay
                            playsInline
                            muted={isMuted}
                            className="w-full h-full object-cover"
                          />
                        ) : scenes.find((s) => s.isActive)?.type === "webcam" &&
                          isCameraOn ? (
                          <video
                            ref={webcamVideoRef}
                            autoPlay
                            playsInline
                            muted={isMuted}
                            className="w-full h-full object-cover"
                          />
                        ) : scenes.find((s) => s.isActive)?.type === "media" &&
                          scenes.find((s) => s.isActive)?.mediaUrl ? (
                          <img
                            src={scenes.find((s) => s.isActive)?.mediaUrl}
                            alt="Media"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-4xl font-bold text-white">
                                {userInitials}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Small webcam preview when screen sharing */}
                      {isScreenSharing &&
                        isCameraOn &&
                        scenes.find((s) => s.isActive)?.type === "screen" && (
                          <div className="absolute top-2 right-2 w-32 h-24 rounded-md overflow-hidden bg-black z-10">
                            <video
                              ref={webcamVideoRef}
                              autoPlay
                              playsInline
                              muted={isMuted}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0a152c40]">
                    <span className="text-white text-sm">{participant}</span>
                    {isHost && participant === user?.user?.username && (
                      <Badge className="ml-2 bg-green-500 text-xs">Host</Badge>
                    )}
                  </div>
                </div>
              ))}

              <div className="absolute top-2 right-2 flex flex-col gap-1">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                {showVolumeSlider && (
                  <div className="bg-black/60 p-2 rounded-md w-32">
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
                  </div>
                )}
              </div>

              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
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
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>
                        {isMuted ? "Unmute" : "Mute"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>
                        {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                        >
                          <Users className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Guests</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                        >
                          <Settings className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4">
              <div className="flex items-center">
                <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-bold">S</span>
                </div>
                <span className="text-xl font-bold text-white">StremRx</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2 bg-[#0a152c] border-t border-[#1a2641] flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-[#1a2641] hover:bg-[#1a2641]"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Private Chat
            </Button>

            <div className="flex">
              <Button variant="ghost" size="sm" className="text-white">
                <Monitor className="h-4 w-4 mr-1" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white">
                <User className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="w-16 bg-[#0a152c] border-l border-[#1a2641] flex flex-col items-center py-4"></div>
      </div>
    </div>
  );
};
