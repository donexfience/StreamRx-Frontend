import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Mic,
  Monitor,
  Volume2,
  VolumeX,
  MoreVertical,
  Maximize2,
  Minimize2,
  X,
  Users,
  Settings,
  MessageCircle,
  Grid2X2,
  AlignJustify,
  Layers,
  LayoutGrid,
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ParticipantVideo } from "./studio/ParticipantVideo";
import { PrivateChat } from "./studio/PrivateChat";
import { useState } from "react";

interface Caption {
  id: string;
  text: string;
  timestamp: Date;
}

interface Participant {
  userId: string;
  name: string;
}

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: "webcam" | "screen" | "media";
  mediaUrl?: string;
  channelId?: string;
}

interface MainContentProps {
  streamerLeft: boolean;
  currentStream: any;
  role: "host" | "guest";
  participants: Participant[];
  participantStreams: {
    [userId: string]: {
      webcam?: MediaStream;
      screen?: MediaStream;
      audio?: MediaStream;
    };
  };
  localUserId: string | null;
  user: any;
  userInitials: string;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
  toggleFullScreen: () => void;
  volume: number;
  showVolumeSlider: boolean;
  toggleVolumeSlider: () => void;
  handleVolumeChange: (value: number[]) => void;
  selectedLayout: number;
  setSelectedLayout: (value: number) => void;
  isSingleParticipant: boolean;
  isMirrored: boolean;
  setIsMirrored: (value: boolean) => void;
  quality: string;
  changeQuality: (newQuality: string) => void;
  qualityOptions: {
    label: string;
    constraints: { width: number; height: number };
  }[];
  captions: Caption[];
  webcamVideoRef: React.MutableRefObject<HTMLVideoElement | null>;
  screenVideoRef: React.RefObject<HTMLVideoElement>;
  fallbackVideoRef: React.RefObject<HTMLVideoElement>;
  participantVideoRefs: React.MutableRefObject<{
    [userId: string]: HTMLVideoElement | null;
  }>;
  handleRemoveGuest: (guestId: string) => void;
  handleGuestExit: () => void;
  generateInviteLink: () => void;
  isMobileView: boolean;
  setIsMobileView: (value: boolean) => void;
  showPrivateChat: boolean;
  setShowPrivateChat: (value: boolean) => void;
  privateMessages: any[];
  newPrivateMessage: string;
  setNewPrivateMessage: (value: string) => void;
  sendPrivateMessage: (e: any, targetUserId: any) => void;
  inviteLink: string | null;
  setInviteLink: (value: string | null) => void;
  activeScene?: Scene;
}

