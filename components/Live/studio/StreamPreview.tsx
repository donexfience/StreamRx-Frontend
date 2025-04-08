import React, { useState, useCallback, useRef, useEffect } from "react";
import { Maximize2, Crown, PlusIcon, Camera, Monitor } from "lucide-react";
import LayoutSelector from "./LayoutController";
import { useDrag, useDrop } from "react-dnd";

interface Producer {
  id: string;
  track: MediaStreamTrack;
  type: "webcam" | "microphone" | "screen";
}

interface Consumer {
  id: string;
  producerId: string;
  consumer: any;
  track: MediaStreamTrack;
  producerSocketId: string;
  attached?: boolean;
}

interface Participant {
  socketId: string;
  userId?: string;
  username?: string;
  role?: string;
  consumers: Consumer[];
  videoEl?: HTMLVideoElement;
  audioEl?: HTMLAudioElement;
  screenEl?: HTMLVideoElement;
}

interface StreamViewProps {
  streamSettings: any;
  participants: Participant[];
  currentLayout: string;
  setCurrentLayout: (layout: string) => void;
  localStreams: Producer[];
  isCameraOn: boolean;
  isScreenSharing: boolean;
  localUserId: string;
}

const StreamView: React.FC<StreamViewProps> = ({
  streamSettings,
  participants,
  currentLayout,
  setCurrentLayout,
  localStreams,
  isCameraOn,
  isScreenSharing,
  localUserId,
}) => {
  const {
    background = "linear-gradient(to bottom right, #b9328d, #4b6ef7)",
    overlay = null,
    logo = null,
    font = "Default",
    theme = { bg: "bg-black/50", text: "text-white" },
  } = streamSettings || {};

  const [gridParticipants, setGridParticipants] = useState<
    (Participant | null)[]
  >(Array(4).fill(null));
  const [remainingParticipants, setRemainingParticipants] = useState<
    Participant[]
  >([]);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localScreenRef = useRef<HTMLVideoElement>(null);

  // Get grid size based on layout
  const getGridSize = useCallback(() => {
    switch (currentLayout) {
      case "single":
        return 1;
      case "grid-2":
        return 2;
      case "grid-4":
        return 4;
      case "vertical":
        return 6;
      default:
        return 4;
    }
  }, [currentLayout]);

  // Check if participant is the local user
  const isLocalParticipant = useCallback(
    (participant: Participant) => {
      return participant.userId === localUserId;
    },
    [localUserId]
  );

  // Format participant name - add (You) if local
  const getFormattedUsername = useCallback(
    (participant: Participant) => {
      if (!participant.username)
        return isLocalParticipant(participant) ? "You" : "Guest";

      return isLocalParticipant(participant)
        ? `${participant.username} (You)`
        : participant.username;
    },
    [isLocalParticipant]
  );

  // Initialize grid based on layout
  useEffect(() => {
    const gridSize = getGridSize();

    // Process participants and identify local user
    const processedParticipants = participants.map((participant) => {
      // Don't modify the original array
      return participant;
    });

    // Fill grid slots with participants, prioritizing local participant
    const localParticipantIndex = processedParticipants.findIndex((p) =>
      isLocalParticipant(p)
    );

    // Reorder to put local participant first if found
    let orderedParticipants = [...processedParticipants];
    if (localParticipantIndex !== -1) {
      const localParticipant = orderedParticipants.splice(
        localParticipantIndex,
        1
      )[0];
      orderedParticipants = [localParticipant, ...orderedParticipants];
    }

    // Fill grid slots with participants
    const initialGrid = orderedParticipants.slice(0, gridSize);
    const paddedGrid = [
      ...initialGrid,
      ...Array(gridSize - initialGrid.length).fill(null),
    ];

    setGridParticipants(paddedGrid);
    setRemainingParticipants(orderedParticipants.slice(gridSize));
  }, [participants, currentLayout, getGridSize, isLocalParticipant]);

  // Set up local media streams (webcam and screen)
  useEffect(() => {
    // Handle webcam
    if (localVideoRef.current) {
      const webcam = localStreams.find((p) => p.type === "webcam");
      if (webcam && isCameraOn) {
        const stream = new MediaStream([webcam.track]);
        if (localVideoRef.current.srcObject !== stream) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current
            .play()
            .catch((err) => console.error("Failed to play local video:", err));
        }
      } else if (!isCameraOn && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject = null;
      }
    }

    // Handle screen sharing
    if (localScreenRef.current) {
      const screen = localStreams.find((p) => p.type === "screen");
      if (screen && isScreenSharing) {
        const stream = new MediaStream([screen.track]);
        if (localScreenRef.current.srcObject !== stream) {
          localScreenRef.current.srcObject = stream;
          localScreenRef.current
            .play()
            .catch((err) => console.error("Failed to play screen share:", err));
        }
      } else if (!isScreenSharing && localScreenRef.current.srcObject) {
        localScreenRef.current.srcObject = null;
      }
    }
  }, [localStreams, isCameraOn, isScreenSharing]);

  // Manage remote participant media elements - implementing the stream attachment logic based on VideoChat
  useEffect(() => {
    participants.forEach((participant) => {
      if (isLocalParticipant(participant)) return;

      // Process each consumer that needs to be attached
      participant.consumers.forEach((consumer) => {
        // Skip already attached consumers
        if (consumer.attached) return;

        attachConsumerToDOM(consumer, participant.socketId);
        consumer.attached = true;
      });
    });
  }, [participants, isLocalParticipant]);

  // Attach consumer function based on VideoChat implementation
  const attachConsumerToDOM = (
    consumer: Consumer,
    producerSocketId: string
  ) => {
    // Get participant container element
    const participantEl = document.getElementById(
      `participant-${producerSocketId}`
    );
    if (!participantEl) {
      console.log("Participant element not found:", producerSocketId);
      return;
    }

    console.log("Attaching consumer to DOM:", consumer, producerSocketId);

    if (consumer.track.kind === "video") {
      // Determine if this is a webcam or screen share based on track width
      const trackSettings = consumer.track.getSettings();
      const isScreenShare =
        trackSettings && trackSettings.width
          ? trackSettings.width > 1000
          : false;

      // Create video element
      const videoEl = document.createElement("video");
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = true;
      videoEl.srcObject = new MediaStream([consumer.track]);

      // Find the appropriate container
      const videoContainer = isScreenShare
        ? participantEl.querySelector(".screen-container")
        : participantEl.querySelector(".video-container");

      if (videoContainer) {
        videoContainer.innerHTML = "";
        videoContainer.appendChild(videoEl);

        // Play the video - wrapped in try/catch as in VideoChat
        videoEl
          .play()
          .catch((err) => console.error("Failed to play video:", err));
      }
    } else if (consumer.track.kind === "audio") {
      // Create audio element
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.srcObject = new MediaStream([consumer.track]);
      audioEl.style.display = "none";
      document.body.appendChild(audioEl);

      // Play the audio - wrapped in try/catch as in VideoChat
      audioEl
        .play()
        .catch((err) => console.error("Failed to play audio:", err));
    }
  };

  // Update remaining participants when grid changes
  const updateRemainingParticipants = useCallback(
    (currentGrid: (Participant | null)[]) => {
      const gridParticipantIds = currentGrid
        .filter((p) => p)
        .map((p) => p!.userId);

      const newRemaining = participants.filter(
        (p) => p.userId && !gridParticipantIds.includes(p.userId)
      );

      setRemainingParticipants(newRemaining);
    },
    [participants]
  );

  // Handle drop logic for drag and drop
  const handleDrop = (
    item: { participant: Participant; index: number },
    targetIndex: number
  ) => {
    const { participant, index: sourceIndex } = item;
    const newGridParticipants = [...gridParticipants];

    if (sourceIndex === -1) {
      // From remaining list to grid
      if (newGridParticipants[targetIndex] === null) {
        newGridParticipants[targetIndex] = participant;
        setGridParticipants(newGridParticipants);
        updateRemainingParticipants(newGridParticipants);
      }
    } else {
      // Within grid - swap positions
      const temp = newGridParticipants[targetIndex];
      newGridParticipants[targetIndex] = newGridParticipants[sourceIndex];
      newGridParticipants[sourceIndex] = temp;
      setGridParticipants(newGridParticipants);
    }
  };

  // Get CSS class for current layout
  const getLayoutStyle = () => {
    switch (currentLayout) {
      case "single":
        return "grid grid-cols-1";
      case "grid-2":
        return "grid grid-cols-2 gap-4";
      case "grid-4":
        return "grid grid-cols-2 grid-rows-2 gap-4";
      case "vertical":
        return "flex flex-col gap-4";
      default:
        return "grid grid-cols-2 grid-rows-2 gap-4";
    }
  };

  // Determine if participant has active streams
  const hasActiveStream = (participant: Participant) => {
    if (isLocalParticipant(participant)) {
      return isCameraOn || isScreenSharing;
    }
    return participant.consumers.length > 0;
  };

  // Determine if participant has screen share
  const hasScreenShare = (participant: Participant) => {
    if (isLocalParticipant(participant)) {
      return isScreenSharing;
    }
    return participant.consumers.some((c) => {
      const settings = c.track.getSettings();
      return c.track.kind === "video" && settings && settings.width
        ? settings.width >= 1000
        : false;
    });
  };

  // Determine if participant has webcam
  const hasWebcam = (participant: Participant) => {
    if (isLocalParticipant(participant)) {
      return isCameraOn;
    }
    return participant.consumers.some((c) => {
      const settings = c.track.getSettings();
      return c.track.kind === "video" && settings && settings.width
        ? settings.width < 1000
        : false;
    });
  };

  // Draggable participant component
  const DraggableParticipant = ({
    participant,
    index,
  }: {
    participant: Participant;
    index: number;
  }) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
      type: "participant",
      item: { participant, index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));

    const hasScreen = hasScreenShare(participant);
    const hasVideo = hasWebcam(participant);
    const isLocal = isLocalParticipant(participant);
    const username = getFormattedUsername(participant);

    return (
      <div
        ref={(node) => dragRef(node)}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        id={`participant-${participant.socketId}`}
        className={`w-full h-full ${
          isLocal ? "bg-blue-900/90" : "bg-gray-800/90"
        } rounded-lg border ${
          isLocal ? "border-blue-500/50" : "border-gray-700/50"
        } overflow-hidden cursor-move relative`}
      >
        {/* Main container - will contain screen share if available, otherwise webcam */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
          {/* Screen share container - main content when available */}
          <div
            className={`screen-container w-full h-full absolute inset-0 ${
              !hasScreen ? "hidden" : ""
            }`}
          >
            {isLocal && isScreenSharing && (
              <video
                ref={localScreenRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Video container - main when no screen share, or PiP when screen share active */}
          <div
            className={`video-container ${
              hasScreen
                ? "absolute top-2 right-2 w-32 h-24 z-10 rounded-lg overflow-hidden border-2 border-gray-700"
                : "w-full h-full"
            }`}
          >
            {isLocal && isCameraOn && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Avatar placeholder when no video streams */}
          {!hasVideo && !hasScreen && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`text-3xl font-bold ${
                  isLocal ? "text-blue-200" : "text-white"
                } ${
                  isLocal ? "bg-blue-600" : "bg-gray-600"
                } w-16 h-16 rounded-full flex items-center justify-center`}
              >
                {username ? username[0].toUpperCase() : "?"}
              </span>
            </div>
          )}

          {/* Stream type indicators */}
          <div className="absolute bottom-2 left-2 flex space-x-2">
            {hasVideo && (
              <div className="bg-blue-500/20 p-1 rounded-full">
                <Camera size={16} className="text-blue-400" />
              </div>
            )}
            {hasScreen && (
              <div className="bg-green-500/20 p-1 rounded-full">
                <Monitor size={16} className="text-green-400" />
              </div>
            )}
          </div>

          {/* Username label */}
          <div
            className={`absolute bottom-2 left-2 ${
              isLocal ? "bg-blue-900/70" : "bg-black/50"
            } px-2 py-1 rounded text-xs font-medium ${
              isLocal ? "text-blue-200" : "text-white"
            }`}
          >
            {username}
            {participant.role === "host" && (
              <span className="ml-1 inline-flex">
                <Crown size={12} className="text-yellow-400" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Grid slot component - handles drop events
  const GridSlot = ({
    index,
    participant,
  }: {
    index: number;
    participant: Participant | null;
  }) => {
    const [{ isOver }, dropRef] = useDrop(() => ({
      accept: "participant",
      drop: (item: { participant: Participant; index: number }) =>
        handleDrop(item, index),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={(node) => dropRef(node)}
        className={`bg-gray-800/50 rounded-lg border ${
          isOver ? "border-blue-500" : "border-gray-700/30"
        } ${
          participant ? "" : "border-dashed flex items-center justify-center"
        } cursor-pointer h-full w-full`}
        onClick={
          participant ? undefined : () => setShowParticipantSelector(true)
        }
      >
        {participant ? (
          <DraggableParticipant participant={participant} index={index} />
        ) : (
          <PlusIcon size={32} className="text-gray-500" />
        )}
      </div>
    );
  };

  // Participant selector modal
  const ParticipantSelectorModal = () => {
    if (!showParticipantSelector) return null;

    const DraggableListParticipant = ({
      participant,
    }: {
      participant: Participant;
    }) => {
      const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "participant",
        item: { participant, index: -1 },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }));

      const isLocal = isLocalParticipant(participant);
      const username = getFormattedUsername(participant);

      const handleClick = () => {
        const emptyIndex = gridParticipants.findIndex((p) => p === null);
        if (emptyIndex !== -1) {
          const newGridParticipants = [...gridParticipants];
          newGridParticipants[emptyIndex] = participant;
          setGridParticipants(newGridParticipants);
          updateRemainingParticipants(newGridParticipants);
          setShowParticipantSelector(false);
        }
      };

      return (
        <div
          ref={(node) => dragRef(node)}
          onClick={handleClick}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          className={`flex items-center justify-between ${
            isLocal ? "bg-blue-800" : "bg-zinc-700"
          } p-3 rounded-md cursor-pointer hover:${
            isLocal ? "bg-blue-700" : "bg-zinc-600"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 ${
                isLocal ? "bg-blue-600" : "bg-zinc-600"
              } rounded-full flex items-center justify-center`}
            >
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <span className={isLocal ? "text-blue-200" : "text-white"}>
              {username}
            </span>
          </div>
          <div className="flex space-x-2">
            {hasWebcam(participant) && (
              <Camera size={16} className="text-blue-400" />
            )}
            {hasScreenShare(participant) && (
              <Monitor size={16} className="text-green-400" />
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-zinc-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
          <h3 className="text-white font-bold mb-4">Select Participant</h3>
          {remainingParticipants.length > 0 ? (
            <div className="space-y-2">
              {remainingParticipants.map((participant) => (
                <DraggableListParticipant
                  key={participant.socketId}
                  participant={participant}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 py-2">
              No additional participants available
            </p>
          )}
          <button
            onClick={() => setShowParticipantSelector(false)}
            className="mt-4 w-full bg-red-500/20 text-red-400 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 relative overflow-hidden mx-4 mt-4 mb-2">
      <div className="relative h-full rounded-md overflow-hidden border border-white/10">
        {/* Background and overlay elements */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: background?.startsWith("http")
              ? `url(${background})`
              : background || "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {overlay && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${overlay})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Main grid layout */}
        <div className={`relative h-full w-full p-4 ${getLayoutStyle()}`}>
          {gridParticipants.map((participant, index) => (
            <GridSlot key={index} index={index} participant={participant} />
          ))}
        </div>

        {/* Status indicators and controls */}
        <div className="absolute top-3 left-3 bg-black/50 rounded px-2 py-0.5 text-xs font-medium">
          720p
        </div>
        {logo && (
          <div className="absolute top-3 right-12">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </div>
        )}
        <button className="absolute top-3 right-3 bg-black/50 rounded p-1 hover:bg-black/70">
          <Maximize2 size={16} className="text-white" />
        </button>
      </div>

      {/* Layout selector */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <LayoutSelector
          currentLayout={currentLayout}
          onLayoutChange={setCurrentLayout}
        />
      </div>

      {/* Participant selector modal */}
      <ParticipantSelectorModal />
    </div>
  );
};

export default StreamView;
