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

  useEffect(() => {
    // Store handlers for removal during cleanup
    const handlers: { [key: string]: EventListener } = {};

    // Function to enable autoplay
    const enableAutoplay = () => {
      setAutoplayEnabled(true);
    };

    // Create named event handlers (for proper cleanup)
    handlers.click = enableAutoplay;
    handlers.touchstart = enableAutoplay;
    handlers.keydown = enableAutoplay;

    // Add global interaction listeners
    document.addEventListener("click", handlers.click);
    document.addEventListener("touchstart", handlers.touchstart);
    document.addEventListener("keydown", handlers.keydown);

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

    // Run the check
    checkAutoplayStatus();

    // Clean up all event listeners on unmount
    return () => {
      document.removeEventListener("click", handlers.click);
      document.removeEventListener("touchstart", handlers.touchstart);
      document.removeEventListener("keydown", handlers.keydown);
    };
  }, []);
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
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }));
      const [isTalking, setIsTalking] = useState(false);
      const [videoPlaying, setVideoPlaying] = useState(false);
      const [screenPlaying, setScreenPlaying] = useState(false);
      const [audioPlaying, setAudioPlaying] = useState(false);
      const [showPlayButton, setShowPlayButton] = useState(false);

      const isLocal = participant?.userId === localuserId;
      const videoConsumer =
        participant?.consumers?.find((c) => c.type === "webcam") || null;
      const screenConsumer =
        participant?.consumers?.find((c) => c.type === "screen") || null;
      const audioConsumer =
        participant?.consumers?.find((c) => c.type === "microphone") || null;

      const videoRef = useRef<HTMLVideoElement>(null);
      const screenRef = useRef<HTMLVideoElement>(null);
      const audioRef = useRef<HTMLAudioElement>(null);
      const audioAnalyserRef = useRef<AnalyserNode | null>(null);
      const animationFrameRef = useRef<number | null>(null);

      const hasScreenShare = isLocal ? !!localTracks.screen : !!screenConsumer;
      const hasWebcam = isLocal ? !!localTracks.webcam : !!videoConsumer;

      // Completely rewritten function to safely handle media playback
      const attachStreamToElement = useCallback(
        async (
          element: HTMLVideoElement | HTMLAudioElement | null,
          track: MediaStreamTrack | undefined,
          type: "video" | "screen" | "audio"
        ) => {
          if (!element || !track) return false;

          try {
            // Clean up existing stream properly
            if (element.srcObject instanceof MediaStream) {
              const existingStream = element.srcObject as MediaStream;
              existingStream.getTracks().forEach((t) => t.stop());
            }

            // Create a new stream with the track and make sure it's enabled
            const stream = new MediaStream();
            track.enabled = true;
            stream.addTrack(track);

            // Set the stream to the element
            element.srcObject = stream;

            // Set muted status - always mute video to avoid feedback
            if (element instanceof HTMLVideoElement) {
              element.muted = true;
            } else if (isLocal && element instanceof HTMLAudioElement) {
              element.muted = true;
            }

            // Create a promise to handle the play attempt
            const tryPlay = async () => {
              try {
                await element.play();
                console.log(`${type} playback started successfully`);
                if (type === "video") setVideoPlaying(true);
                if (type === "screen") setScreenPlaying(true);
                if (type === "audio") setAudioPlaying(true);
                setShowPlayButton(false);
                return true;
              } catch (playError: any) {
                if (playError.name === "AbortError") {
                  console.log(
                    `${type} play request interrupted, likely due to stream update`
                  );
                  return false;
                } else {
                  console.warn(`${type} autoplay blocked:`, playError);
                  setShowPlayButton(true);
                  return false;
                }
              }
            };

            // Wait for metadata to load before attempting playback
            element.onloadedmetadata = async () => {
              if (autoplayEnabled) {
                await tryPlay();
              } else {
                setShowPlayButton(true);
              }
            };

            // Handle errors
            element.onerror = (e) => {
              console.error(`Media element ${type} error:`, e);
              setShowPlayButton(true);
            };

            return true;
          } catch (error) {
            console.error(`Error attaching ${type} stream:`, error);
            setShowPlayButton(true);
            return false;
          }
        },
        [isLocal, autoplayEnabled]
      );

      // Set up media streams with improved error handling
      useEffect(() => {
        let audioContext: AudioContext | null = null;

        const setup = async () => {
          // Handle webcam
          if (isLocal && localTracks.webcam) {
            await attachStreamToElement(
              videoRef.current,
              localTracks.webcam,
              "video"
            );
          } else if (videoConsumer?.track) {
            await attachStreamToElement(
              videoRef.current,
              videoConsumer.track,
              "video"
            );
          }

          // Handle screen share
          if (isLocal && localTracks.screen) {
            await attachStreamToElement(
              screenRef.current,
              localTracks.screen,
              "screen"
            );
          } else if (screenConsumer?.track) {
            await attachStreamToElement(
              screenRef.current,
              screenConsumer.track,
              "screen"
            );
          }

          // Handle audio with analyzer
          if (!isLocal && audioConsumer?.track) {
            await attachStreamToElement(
              audioRef.current,
              audioConsumer.track,
              "audio"
            );

            try {
              // Set up audio analyzer if we have audio
              if (audioRef.current && audioRef.current.srcObject) {
                audioContext = new AudioContext();
                const stream = audioRef.current.srcObject as MediaStream;
                const audioSource =
                  audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                audioSource.connect(analyser);
                audioAnalyserRef.current = analyser;

                // Start audio level detection
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkAudioLevel = () => {
                  if (!analyser) return;
                  analyser.getByteFrequencyData(dataArray);
                  const average =
                    dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                  setIsTalking(average > 30); // Threshold
                  animationFrameRef.current =
                    requestAnimationFrame(checkAudioLevel);
                };
                checkAudioLevel();
              }
            } catch (error) {
              console.error("Audio analyzer setup error:", error);
            }
          }
        };

        setup();

        // Local audio visualization simulation
        let talkingInterval: ReturnType<typeof setInterval> | null = null;
        if (isLocal && localTracks.microphone) {
          talkingInterval = setInterval(() => {
            setIsTalking((prev) => !prev);
          }, 2000);
        }

        // Enhanced cleanup function
        return () => {
          // Cancel animation frame
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }

          // Clear talking interval
          if (talkingInterval) {
            clearInterval(talkingInterval);
          }

          // Close audio context
          if (audioContext) {
            audioContext.close().catch(console.error);
          }

          // Safely clean up video and audio elements
          [videoRef.current, screenRef.current, audioRef.current].forEach(
            (element) => {
              if (element) {
                // Remove event listeners
                element.onloadedmetadata = null;

                try {
                  // Pause playback
                  element.pause();

                  // Stop all tracks in the stream
                  if (element.srcObject instanceof MediaStream) {
                    const stream = element.srcObject as MediaStream;
                    stream.getTracks().forEach((track) => {
                      track.stop();
                    });
                  }

                  // Clear the source
                  element.srcObject = null;
                } catch (e) {
                  console.error("Cleanup error:", e);
                }
              }
            }
          );
        };
      }, [
        isLocal,
        localTracks.webcam,
        localTracks.screen,
        localTracks.microphone,
        videoConsumer,
        screenConsumer,
        audioConsumer,
        attachStreamToElement,
        autoplayEnabled,
      ]);

      // Improved manual play handler for user interaction
      const handleManualPlay = async () => {
        try {
          // Attempt to enable autoplay globally
          setAutoplayEnabled(true);

          const mediaElements = [
            { element: videoRef.current, type: "video" as const },
            { element: screenRef.current, type: "screen" as const },
            { element: audioRef.current, type: "audio" as const },
          ].filter((item) => item.element && item.element.srcObject);

          for (const { element, type } of mediaElements) {
            if (element && element.paused && element.srcObject) {
              try {
                await element.play();
                console.log(`${type} playback started manually`);
                if (type === "video") setVideoPlaying(true);
                if (type === "screen") setScreenPlaying(true);
                if (type === "audio") setAudioPlaying(true);
              } catch (playError) {
                console.error(`Error playing ${type}:`, playError);

                // For some browsers, we need to retry after user interaction
                if (playError.name === "NotAllowedError") {
                  console.log(`Retry ${type} playback after interaction`);

                  // Schedule a retry with a slight delay
                  setTimeout(async () => {
                    try {
                      await element.play();
                      if (type === "video") setVideoPlaying(true);
                      if (type === "screen") setScreenPlaying(true);
                      if (type === "audio") setAudioPlaying(true);
                    } catch (retryError) {
                      console.error(`Retry failed for ${type}:`, retryError);
                    }
                  }, 100);
                }
              }
            }
          }

          // Hide play button after manual interaction
          setShowPlayButton(false);
        } catch (error) {
          console.error("Manual play error:", error);
        }
      };

      // Attempt to play videos whenever autoplay status changes
      useEffect(() => {
        if (autoplayEnabled) {
          // Try to play all media elements when autoplay becomes enabled
          handleManualPlay();
        }
      }, [autoplayEnabled]);

      return (
        <div
          ref={drag}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          className="w-full h-full bg-gray-800/90 rounded-lg border border-gray-700/50 overflow-hidden cursor-move"
        >
          <div className="w-full h-full bg-gray-800 flex flex-col relative">
            {hasScreenShare && (
              <div className="flex-1 w-full relative">
                <video
                  ref={screenRef}
                  playsInline
                  muted={true}
                  className="w-full h-full object-contain"
                />
                {hasWebcam && (
                  <div className="absolute top-2 right-2 w-1/4 h-1/4 z-10 rounded-lg overflow-hidden border-2 border-gray-700">
                    <video
                      ref={videoRef}
                      playsInline
                      muted={true}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}
            {!hasScreenShare && (
              <div className="flex-1 w-full flex items-center justify-center">
                {hasWebcam ? (
                  <video
                    ref={videoRef}
                    playsInline
                    muted={true}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center w-24 h-24 rounded-full bg-indigo-600 text-3xl font-bold text-white transition-transform ${
                      isTalking ? "animate-pulse scale-110" : ""
                    }`}
                  >
                    {participant.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
            )}
            {!isLocal && audioConsumer && <audio ref={audioRef} playsInline />}
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
                    className={`w-1.5 h-6 bg-green-400 rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-sm text-white">
              {participant.username}
              {isLocal && " (You)"}
            </div>
            {showPlayButton && (
              <button
                onClick={handleManualPlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full flex items-center justify-center z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span className="ml-2">Click to Play Media</span>
              </button>
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
            anywhere on this page to enable streaming.
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
