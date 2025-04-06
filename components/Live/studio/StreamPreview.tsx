import React, { useState, useCallback, useRef, useEffect } from "react";
import { Maximize2, Crown, PlusIcon } from "lucide-react";
import LayoutSelector from "./LayoutController";
import { useDrag, useDrop } from "react-dnd";

interface Participant {
  userId: string;
  username: string;
  role: string;
  consumers: {
    id: string;
    producerId: string;
    track: MediaStreamTrack;
    type: string;
  }[];
}

interface StreamViewProps {
  streamSettings: any;
  participants: Participant[];
  currentLayout: string;
  setCurrentLayout: (layout: string) => void;
  localuserId: string;
  localTracks: {
    webcam?: MediaStreamTrack;
    microphone?: MediaStreamTrack;
    screen?: MediaStreamTrack;
  };
}

const StreamView: React.FC<StreamViewProps> = ({
  streamSettings,
  participants,
  currentLayout,
  setCurrentLayout,
  localuserId,
  localTracks,
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
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);

  // Store all media elements that need to be played after user interaction
  const pendingMediaElements = useRef<HTMLMediaElement[]>([]);
  // Store all pending play promises to avoid interruptions
  const pendingPlayPromises = useRef<Map<HTMLMediaElement, Promise<void>>>(new Map());

  // Function to play all pending media elements
  const playAllPendingMedia = useCallback(async () => {
    if (!autoplayEnabled || pendingMediaElements.current.length === 0) return;

    console.log(
      `Attempting to play ${pendingMediaElements.current.length} pending media elements`
    );

    // Create a copy of the current pending elements and clear the original array
    const elements = [...pendingMediaElements.current];
    pendingMediaElements.current = [];

    // Try to play each element
    for (const element of elements) {
      try {
        // Check if the element is still in the DOM
        if (element.isConnected) {
          // Make sure we're not interrupting an existing play promise
          if (!pendingPlayPromises.current.has(element)) {
            const playPromise = element.play();
            if (playPromise !== undefined) {
              // Store the pending promise
              pendingPlayPromises.current.set(element, playPromise);
              
              // When the promise completes, remove it from our map and unmute
              playPromise
                .then(() => {
                  pendingPlayPromises.current.delete(element);
                  // Only unmute audio elements (keep video muted for privacy)
                  if (element.tagName === 'AUDIO') {
                    element.muted = false;
                  }
                  console.log("Successfully played media element", element);
                })
                .catch(error => {
                  pendingPlayPromises.current.delete(element);
                  console.warn("Failed to play media element", error);
                  // If play fails, add back to pending list
                  pendingMediaElements.current.push(element);
                });
            }
          } else {
            console.log("Play already in progress for element", element);
          }
        }
      } catch (error) {
        console.warn("Error setting up play promise", error);
        // If setup fails, add back to pending list
        pendingMediaElements.current.push(element);
      }
    }
  }, [autoplayEnabled]);

  useEffect(() => {
    // Function to enable autoplay and play pending media
    const enableAutoplay = () => {
      setAutoplayEnabled(true);
      // Schedule playing pending media after state update
      setTimeout(playAllPendingMedia, 0);
    };

    // Create handler for user interaction
    const handleUserInteraction = () => {
      if (!autoplayEnabled) {
        console.log("User interaction detected. Enabling autoplay.");
        enableAutoplay();
      }
    };

    // Add global interaction listeners
    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    // Check if autoplay is already enabled
    const checkAutoplayStatus = async () => {
      try {
        // Create a temporary audio element for testing
        const tempAudio = document.createElement("audio");
        tempAudio.muted = true;
        tempAudio.src =
          "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

        // Try to play it
        const playPromise = tempAudio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("Autoplay is enabled in this browser session");
          setAutoplayEnabled(true);
        }

        // Clean up
        tempAudio.remove();
      } catch (e) {
        console.log("Autoplay not enabled yet - waiting for user interaction");
        setAutoplayEnabled(false);
      }
    };

    // Run the autoplay check
    checkAutoplayStatus();

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [autoplayEnabled, playAllPendingMedia]);

  // Trigger playing pending media elements when autoplay becomes enabled
  useEffect(() => {
    if (autoplayEnabled) {
      playAllPendingMedia();
    }
  }, [autoplayEnabled, playAllPendingMedia]);

  useEffect(() => {
    let initialGridSize;
    switch (currentLayout) {
      case "single":
        initialGridSize = 1;
        break;
      case "grid-2":
        initialGridSize = 2;
        break;
      case "grid-4":
        initialGridSize = 4;
        break;
      case "vertical":
        initialGridSize = 6;
        break;
      default:
        initialGridSize = 4;
    }

    // Make sure we have participants before setting the grid
    if (participants && participants.length > 0) {
      const initialGrid = participants.slice(0, initialGridSize).map((p) => p);
      const initialRemaining = participants.slice(initialGridSize);
      setGridParticipants(
        initialGrid.concat(
          Array(initialGridSize - initialGrid.length).fill(null)
        )
      );
      setRemainingParticipants(initialRemaining);
    }
  }, [participants, currentLayout]);

  const updateRemainingParticipants = useCallback(
    (currentGrid: (Participant | null)[]) => {
      const gridParticipantIds = currentGrid
        .filter((p) => p)
        .map((p) => p!.userId);
      const newRemaining = participants.filter(
        (p) => !gridParticipantIds.includes(p.userId)
      );
      setRemainingParticipants(newRemaining);
    },
    [participants]
  );

  const handleDrop = useCallback(
    (
      item: { participant: Participant; index: number },
      targetIndex: number
    ) => {
      const { participant, index: sourceIndex } = item;
      const newGridParticipants = [...gridParticipants];
      if (sourceIndex === -1) {
        if (newGridParticipants[targetIndex] === null) {
          newGridParticipants[targetIndex] = participant;
          setGridParticipants(newGridParticipants);
          updateRemainingParticipants(newGridParticipants);
        }
      } else {
        const temp = newGridParticipants[targetIndex];
        newGridParticipants[targetIndex] = newGridParticipants[sourceIndex];
        newGridParticipants[sourceIndex] = temp;
        setGridParticipants(newGridParticipants);
      }
    },
    [gridParticipants, updateRemainingParticipants]
  );

  const getLayoutStyle = useCallback(() => {
    switch (currentLayout) {
      case "single":
        return "grid grid-cols-1";
      case "grid-2":
        return "grid grid-cols-2 gap-4";
      case "grid-4":
        return "grid grid-cols-2 gap-4";
      case "vertical":
        return "flex flex-col gap-4";
      default:
        return "grid grid-cols-1";
    }
  }, [currentLayout]);

  // Function to properly handle playing media elements
  const safePlayMedia = useCallback(
    async (element: HTMLMediaElement) => {
      if (!autoplayEnabled) {
        // If autoplay not enabled, add to pending list
        pendingMediaElements.current.push(element);
        return;
      }

      // Make sure we don't have a play already pending for this element
      if (pendingPlayPromises.current.has(element)) {
        console.log("Play already in progress for element");
        return;
      }

      try {
        const playPromise = element.play();
        if (playPromise !== undefined) {
          // Store the pending promise
          pendingPlayPromises.current.set(element, playPromise);
          
          await playPromise;
          console.log("Successfully played media element");
          
          // Only unmute audio (keep video muted for privacy/feedback)
          if (element.tagName === 'AUDIO') {
            element.muted = false;
          }
        }
      } catch (error) {
        console.warn("Failed to play media element", error);
        // Add to pending elements to try again later
        if (!pendingMediaElements.current.includes(element)) {
          pendingMediaElements.current.push(element);
        }
      } finally {
        // Clean up the promise reference
        pendingPlayPromises.current.delete(element);
      }
    },
    [autoplayEnabled]
  );

  const DraggableParticipant = React.memo(
    ({
      participant,
      index,
      localuserId,
      localTracks,
    }: {
      participant: Participant;
      index: number;
      localuserId: string;
      localTracks: {
        webcam?: MediaStreamTrack;
        microphone?: MediaStreamTrack;
        screen?: MediaStreamTrack;
      };
    }) => {
      const [{ isDragging }, drag] = useDrag(() => ({
        type: "participant",
        item: { participant, index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      }));
      const [isTalking, setIsTalking] = useState(false);
      const isLocal = participant.userId === localuserId;
      const videoConsumer =
        participant.consumers.find((c) => c.type === "webcam") || null;
      const screenConsumer =
        participant.consumers.find((c) => c.type === "screen") || null;
      const audioConsumer =
        participant.consumers.find((c) => c.type === "microphone") || null;
      const hasScreenShare = isLocal ? !!localTracks.screen : !!screenConsumer;
      const hasWebcam = isLocal ? !!localTracks.webcam : !!videoConsumer;

      // Refs for dynamically created elements
      const participantContainerRef = useRef<HTMLDivElement>(null);
      const videoElRef = useRef<HTMLVideoElement | null>(null);
      const screenElRef = useRef<HTMLVideoElement | null>(null);
      const audioElRef = useRef<HTMLAudioElement | null>(null);

      // Setup media streams using DOM methods
      useEffect(() => {
        if (!participantContainerRef.current) return;

        // Cleanup existing elements
        const cleanupExisting = () => {
          // Properly clean up any pending play promises
          if (videoElRef.current) {
            pendingPlayPromises.current.delete(videoElRef.current);
            videoElRef.current.srcObject = null;
            if (videoElRef.current.parentNode) {
              videoElRef.current.parentNode.removeChild(videoElRef.current);
            }
            videoElRef.current = null;
          }
          if (screenElRef.current) {
            pendingPlayPromises.current.delete(screenElRef.current);
            screenElRef.current.srcObject = null;
            if (screenElRef.current.parentNode) {
              screenElRef.current.parentNode.removeChild(screenElRef.current);
            }
            screenElRef.current = null;
          }
          if (audioElRef.current) {
            pendingPlayPromises.current.delete(audioElRef.current);
            audioElRef.current.srcObject = null;
            if (audioElRef.current.parentNode) {
              audioElRef.current.parentNode.removeChild(audioElRef.current);
            }
            audioElRef.current = null;
          }
        };

        cleanupExisting();

        // Setup webcam
        if (hasWebcam) {
          const videoEl = document.createElement("video");
          videoEl.autoplay = false; // Don't autoplay initially
          videoEl.playsInline = true;
          videoEl.muted = true; // Always mute initially
          videoEl.className = "w-full h-full object-cover";
          const stream =
            isLocal && localTracks.webcam
              ? new MediaStream([localTracks.webcam])
              : videoConsumer
              ? new MediaStream([videoConsumer.track])
              : null;
          if (stream) {
            videoEl.srcObject = stream;
            participantContainerRef.current.appendChild(videoEl);
            videoElRef.current = videoEl;

            // Handle playback with promise management
            safePlayMedia(videoEl);
          }
        }

        // Setup screen share
        if (hasScreenShare) {
          const screenEl = document.createElement("video");
          screenEl.autoplay = false; // Don't autoplay initially
          screenEl.playsInline = true;
          screenEl.muted = true; // Always mute initially
          screenEl.className = "w-full h-full object-contain";
          const stream =
            isLocal && localTracks.screen
              ? new MediaStream([localTracks.screen])
              : screenConsumer
              ? new MediaStream([screenConsumer.track])
              : null;
          if (stream) {
            screenEl.srcObject = stream;
            participantContainerRef.current.appendChild(screenEl);
            screenElRef.current = screenEl;

            // Handle playback with promise management
            safePlayMedia(screenEl);
          }
        }

        // Setup audio for remote participants
        if (!isLocal && audioConsumer) {
          const audioEl = document.createElement("audio");
          audioEl.autoplay = false; // Don't autoplay initially
          audioEl.playsInline = true;
          audioEl.muted = true; // Start muted, will unmute after play succeeds
          audioEl.style.display = "none";
          const stream = new MediaStream([audioConsumer.track]);
          audioEl.srcObject = stream;
          document.body.appendChild(audioEl);
          audioElRef.current = audioEl;

          // Handle playback with promise management
          safePlayMedia(audioEl);
        }

        // Cleanup on unmount
        return () => {
          cleanupExisting();
          if (hasWebcam && videoElRef.current?.srcObject) {
            (videoElRef.current.srcObject as MediaStream)
              .getTracks()
              .forEach((track) => track.stop());
          }
          if (hasScreenShare && screenElRef.current?.srcObject) {
            (screenElRef.current.srcObject as MediaStream)
              .getTracks()
              .forEach((track) => track.stop());
          }
          if (!isLocal && audioConsumer && audioElRef.current?.srcObject) {
            (audioElRef.current.srcObject as MediaStream)
              .getTracks()
              .forEach((track) => track.stop());
          }
        };
      }, [
        hasWebcam,
        hasScreenShare,
        isLocal,
        localTracks.webcam,
        localTracks.screen,
        videoConsumer,
        screenConsumer,
        audioConsumer,
        safePlayMedia,
      ]);

      // Simple talking indicator for local user
      useEffect(() => {
        if (isLocal && localTracks.microphone) {
          const interval = setInterval(
            () => setIsTalking((prev) => !prev),
            2000
          );
          return () => clearInterval(interval);
        }
      }, [isLocal, localTracks.microphone]);

      return (
        <div
          ref={drag}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          className="w-full h-full bg-gray-800/90 rounded-lg border border-gray-700/50 overflow-hidden cursor-move"
        >
          <div
            ref={participantContainerRef}
            className="w-full h-full bg-gray-800 flex flex-col relative"
          >
            {!hasScreenShare && !hasWebcam && (
              <div className="flex-1 w-full flex items-center justify-center">
                <div
                  className={`flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 text-3xl font-bold text-white transition-transform ${
                    isTalking ? "animate-pulse scale-110" : ""
                  }`}
                >
                  {participant.username?.[0]?.toUpperCase() || "?"}
                </div>
              </div>
            )}
            {participant.role === "host" && (
              <div className="absolute top-2 left-2 bg-yellow-500/20 rounded-full p-1.5">
                <Crown size={16} className="text-yellow-400" />
              </div>
            )}
            {isTalking && (!hasWebcam || hasScreenShare) && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-6 bg-green-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-sm text-white">
              {participant.username}
              {isLocal && " (You)"}
            </div>
            {!isLocal && !autoplayEnabled && (hasWebcam || hasScreenShare) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="bg-black/80 p-3 rounded-lg">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={() => setAutoplayEnabled(true)}
                  >
                    Click to Play
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  const GridSlot = React.memo(
    ({
      index,
      participant,
    }: {
      index: number;
      participant: Participant | null;
    }) => {
      const [{ isOver }, drop] = useDrop(() => ({
        accept: "participant",
        drop: (item: { participant: Participant; index: number }) =>
          handleDrop(item, index),
        collect: (monitor) => ({
          isOver: monitor.isOver(),
        }),
      }));

      return (
        <div
          ref={drop}
          className={`bg-gray-800/50 rounded-lg border ${
            isOver ? "border-blue-500" : "border-gray-700/30"
          } ${
            participant ? "" : "border-dashed flex items-center justify-center"
          } cursor-pointer relative`}
          style={{ minHeight: "200px" }}
          onClick={
            participant ? undefined : () => setShowParticipantSelector(true)
          }
        >
          {participant ? (
            <DraggableParticipant
              participant={participant}
              index={index}
              localuserId={localuserId}
              localTracks={localTracks}
            />
          ) : (
            <PlusIcon size={32} className="text-gray-500" />
          )}
        </div>
      );
    }
  );

  const ParticipantSelectorModal = () => {
    if (!showParticipantSelector) return null;

    const DraggableListParticipant = React.memo(
      ({ participant }: { participant: Participant }) => {
        const [{ isDragging }, drag] = useDrag(() => ({
          type: "participant",
          item: { participant, index: -1 },
          collect: (monitor) => ({
            isDragging: monitor.isDragging(),
          }),
        }));

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
            ref={drag}
            onClick={handleClick}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center justify-between bg-zinc-700 p-3 rounded-md cursor-pointer hover:bg-zinc-600"
          >
            <span className="text-white">{participant.username}</span>
          </div>
        );
      }
    );

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-zinc-800 rounded-lg p-6 w-96">
          <h3 className="text-white font-bold mb-4">Select Participant</h3>
          <div className="space-y-2">
            {remainingParticipants.length > 0 ? (
              remainingParticipants.map((participant) => (
                <DraggableListParticipant
                  key={participant.userId}
                  participant={participant}
                />
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">
                No additional participants available
              </p>
            )}
          </div>
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
      {!autoplayEnabled && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
          <h3 className="text-white text-xl font-bold mb-4">
            Media Playback Permission Required
          </h3>
          <p className="text-white/70 text-center max-w-md mb-6">
            Your browser requires user interaction before playing media. Click
            the button below to enable streaming.
          </p>
          <button
            onClick={() => setAutoplayEnabled(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg"
          >
            Enable Media Playback
          </button>
        </div>
      )}
      <div className="relative h-full rounded-md overflow-hidden border border-white/10">
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
        <div className={`relative h-full w-full p-4 ${getLayoutStyle()}`}>
          {gridParticipants.map((participant, index) => (
            <GridSlot key={index} index={index} participant={participant} />
          ))}
        </div>
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <LayoutSelector
          currentLayout={currentLayout}
          onLayoutChange={setCurrentLayout}
        />
      </div>
      <ParticipantSelectorModal />
    </div>
  );
};

export default StreamView;