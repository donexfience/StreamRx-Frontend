import React, { useState, useCallback, useRef, useEffect } from "react";
import { Maximize2, Crown, PlusIcon } from "lucide-react";
import LayoutSelector from "./LayoutController";
import { motion } from "framer-motion";
import { useDrag, useDrop } from "react-dnd";
import * as mediasoup from "mediasoup-client";

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
}

const StreamView: React.FC<StreamViewProps> = ({
  streamSettings,
  participants,
  currentLayout,
  setCurrentLayout,
  localStreams,
  isCameraOn,
  isScreenSharing,
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

  // Initialize grid based on layout
  React.useEffect(() => {
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
    const localParticipant: Participant = {
      socketId: "local",
      userId: "local",
      username: "You",
      role: "host",
      consumers: [],
    };
    const allParticipants = [localParticipant, ...participants];
    const initialGrid = participants.slice(0, initialGridSize).map((p) => p);
    const initialRemaining = participants.slice(initialGridSize);
    setGridParticipants(
      initialGrid.concat(Array(initialGridSize - initialGrid.length).fill(null))
    );
    setRemainingParticipants(allParticipants.slice(initialGridSize));

    if (isCameraOn && localVideoRef.current) {
      const webcam = localStreams.find((p) => p.type === "webcam");
      if (webcam)
        localVideoRef.current.srcObject = new MediaStream([webcam.track]);
    }
    if (isScreenSharing && localScreenRef.current) {
      const screen = localStreams.find((p) => p.type === "screen");
      if (screen)
        localScreenRef.current.srcObject = new MediaStream([screen.track]);
    }
  }, [participants, currentLayout, localStreams, isCameraOn, isScreenSharing]);

  useEffect(() => {
    participants.forEach((participant) => {
      participant.consumers.forEach((consumer: any) => {
        const elId = `participant-${participant.socketId}`;
        const participantEl = document.getElementById(elId);
        if (!participantEl) return;

        if (consumer.track.kind === "video") {
          const isScreenShare = consumer.track.getSettings().width > 1000;
          const container = isScreenShare
            ? participantEl.querySelector(".screen-container")
            : participantEl.querySelector(".video-container");
          if (container && !consumer.consumer.attached) {
            const videoEl = document.createElement("video");
            videoEl.autoplay = true;
            videoEl.playsInline = true;
            videoEl.muted = true;
            videoEl.srcObject = new MediaStream([consumer.track]);
            container.innerHTML = "";
            container.appendChild(videoEl);
            consumer.consumer.attached = true;
            participant[isScreenShare ? "screenEl" : "videoEl"] = videoEl;
          }
        } else if (
          consumer.track.kind === "audio" &&
          !consumer.consumer.attached
        ) {
          const audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.srcObject = new MediaStream([consumer.track]);
          document.body.appendChild(audioEl);
          consumer.consumer.attached = true;
          participant.audioEl = audioEl;
        }
      });
    });
  }, [participants]);

  const updateRemainingParticipants = (currentGrid: (Participant | null)[]) => {
    const gridParticipantIds = currentGrid
      .filter((p) => p)
      .map((p) => p!.userId);
    const newRemaining = participants.filter(
      (p) => !gridParticipantIds.includes(p.userId)
    );
    setRemainingParticipants(newRemaining);
  };

  // Handle drop logic
  const handleDrop = (
    item: { participant: Participant; index: number },
    targetIndex: number
  ) => {
    const { participant, index: sourceIndex } = item;
    const newGridParticipants = [...gridParticipants];

    if (sourceIndex === -1) {
      // From list to grid
      if (newGridParticipants[targetIndex] === null) {
        newGridParticipants[targetIndex] = participant;
        setGridParticipants(newGridParticipants);
        updateRemainingParticipants(newGridParticipants);
      }
    } else {
      // Within grid
      const temp = newGridParticipants[targetIndex];
      newGridParticipants[targetIndex] = newGridParticipants[sourceIndex];
      newGridParticipants[sourceIndex] = temp;
      setGridParticipants(newGridParticipants);
    }
  };

  const getLayoutStyle = () => {
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
  };

  // Draggable participant component
  const DraggableParticipant = ({
    participant,
    index,
  }: {
    participant: Participant;
    index: number;
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "participant",
      item: { participant, index },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));

    return (
      <div
        ref={drag}
        style={{ opacity: isDragging ? 0.5 : 1 }}
        id={`participant-${participant.socketId}`}
        className="w-full h-full bg-gray-800/90 rounded-lg border border-gray-700/50 overflow-hidden cursor-move"
      >
        <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
          {participant.socketId === "local" ? (
            <>
              <div className="video-container w-full h-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              {isScreenSharing && (
                <div className="screen-container w-full h-full absolute top-0 left-0">
                  <video
                    ref={localScreenRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="video-container w-full h-full" />
              <div className="screen-container w-full h-full absolute top-0 left-0" />
            </>
          )}
          <span className="text-3xl font-bold text-white absolute">
            {participant.username ? participant.username[0].toUpperCase() : "?"}
          </span>
          {participant.role === "host" && (
            <div className="absolute top-2 right-2 bg-yellow-500/20 rounded-full p-1">
              <Crown size={16} className="text-yellow-400" />
            </div>
          )}
        </div>
      </div>
    );
  };
  const GridSlot = ({
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
        } cursor-pointer`}
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
    };

    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-zinc-800 rounded-lg p-6 w-96">
          <h3 className="text-white font-bold mb-4">Select Participant</h3>
          <div className="space-y-2">
            {remainingParticipants.map((participant) => (
              <DraggableListParticipant
                key={participant.userId}
                participant={participant}
              />
            ))}
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
          <Maximize2 size={16} />
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
