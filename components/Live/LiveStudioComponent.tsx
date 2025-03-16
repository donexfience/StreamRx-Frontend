"use client";
import { useEffect, useState, useRef } from "react";
import * as mediasoupClient from "mediasoup-client";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { uploadToS3 } from "@/app/lib/action/s3";
import { useEditStreamMutation } from "@/redux/services/streaming/streamingApi";
import { Header } from "./studio/Header";
import { SidebarLeft } from "./studio/SideBarLeft";
import { MainContent } from "./MainContent";
import { SidebarRight } from "./studio/SideBarRight";
import { MediaModal } from "./studio/MediaModal";
import { NameModal } from "./studio/NameModal";
import { ApprovalModal } from "./studio/ApproveModal";
import { RemoveGuestModal } from "./studio/removeGuestModal";

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
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [fullScreen, setFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreamReady, setIsStreamReady] = useState(false);
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
            mediaUrl:
              "https://via.placeholder.com/1920x1080.png?text=Pink+Gradient+1",
            channelId: channelData?._id,
          },
          {
            id: "4",
            name: "Pink Gradient 2",
            isActive: false,
            type: "media",
            mediaUrl:
              "https://via.placeholder.com/1920x1080.png?text=Pink+Gradient+2",
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
  const [participants, setParticipants] = useState<Participant[]>([
    { userId: user?._id, name: user?.username || "Host" },
  ]);
  const [participantStreams, setParticipantStreams] = useState<{
    [userId: string]: {
      webcam?: MediaStream;
      screen?: MediaStream;
      audio?: MediaStream;
    };
  }>({});
  const [pendingProducers, setPendingProducers] = useState<
    { producerId: string; userId: string; type: string }[]
  >([]);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");
  const [guestToApprove, setGuestToApprove] = useState<any>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const router = useRouter();
  const [editStream] = useEditStreamMutation();

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const producerTransportRef = useRef<any>(null);
  const consumerTransportRef = useRef<any>(null);
  const videoProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const audioProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const screenProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const screenAudioProducerRef = useRef<mediasoupClient.types.Producer | null>(
    null
  );
  const socket = useRef<any>(null);
  const studioRef = useRef<HTMLDivElement>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);
  const stopRecordingRef = useRef<(() => void) | null>(null);
  const participantVideoRefs = useRef<{
    [userId: string]: HTMLVideoElement | null;
  }>({});

  const currentStream = streams[0];
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
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const guestId = urlParams.get("guestId");
    socket.current = io("http://localhost:3011", {
      auth: { userId: user?._id, token: token, role: role },
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socket.current.on(
      "newProducer",
      async ({
        producerId,
        userId,
        type,
      }: {
        producerId: any;
        userId: any;
        type: any;
      }) => {
        if (userId === user?._id) return;
        if (deviceInitialized) {
          await consumeProducer(
            producerId,
            userId,
            deviceRef.current!,
            consumerTransportRef.current!,
            type
          );
        } else {
          setPendingProducers((prev) => [
            ...prev,
            { producerId, userId, type },
          ]);
        }
      }
    );

    socket.current.on(
      "existingProducers",
      ({ producers }: { producers: any }) => {
        producers.forEach(
          ({
            producerId,
            userId,
            type,
          }: {
            producerId: any;
            userId: any;
            type: any;
          }) => {
            if (userId !== user?._id) {
              if (deviceInitialized) {
                consumeProducer(
                  producerId,
                  userId,
                  deviceRef.current!,
                  consumerTransportRef.current!,
                  type
                );
              } else {
                setPendingProducers((prev) => [
                  ...prev,
                  { producerId, userId, type },
                ]);
              }
            }
          }
        );
      }
    );

    socket.current.on("connect", () => {
      if (role === "guest") {
        if (!guestName) setIsNameModalOpen(true);
        else {
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
          async (response: any) => {
            if (response.success) {
              setLocalUserId(user?._id);
              await initMediaSoup();
            }
          }
        );
      }
    });

    socket.current.on("joinApproved", () => {
      setPendingApproval(false);
      socket.current.emit(
        "joinRoom",
        { roomId, userId: user?._id || guestId, guestId, guestName },
        (response: any) => {
          if (response.success) {
            setLocalUserId(user?._id || guestId);
            initMediaSoup().then(() => setDeviceInitialized(true));
          }
        }
      );
    });

    socket.current.on("joinDenied", ({ message }: { message: any }) => {
      setPendingApproval(false);
      toast.error(message || "Join request denied");
      router.push("/dashboard/streamer/main");
    });

    socket.current.on(
      "guestAdded",
      ({ guestId, guestName }: { guestId: any; guestName: any }) => {
        toast.success(
          `${guestName} has joined the stream with guest ID ${guestId}`
        );
      }
    );

    socket.current.on(
      "joinRequest",
      ({ guestId, guestSocketId }: { guestId: any; guestSocketId: any }) => {
        setGuestToApprove({ guestId, guestSocketId });
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
          if (!updatedParticipants.some((p: any) => p.userId === userId))
            delete newStreams[userId];
        });
        return newStreams;
      });
    });

    socket.current.on("streamStarted", () => setIsLive(true));
    socket.current.on("streamStopped", () => setIsLive(false));
    socket.current.on("streamerLeft", ({ hostId }: { hostId: any }) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== hostId));
      setIsLive(false);
      setStreamerLeft(true);
    });

    socket.current.on("chatMessage", (message: any) => {
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
    });

    socket.current.on(
      "producerClosed",
      ({
        producerIds,
        userId,
        types,
      }: {
        producerIds: any;
        userId: any;
        types: any;
      }) => {
        setParticipantStreams((prev) => {
          const newStreams = { ...prev };
          if (newStreams[userId]) {
            types.forEach((type: string) => {
              if (type.startsWith("webcam")) delete newStreams[userId].webcam;
              else if (type.startsWith("screen"))
                delete newStreams[userId].screen;
              else if (type.startsWith("audio"))
                delete newStreams[userId].audio;
            });
            if (Object.keys(newStreams[userId]).length === 0) {
              delete newStreams[userId];
            }
          }
          return newStreams;
        });
      }
    );

    socket.current.on(
      "privateMessage",
      ({ message, from, sender }: { message: any; from: any; sender: any }) => {
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
      }
    );

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

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isLive) cleanupStream();
      socket.current.disconnect();
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
      pendingProducers.forEach(({ producerId, userId, type }) => {
        consumeProducer(
          producerId,
          userId,
          deviceRef.current!,
          consumerTransportRef.current!,
          type
        );
      });
      setPendingProducers([]);
    }
  }, [deviceInitialized, pendingProducers]);

  useEffect(() => {
    Object.values(participantVideoRefs.current).forEach((video) => {
      if (video) video.volume = volume / 100;
    });
  }, [volume, participantStreams]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (participantStreams[localUserId!] && webcamVideoRef.current) {
      const localStream: any = participantStreams[localUserId!]?.webcam;
      if (localStream) webcamVideoRef.current.srcObject = localStream;
      if (webcamVideoRef.current.paused) {
        webcamVideoRef.current
          .play()
        
      }
    }
  }, [participantStreams, localUserId]);



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

  useEffect(() => {
    Object.entries(participantStreams).forEach(([userId, streams]: any) => {
      const participantExists = participants.some((p) => p.userId === userId);
      if (!participantExists) return;
      const videoElement = participantVideoRefs.current[userId];
      if (videoElement && streams) {
        const mainStream = new MediaStream();
        const videoStream = streams.screen || streams.webcam;
        if (videoStream && videoStream.getTracks().length > 0) {
          videoStream.getTracks().forEach((track: any) => {
            if (track.kind === "video") mainStream.addTrack(track);
          });
        }
        const audioStream = streams.screen || streams.audio;
        if (audioStream && audioStream.getTracks().length > 0) {
          audioStream.getTracks().forEach((track: any) => {
            if (track.kind === "audio") mainStream.addTrack(track);
          });
        }
        if (mainStream.getTracks().length > 0) {
          videoElement.srcObject = mainStream;
          videoElement
            .play()
            .catch((err) =>
              console.error(`Error playing video for ${userId}:`, err)
            );
        }
      }
    });
  }, [participantStreams, participants]);

  const consumeProducer = async (
    producerId: string,
    userId: string,
    device: mediasoupClient.Device,
    consumerTransport: mediasoupClient.types.Transport,
    type: string
  ) => {
    if (!device || !consumerTransport || !socket.current) return;
    
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
          console.error("Invalid consumer parameters received");
          return;
        }
        
        try {
          // Create the consumer
          const consumer = await consumerTransport.consume(params);
          const trackRef = consumer.track;
          
          // Determine stream type based on the type parameter
          const streamType = type.includes("webcam") 
            ? "webcam"
            : type.includes("screen_video") || type.includes("screen") 
              ? "screen"
              : type.includes("audio") || consumer.kind === "audio"
                ? "audio"
                : "webcam";
                
          console.log(`Consuming ${streamType} stream from ${userId}, track kind: ${trackRef.kind}`);
          
          // Update participant streams state
          setParticipantStreams((prev) => {
            const newStreams = { ...prev };
            const userStreams = newStreams[userId] || {};
            
            // Create new stream or get existing one
            let stream :any= userStreams[streamType];
            if (!stream || !(stream instanceof MediaStream)) {
              stream = new MediaStream();
            } else {
              // Remove tracks of the same kind to avoid duplicates
              const existingTracks = stream.getTracks().filter(t => t.kind !== trackRef.kind);
              stream = new MediaStream();
              existingTracks.forEach(track => stream.addTrack(track));
            }
            
            // Add the new track
            stream.addTrack(trackRef);
            
            // Update state
            return {
              ...prev,
              [userId]: {
                ...userStreams,
                [streamType]: stream
              }
            };
          });
          
          // Resume the consumer to start receiving media
          await consumer.resume();
          
          // Handle consumer closed event
          consumer.on('trackended', () => {
            console.log(`Track ended for consumer ${consumer.id}`);
          });
          
          consumer.on('@close', () => {
            console.log(`Consumer ${consumer.id} closed`);
            setParticipantStreams(prev => {
              const userStreams = {...prev[userId]};
              if (userStreams[streamType]) {
                const stream = userStreams[streamType];
                const tracksToRemove = stream.getTracks().filter(t => t.kind === trackRef.kind);
                tracksToRemove.forEach(t => stream.removeTrack(t));
                
                if (stream.getTracks().length === 0) {
                  delete userStreams[streamType];
                }
              }
              
              if (Object.keys(userStreams).length === 0) {
                const newState = {...prev};
                delete newState[userId];
                return newState;
              }
              
              return {
                ...prev,
                [userId]: userStreams
              };
            });
          });
          
        } catch (err) {
          console.error(`Error consuming producer ${producerId}:`, err);
        }
      }
    );
  };
  const initMediaSoup = async () => {
    const mediasoupDevice = new mediasoupClient.Device();
    deviceRef.current = mediasoupDevice;

    return new Promise((resolve, reject) => {
      socket.current?.emit(
        "getRouterRtpCapabilities",
        {},
        async (
          routerRtpCapabilities: mediasoupClient.types.RtpCapabilities
        ) => {
          if (!routerRtpCapabilities) {
            reject("Failed to get router RTP capabilities");
            return;
          }
          await mediasoupDevice.load({ routerRtpCapabilities });
          const producerTransport = await createProducerTransport(
            mediasoupDevice
          );
          producerTransportRef.current = producerTransport;
          const consumerTransport = await createConsumerTransport(
            mediasoupDevice
          );
          consumerTransportRef.current = consumerTransport;
          setDeviceInitialized(true);
          resolve({
            device: mediasoupDevice,
            producerTransport,
            consumerTransport,
            deviceInitialized: true,
          });
        }
      );
    });
  };

  const startWebcamStream = async () => {
    if (
      !deviceRef.current ||
      !deviceInitialized ||
      !producerTransportRef.current
    )
      return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      const videoTrack = stream.getVideoTracks()[0];

      if (videoProducerRef.current) {
        await videoProducerRef.current.replaceTrack({ track: videoTrack });
        await videoProducerRef.current.resume();
      } else {
        const newVideoProducer = await producerTransportRef.current.produce({
          track: videoTrack,
          appData: { userId: user?._id, type: "webcam_video" },
        });
        videoProducerRef.current = newVideoProducer;
        socket.current.emit("newProducer", {
          producerId: newVideoProducer.id,
          userId: user?._id,
        });
      }

      setParticipantStreams((prev) => ({
        ...prev,
        [user?._id]: { ...prev[user?._id], webcam: stream },
      }));

      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.muted = true;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error starting webcam stream:", err);
      setIsCameraOn(false);
    }
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (!newMutedState) {
      if (!audioProducerRef.current) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioTrack = audioStream.getAudioTracks()[0];
          const newAudioProducer = await producerTransportRef.current!.produce({
            track: audioTrack,
            appData: { userId: user?._id, type: "audio" },
          });
          audioProducerRef.current = newAudioProducer;
          socket.current.emit("newProducer", {
            producerId: newAudioProducer.id,
            userId: user?._id,
          });
          setParticipantStreams((prev) => ({
            ...prev,
            [user?._id]: { ...prev[user?._id], audio: audioStream },
          }));
        } catch (error) {
          console.error("Error starting audio:", error);
        }
      } else {
        await audioProducerRef.current.resume();
        const track = audioProducerRef.current.track;
        if (track) track.enabled = true;
      }
    } else {
      if (audioProducerRef.current) {
        await audioProducerRef.current.pause();
        const track = audioProducerRef.current.track;
        if (track) track.enabled = false;
      }
    }

    if (audioRef.current && musicUrl) {
      audioRef.current.volume = newMutedState ? 0 : volume / 100;
    }
  };

  const toggleCamera = async () => {
    if (!deviceRef.current || !deviceInitialized || !producerTransportRef.current) return;
  
    const newCameraState = !isCameraOn;
    setIsCameraOn(newCameraState);
  
    if (!newCameraState) { 
      try {
        if (videoProducerRef.current) {
          await videoProducerRef.current.pause();
        }
        const stream = webcamVideoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = null;
          webcamVideoRef.current.pause(); 
        }
        setParticipantStreams((prev) => {
          const userStreams = prev[user?._id];
          if (userStreams) {
            const { webcam, ...rest } = userStreams;
            return { ...prev, [user?._id]: rest };
          }
          return prev;
        });
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
    } else { // Turning on the camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        const videoTrack = stream.getVideoTracks()[0];
  
        if (videoProducerRef.current) {
          await videoProducerRef.current.replaceTrack({ track: videoTrack });
          await videoProducerRef.current.resume();
        } else {
          const newVideoProducer = await producerTransportRef.current.produce({
            track: videoTrack,
            appData: { userId: user?._id, type: "webcam_video" },
          });
          videoProducerRef.current = newVideoProducer;
          socket.current.emit("newProducer", {
            producerId: newVideoProducer.id,
            userId: user?._id,
          });
        }
  
        setParticipantStreams((prev) => ({
          ...prev,
          [user?._id]: { ...prev[user?._id], webcam: stream },
        }));
  
        if (webcamVideoRef.current) {
          webcamVideoRef.current.srcObject = stream;
          webcamVideoRef.current.muted = true;
        }
      } catch (error) {
        console.error("Error starting camera:", error);
        setIsCameraOn(false);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (
      !deviceRef.current ||
      !deviceInitialized ||
      !producerTransportRef.current
    )
      return;
    const newScreenShareState = !isScreenSharing;
    setIsScreenSharing(newScreenShareState);

    if (newScreenShareState) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        const screenVideoTrack = screenStream.getVideoTracks()[0];
        const screenAudioTrack = screenStream.getAudioTracks()[0];

        if (screenProducerRef.current) {
          await screenProducerRef.current.replaceTrack({
            track: screenVideoTrack,
          });
          await screenProducerRef.current.resume();
        } else {
          const newScreenProducer = await producerTransportRef.current.produce({
            track: screenVideoTrack,
            appData: { userId: user?._id, type: "screen_video" },
          });
          screenProducerRef.current = newScreenProducer;
          socket.current.emit("newProducer", {
            producerId: newScreenProducer.id,
            userId: user?._id,
          });
        }

        if (screenAudioTrack) {
          if (screenAudioProducerRef.current) {
            await screenAudioProducerRef.current.replaceTrack({
              track: screenAudioTrack,
            });
            await screenAudioProducerRef.current.resume();
          } else {
            const newScreenAudioProducer =
              await producerTransportRef.current.produce({
                track: screenAudioTrack,
                appData: { userId: user?._id, type: "screen_audio" },
              });
            screenAudioProducerRef.current = newScreenAudioProducer;
            socket.current.emit("newProducer", {
              producerId: newScreenAudioProducer.id,
              userId: user?._id,
            });
          }
        }

        setParticipantStreams((prev) => ({
          ...prev,
          [user?._id]: { ...prev[user?._id], screen: screenStream },
        }));

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = screenStream;
          screenVideoRef.current
            .play()
            .catch((err) => console.error("Error playing screen:", err));
        }

        screenVideoTrack.onended = async () => {
          setIsScreenSharing(false);
          if (screenProducerRef.current)
            await screenProducerRef.current.pause();
          if (screenAudioProducerRef.current)
            await screenAudioProducerRef.current.pause();
          if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
          setParticipantStreams((prev) => {
            const userStreams = prev[user?._id];
            if (userStreams) {
              const { screen, ...rest } = userStreams;
              return { ...prev, [user?._id]: rest };
            }
            return prev;
          });
        };
      } catch (err) {
        console.error("Error starting screen share:", err);
        setIsScreenSharing(false);
      }
    } else {
      try {
        if (screenProducerRef.current) await screenProducerRef.current.pause();
        if (screenAudioProducerRef.current)
          await screenAudioProducerRef.current.pause();
        if (screenVideoRef.current?.srcObject) {
          const stream = screenVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          screenVideoRef.current.srcObject = null;
        }
        setParticipantStreams((prev) => {
          const userStreams = prev[user?._id];
          if (userStreams) {
            const { screen, ...rest } = userStreams;
            return { ...prev, [user?._id]: rest };
          }
          return prev;
        });
      } catch (err) {
        console.error("Error stopping screen share:", err);
      }
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isLive && role === "host") {
      socket.current?.emit("streamerLeft", { roomId });
      e.preventDefault();
      e.returnValue = "You are streaming. Are you sure you want to leave?";
    }
  };

  const createProducerTransport = async (device: mediasoupClient.Device) => {
    return new Promise((resolve) => {
      socket.current.emit(
        "createProducerTransport",
        {},
        async (params: any) => {
          const transport = device.createSendTransport(params);
          transport.on("connect", async ({ dtlsParameters }, callback) => {
            socket.current?.emit(
              "connectProducerTransport",
              { transportId: transport.id, dtlsParameters, roomId },
              callback
            );
          });
          transport.on(
            "produce",
            async ({ kind, rtpParameters, appData }, callback) => {
              socket.current?.emit(
                "produce",
                {
                  transportId: transport.id,
                  kind,
                  rtpParameters,
                  appData,
                  roomId,
                },
                (id: string) => callback({ id })
              );
            }
          );
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
      if (!isCameraOn && !isScreenSharing) return;
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
    if (isCameraOn && deviceRef.current) {
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
    if (!videoProducerRef.current || !producerTransportRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints || true,
        audio: false,
      });
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.style.transform = isMirrored
          ? "scaleX(-1)"
          : "scaleX(1)";
        webcamVideoRef.current
          .play()
          .catch((err) => console.error("Error playing video:", err));
      }
      const videoTrack = stream.getVideoTracks()[0];
      await videoProducerRef.current.replaceTrack({ track: videoTrack });
      setParticipantStreams((prev) => ({
        ...prev,
        [user?._id]: { ...prev[user?._id], webcam: stream },
      }));
    } catch (err) {
      console.error("Error restarting webcam stream:", err);
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
    if (role !== "host") return;
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
      if (deviceRef.current && isCameraOn) startWebcamStream();
    }
  };

  const cleanupStream = () => {
    const stopTracks = (stream: MediaStream | null) =>
      stream?.getTracks().forEach((track) => track.stop());
    stopTracks(webcamVideoRef.current?.srcObject as MediaStream);
    stopTracks(screenVideoRef.current?.srcObject as MediaStream);

    if (videoProducerRef.current) videoProducerRef.current.close();
    if (audioProducerRef.current) audioProducerRef.current.close();
    if (screenProducerRef.current) screenProducerRef.current.close();
    if (screenAudioProducerRef.current) screenAudioProducerRef.current.close();
    if (producerTransportRef.current) producerTransportRef.current.close();
    if (consumerTransportRef.current) consumerTransportRef.current.close();

    videoProducerRef.current = null;
    audioProducerRef.current = null;
    screenProducerRef.current = null;
    screenAudioProducerRef.current = null;
    producerTransportRef.current = null;
    consumerTransportRef.current = null;
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
        audioRef.current.volume = volume / 100;
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

  const generateInviteLink = () => {
    if (role !== "host") return;
    socket.current.emit(
      "generateInvite",
      { roomId, userId: user?._id },
      (response: any) => {
        if (response.inviteLink) {
          setInviteLink(response.inviteLink);
          navigator.clipboard.writeText(response.inviteLink);
        }
      }
    );
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

  const handleGuestExit = () => {
    if (role !== "guest") return;
    socket.current.emit("leaveRoom", { roomId, userId: user?._id });
    cleanupStream();
    socket.current.disconnect();
    router.push("/dashboard/streamer/main");
  };

  const activeScene = scenes.find((scene) => scene.isActive);

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
      <Header
        streamTitle={streamTitle}
        streamStatus={streamStatus}
        streamDate={streamDate}
        role={role}
        isRecording={isRecording}
        toggleRecording={toggleRecording}
        saveLocally={saveLocally}
        setSaveLocally={setSaveLocally}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        isLive={isLive}
        toggleLive={toggleLive}
        canGoLive={canGoLive}
        router={router}
      />
      <div
        className={`flex flex-grow w-full h-full ${
          isMobileView ? "flex-col" : "flex-row"
        }`}
      >
        <SidebarLeft
          scenes={scenes}
          setScenes={setScenes}
          role={role}
          isMediaModalOpen={isMediaModalOpen}
          setIsMediaModalOpen={setIsMediaModalOpen}
          participants={participants}
          generateInviteLink={generateInviteLink}
          inviteLink={inviteLink}
          selectScene={selectScene}
          channelId={channelId}
        />
        <MainContent
          streamerLeft={streamerLeft}
          currentStream={currentStream}
          role={role}
          participants={participants}
          participantStreams={participantStreams}
          localUserId={localUserId}
          user={user}
          userInitials={userInitials}
          isCameraOn={isCameraOn}
          isScreenSharing={isScreenSharing}
          isMuted={isMuted}
          toggleMute={toggleMute}
          toggleCamera={toggleCamera}
          toggleScreenShare={toggleScreenShare}
          toggleFullScreen={toggleFullScreen}
          volume={volume}
          showVolumeSlider={showVolumeSlider}
          toggleVolumeSlider={toggleVolumeSlider}
          handleVolumeChange={handleVolumeChange}
          selectedLayout={selectedLayout}
          setSelectedLayout={setSelectedLayout}
          isSingleParticipant={isSingleParticipant}
          isMirrored={isMirrored}
          setIsMirrored={setIsMirrored}
          quality={quality}
          changeQuality={changeQuality}
          qualityOptions={qualityOptions}
          captions={captions}
          webcamVideoRef={webcamVideoRef}
          screenVideoRef={screenVideoRef}
          fallbackVideoRef={fallbackVideoRef}
          participantVideoRefs={participantVideoRefs}
          handleRemoveGuest={handleRemoveGuest}
          handleGuestExit={handleGuestExit}
          generateInviteLink={generateInviteLink}
          isMobileView={isMobileView}
          setIsMobileView={setIsMobileView}
          showPrivateChat={showPrivateChat}
          setShowPrivateChat={setShowPrivateChat}
          privateMessages={privateMessages}
          newPrivateMessage={newPrivateMessage}
          setNewPrivateMessage={setNewPrivateMessage}
          sendPrivateMessage={sendPrivateMessage}
          inviteLink={inviteLink}
          setInviteLink={setInviteLink}
          activeScene={activeScene}
        />
        <SidebarRight
          role={role}
          messages={messages}
          setMessages={setMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          musicUrl={musicUrl}
          setMusicUrl={setMusicUrl}
          isMusicPlaying={isMusicPlaying}
          setIsMusicPlaying={setIsMusicPlaying}
          handleMusicUpload={handleMusicUpload}
          playMusic={playMusic}
          stopMusic={stopMusic}
          captions={captions}
          setCaptions={setCaptions}
          newCaption={newCaption}
          setNewCaption={setNewCaption}
          addCaption={addCaption}
          deleteCaption={deleteCaption}
          channelId={channelId}
        />
      </div>
      <audio ref={audioRef} />
      <MediaModal
        isOpen={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        handleAddMediaScene={handleAddMediaScene}
      />
      <NameModal
        isOpen={isNameModalOpen}
        onOpenChange={setIsNameModalOpen}
        inputName={inputName}
        setInputName={setInputName}
        setGuestName={setGuestName}
        socket={socket}
        roomId={roomId}
        user={user}
        setPendingApproval={setPendingApproval}
      />
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onOpenChange={setIsApprovalModalOpen}
        guestToApprove={guestToApprove}
        setGuestToApprove={setGuestToApprove}
        socket={socket}
        roomId={roomId}
      />
      <RemoveGuestModal
        isOpen={showRemoveModal}
        onOpenChange={setShowRemoveModal}
        confirmRemoveGuest={confirmRemoveGuest}
      />
    </motion.div>
  );
};

function saveAs(blob: Blob, fileName: string) {
  throw new Error("Function not implemented.");
}