export const MainContent: React.FC<MainContentProps> = ({
  streamerLeft,
  currentStream,
  role,
  participants,
  participantStreams,
  localUserId,
  user,
  userInitials,
  isCameraOn,
  isScreenSharing,
  isMuted,
  toggleMute,
  toggleCamera,
  toggleScreenShare,
  toggleFullScreen,
  volume,
  showVolumeSlider,
  toggleVolumeSlider,
  handleVolumeChange,
  selectedLayout,
  setSelectedLayout,
  isSingleParticipant,
  isMirrored,
  setIsMirrored,
  quality,
  changeQuality,
  qualityOptions,
  captions,
  webcamVideoRef,
  screenVideoRef,
  fallbackVideoRef,
  participantVideoRefs,
  handleRemoveGuest,
  handleGuestExit,
  generateInviteLink,
  isMobileView,
  setIsMobileView,
  showPrivateChat,
  setShowPrivateChat,
  privateMessages,
  newPrivateMessage,
  setNewPrivateMessage,
  sendPrivateMessage,
  inviteLink,
  setInviteLink,
  activeScene,
}) => {
  const [isStreamReady, setIsStreamReady] = useState(false);
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

  const renderLocalStream = () => {
    const streamData = participantStreams[localUserId!];
    const hasActiveStream =
      streamData && (streamData.webcam || streamData.screen);

    if (!hasActiveStream) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {userInitials}
            </span>
          </div>
        </div>
      );
    }

    if (streamData?.webcam) {
      return (
        <div className="relative w-full h-full">
          {!isStreamReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <span className="text-white">Loading...</span>
            </div>
          )}
          <video
            ref={(el) => {
              if (webcamVideoRef.current !== el) {
                webcamVideoRef.current = el;
              }
              if (el && streamData.webcam) {
                el.srcObject = streamData.webcam;
                el.onloadedmetadata = () => {
                  setIsStreamReady(true);
                  el.play().catch((err) =>
                    console.error("Error playing video:", err)
                  );
                };
              }
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (streamData?.screen) {
      return (
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      );
    }

    return null;
  };

  return (
    <div
      className={`flex-grow flex flex-col bg-[#0a152c] ${
        isMobileView ? "ml-0 h-full" : "ml-5 h-full"
      }`}
    >
      <div className="p-2 flex items-center">
        <span className="text-white text-sm mr-2">Resolution: {quality}</span>
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
            <motion.div
              className={`relative w-full max-w-5xl h-screen flex items-center justify-center ${
                isSingleParticipant ? "" : layouts[selectedLayout - 1].className
              } transition-all duration-300 ease-in-out ${
                isMobileView ? "max-w-full h-full" : ""
              }`}
              layout
            >
              {participants.map((participant) => (
                <motion.div
                  key={participant.userId}
                  className={`rounded-md overflow-hidden relative w-full h-full z-10 ${getParticipantPosition(
                    participant.userId,
                    participants.length
                  )}`}
                  layout
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundImage:
                      activeScene?.type === "media" && activeScene.mediaUrl
                        ? `url(${activeScene.mediaUrl})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor:
                      activeScene?.type !== "media" ? "black" : "transparent",
                  }}
                >
                  {participant.userId === localUserId
                    ? renderLocalStream()
                    : (() => {
                        const userStreams =
                          participantStreams[participant.userId] || {};
                        const isMediaStream = (
                          stream: any
                        ): stream is MediaStream =>
                          stream && typeof stream.getTracks === "function";
                        const mainStream: MediaStream | undefined =
                          isMediaStream(userStreams.screen) &&
                          userStreams.screen.getTracks().length > 0
                            ? userStreams.screen
                            : isMediaStream(userStreams.webcam)
                            ? userStreams.webcam
                            : userStreams.audio;
                        const hasWebcam: boolean =
                          isMediaStream(userStreams.webcam) &&
                          userStreams.webcam.getTracks().length > 0;

                        return (
                          <div className="relative w-full h-full">
                            {mainStream ? (
                              mainStream === userStreams.audio ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                  <audio
                                    autoPlay
                                    ref={(element) => {
                                      if (element)
                                        element.srcObject = mainStream;
                                    }}
                                  />
                                  <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-white">
                                      {getInitials(participant.name)}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <ParticipantVideo
                                  userId={participant.userId}
                                  stream={mainStream}
                                  ref={(el) => {
                                    participantVideoRefs.current[
                                      participant.userId
                                    ] = el;
                                  }}
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
                                  <span className="text-4xl font-bold text-white">
                                    {getInitials(participant.name)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {hasWebcam && mainStream === userStreams.screen && (
                              <div className="absolute top-2 right-2 w-32 h-24 rounded-md overflow-hidden bg-black z-20">
                                <video
                                  autoPlay
                                  playsInline
                                  muted
                                  className="w-full h-full object-cover"
                                  ref={(el) => {
                                    if (el && userStreams.webcam)
                                      el.srcObject = userStreams.webcam;
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0a152c40] z-10 flex justify-between items-center">
                    <span className="text-white text-sm">
                      {participant.name}
                    </span>
                    {role === "host" && participant.userId !== user?._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleRemoveGuest(participant.userId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {role === "host" && participant.userId === user?._id && (
                      <Badge className="ml-2 bg-green-500 text-xs">Host</Badge>
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
                    onClick={toggleFullScreen}
                  >
                    {document.fullscreenElement ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  {!isSingleParticipant && (
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
                      <DropdownMenuContent className="bg-[#1a2641] text-white border-[#2a3551]">
                        {layouts.map((layout) => (
                          <DropdownMenuItem
                            key={layout.id}
                            onClick={() => setSelectedLayout(layout.id)}
                            className={`flex items-center gap-2 ${
                              selectedLayout === layout.id
                                ? "bg-[#ff4d00]"
                                : "hover:bg-[#2a3551]"
                            }`}
                          >
                            {layout.icon} Layout {layout.id}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="absolute bottom-4 w-full flex justify-center z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 bg-black/40 p-2 rounded-full">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-1 ${
                          isCameraOn ? "text-white" : "text-gray-400"
                        }`}
                        onClick={toggleCamera}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                      {isCameraOn ? "Turn off camera" : "Turn on camera"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-1 ${
                          isMuted ? "text-gray-400" : "text-white"
                        }`}
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <Mic className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                      {isMuted ? "Unmute" : "Mute"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-1 ${
                          isScreenSharing ? "text-white" : "text-gray-400"
                        }`}
                        onClick={toggleScreenShare}
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                      {isScreenSharing ? "Stop sharing" : "Share screen"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-white"
                        onClick={toggleVolumeSlider}
                      >
                        {volume === 0 ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                      Adjust volume
                    </TooltipContent>
                  </Tooltip>
                  {role === "host" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-1 text-white"
                          onClick={generateInviteLink}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                        Invite participants
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className=" text-white bg-black/40 rounded-full h-8 w-8 p-1 z-10"
                    onClick={() => setShowPrivateChat(!showPrivateChat)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-1 text-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a2641] text-white border-[#2a3551]">
                      {qualityOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.label}
                          onClick={() => changeQuality(option.label)}
                          className={`${
                            quality === option.label
                              ? "bg-[#ff4d00]"
                              : "hover:bg-[#2a3551]"
                          }`}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() => setIsMirrored(!isMirrored)}
                        className="hover:bg-[#2a3551]"
                      >
                        {isMirrored ? "Unmirror video" : "Mirror video"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {role === "guest" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-1 text-red-500"
                          onClick={handleGuestExit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1a2641] text-white border-[#2a3551]">
                        Leave stream
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="ml-2 bg-[#1a2641] p-2 rounded-md"
                    >
                      <Slider
                        value={[volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </div>
      {inviteLink && role === "host" && (
        <motion.div
          className="absolute bottom-16 left-4 bg-[#1a2641] text-white p-2 rounded-md z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <span className="font-medium">Invite Link:</span> {inviteLink}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-white"
            onClick={() => setInviteLink(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
      <PrivateChat
        showPrivateChat={showPrivateChat}
        setShowPrivateChat={setShowPrivateChat}
        privateMessages={privateMessages}
        newPrivateMessage={newPrivateMessage}
        setNewPrivateMessage={setNewPrivateMessage}
        sendPrivateMessage={sendPrivateMessage}
        participants={participants}
        localUserId={localUserId}
        role={role}
    
      />
    </div>
  );
};
