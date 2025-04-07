import { useSocket } from "@/hooks/useSocket";
import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import Header from "./studio/Header";
import StreamView from "./studio/StreamPreview";
import ControlBar from "./studio/ControllBar";
import SourcePanel from "./studio/SourcePanel";
import Sidebar from "./studio/SideBar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Device } from "mediasoup-client";

interface LIVESTUDIOProps {
  role: "host" | "guest";
  user: any;
  channelData?: any;
  streams?: any[];
  initialCameraOn?: boolean;
  initialMicOn?: boolean;
}

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

const LIVESTUDIO: React.FC<LIVESTUDIOProps> = ({
  role,
  user,
  channelData,
  streams,
  initialCameraOn = false,
  initialMicOn = false,
}) => {
  const { streamingSocket } = useSocket();
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);

  const [streamSettings, setStreamSettings] = useState({
    background: "linear-gradient(to bottom right, #b9328d, #4b6ef7)",
    overlay: null,
    logo: null,
    font: "Default",
    theme: { bg: "bg-black/50", text: "text-white" },
  });
  const [streamId, setStreamId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [guestRequests, setGuestRequests] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map()
  );
  const [currentLayout, setCurrentLayout] = useState<string>("grid-2");
  const [producers, setProducers] = useState<Producer[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const localUserId = user._id;

  const handleSettingsChange = useCallback(
    (newSettings: any) => {
      const newSettingsStr = JSON.stringify(newSettings);
      const currentSettingsStr = JSON.stringify(streamSettings);

      if (newSettingsStr !== currentSettingsStr) {
        console.log("Updating stream settings in LIVESTUDIO:", newSettings);
        setStreamSettings(newSettings);
      }
    },
    [streamSettings]
  );

  useEffect(() => {
    if (streamingSocket) {
      console.log("Streaming socket is connected in liveStudio");

      streamingSocket.emit("joinStudio", { role, user, channelData });

      const joinRoom = async () => {
        try {
          const { routerRtpCapabilities } = await new Promise<any>(
            (resolve) => {
              streamingSocket.emit(
                "joinRoom",
                streamId || channelData._id,
                resolve
              );
            }
          );

          const device = new Device();
          await device.load({ routerRtpCapabilities });
          deviceRef.current = device;

          await createSendTransport();
          await createRecvTransport();

          setIsJoined(true);

          // Handle initial camera/mic states
          if (initialCameraOn) enableCamera();
          if (initialMicOn) enableMicrophone();
        } catch (error) {
          console.error("Error joining room:", error);
          setErrorMessage("Failed to join room.");
        }
      };

      const handleStreamUpdate = (data: any) => {
        console.log("Stream update:", data);
        setStreamId(data?.id);
        setParticipants((prev) => {
          const updated = new Map(prev);
          data?.participants?.forEach((p: any) => {
            if (!updated.has(p.socketId)) {
              updated.set(p.socketId, { ...p, consumers: [] });
            }
          });
          return updated;
        });
        joinRoom();
      };

      const handleParticipantJoined = (participant: any) => {
        setParticipants((prev) => {
          const updated = new Map(prev);
          if (!updated.has(participant.socketId)) {
            updated.set(participant.socketId, {
              ...participant,
              consumers: [],
            });
          }
          return updated;
        });
      };
      console.log(participants, "participants got ");

      const handleNewProducer = async ({
        producerId,
        producerSocketId,
      }: any) => {
        await consumeProducer(producerId, producerSocketId);
      };

      const handleProducerClosed = ({ producerId }: any) => {
        removeConsumerByProducerId(producerId);
      };

      const handleParticipantLeft = ({ socketId }: any) => {
        setParticipants((prev) => {
          const updated = new Map(prev);
          updated.delete(socketId);
          return updated;
        });
      };

      const handleStreamSettings = (settings: any) => {
        console.log("Stream settings received in LIVESTUDIO:", settings);
        handleSettingsChange(settings);
      };

      const handleError = (error: any) => {
        console.error("Streaming socket error:", error);
      };

      const handleGuestRequest = (request: any) => {
        if (role === "host") {
          setGuestRequests((prev) => [...prev, request]);
        }
      };

      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);
      streamingSocket.on("error", handleError);
      streamingSocket.on("newProducer", handleNewProducer);
      streamingSocket.on("producerClosed", handleProducerClosed);
      streamingSocket.on("participantLeft", handleParticipantLeft);
      streamingSocket.on("guestRequest", handleGuestRequest);
      streamingSocket.on("participantJoined", handleParticipantJoined);
      streamingSocket.on("error", (error: any) => {
        console.error("Streaming socket error:", error);
        setErrorMessage("Socket error occurred.");
      });

      return () => {
        closeAllProducers();
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("newProducer");
        streamingSocket.off("producerClosed");
        streamingSocket.off("participantLeft");
        streamingSocket.off("participantJoined", handleParticipantJoined);
        streamingSocket.off("streamSettings", handleStreamSettings);
        streamingSocket.off("error", handleError);
        streamingSocket.off("guestRequest", handleGuestRequest);
      };
    }
  }, [streamingSocket, role, user, channelData, handleSettingsChange]);

  // Create send transport
  const createSendTransport = async () => {
    if (!streamingSocket || !deviceRef.current) return;
    const transportOptions = await new Promise<any>((resolve) => {
      streamingSocket.emit("createTransport", "send", resolve);
    });
    const transport = deviceRef.current.createSendTransport(transportOptions);
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      await streamingSocket.emitWithAck("connectTransport", {
        transportId: transport.id,
        dtlsParameters,
      });
      callback();
    });
    transport.on("produce", async ({ kind, rtpParameters }, callback) => {
      const { id } = await streamingSocket.emitWithAck("produce", {
        transportId: transport.id,
        kind,
        rtpParameters,
      });
      callback({ id });
    });
    sendTransportRef.current = transport;
  };

  // Create receive transport
  const createRecvTransport = async () => {
    if (!streamingSocket || !deviceRef.current) return;
    const transportOptions = await new Promise<any>((resolve) => {
      streamingSocket.emit("createTransport", "recv", resolve);
    });
    const transport = deviceRef.current.createRecvTransport(transportOptions);
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      await streamingSocket.emitWithAck("connectTransport", {
        transportId: transport.id,
        dtlsParameters,
      });
      callback();
    });
    recvTransportRef.current = transport;
  };

  // Media control functions
  const enableCamera = async () => {
    if (!deviceRef.current?.canProduce("video") || !sendTransportRef.current)
      return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const producer = await sendTransportRef.current.produce({ track });
    setProducers((prev) => [
      ...prev,
      { id: producer.id, track, type: "webcam" },
    ]);
    setIsCameraOn(true);
  };

  const disableCamera = () => {
    const producer = producers.find((p) => p.type === "webcam");
    if (producer) {
      producer.track.stop();
      streamingSocket?.emit("closeProducer", { producerId: producer.id });
      setProducers((prev) => prev.filter((p) => p.type !== "webcam"));
      setIsCameraOn(false);
    }
  };

  const enableMicrophone = async () => {
    if (!deviceRef.current?.canProduce("audio") || !sendTransportRef.current)
      return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    const producer = await sendTransportRef.current.produce({ track });
    setProducers((prev) => [
      ...prev,
      { id: producer.id, track, type: "microphone" },
    ]);
    setIsMicOn(true);
  };

  const disableMicrophone = () => {
    const producer = producers.find((p) => p.type === "microphone");
    if (producer) {
      producer.track.stop();
      streamingSocket?.emit("closeProducer", { producerId: producer.id });
      setProducers((prev) => prev.filter((p) => p.type !== "microphone"));
      setIsMicOn(false);
    }
  };

  const startScreenSharing = async () => {
    if (!deviceRef.current?.canProduce("video") || !sendTransportRef.current)
      return;
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const track = stream.getVideoTracks()[0];
    track.addEventListener("ended", stopScreenSharing);
    const producer = await sendTransportRef.current.produce({ track });
    setProducers((prev) => [
      ...prev,
      { id: producer.id, track, type: "screen" },
    ]);
    setIsScreenSharing(true);
  };

  const stopScreenSharing = () => {
    const producer = producers.find((p) => p.type === "screen");
    if (producer) {
      producer.track.stop();
      streamingSocket?.emit("closeProducer", { producerId: producer.id });
      setProducers((prev) => prev.filter((p) => p.type !== "screen"));
      setIsScreenSharing(false);
    }
  };

  const consumeProducer = async (
    producerId: string,
    producerSocketId: string
  ) => {
    if (!recvTransportRef.current || !deviceRef.current) return;
    const { id, kind, rtpParameters } = await streamingSocket.emitWithAck(
      "consume",
      {
        transportId: recvTransportRef.current.id,
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      }
    );
    const consumer = await recvTransportRef.current.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });
    streamingSocket.emit("resumeConsumer", consumer.id);
    const newConsumer: Consumer = {
      id: consumer.id,
      producerId,
      consumer,
      track: consumer.track,
      producerSocketId,
    };
    setParticipants((prev) => {
      const updated = new Map(prev);
      const participant = updated.get(producerSocketId) || {
        socketId: producerSocketId,
        consumers: [],
      };
      participant.consumers = [...participant.consumers, newConsumer];
      updated.set(producerSocketId, participant);
      return updated;
    });
  };

  const removeConsumerByProducerId = (producerId: string) => {
    setParticipants((prev) => {
      const updated = new Map(prev);
      for (const [socketId, participant] of updated) {
        const consumerIndex = participant.consumers.findIndex(
          (c) => c.producerId === producerId
        );
        if (consumerIndex !== -1) {
          const consumer = participant.consumers[consumerIndex];
          consumer.consumer.close();
          participant.consumers.splice(consumerIndex, 1);
          if (participant.consumers.length === 0) updated.delete(socketId);
          break;
        }
      }
      return updated;
    });
  };

  const closeAllProducers = () => {
    producers.forEach((p) => {
      p.track.stop();
      streamingSocket?.emit("closeProducer", { producerId: p.id });
    });
    setProducers([]);
    setIsCameraOn(false);
    setIsMicOn(false);
    setIsScreenSharing(false);
  };

  useEffect(() => {
    if (streamingSocket && isJoined && streamId) {
      streamingSocket.emit("getStreamSettings", streamId);
    }
  }, [streamingSocket, isJoined, streamId]);

  const handleApproveGuest = async (request: any) => {
    if (streamingSocket && role === "host") {
      await streamingSocket.emitWithAck("approveGuest", {
        token: request.token,
        username: request.username,
        channelId: request.channelId,
        socketId: request.socketId,
        approverId: user._id,
      });
      setGuestRequests((prev) =>
        prev.filter((r) => r.socketId !== request.socketId)
      );
    }
  };

  const handleDenyGuest = (request: any) => {
    if (streamingSocket && role === "host") {
      streamingSocket.emit("denyGuest", {
        socketId: request.socketId,
        approverId: user._id,
        channelId: request.channelId,
      });
      setGuestRequests((prev) =>
        prev.filter((r) => r.socketId !== request.socketId)
      );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const channelOwner: any = channelData.ownerId;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="flex flex-col h-screen bg-[#0a172b] text-white overflow-hidden w-full">
          <Header streams={streams} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
            <StreamView
              streamSettings={streamSettings}
              participants={Array.from(participants.values())}
              currentLayout={currentLayout}
              setCurrentLayout={setCurrentLayout}
              localStreams={producers}
              isCameraOn={isCameraOn}
              isScreenSharing={isScreenSharing}
            />
            <ControlBar
              channelId={channelData._id}
              streamerId={channelData.ownerId}
              toggleCamera={() => (isCameraOn ? disableCamera() : enableCamera())}
              toggleMicrophone={() => (isMicOn ? disableMicrophone() : enableMicrophone())}
              toggleScreenSharing={() => (isScreenSharing ? stopScreenSharing() : startScreenSharing())}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isScreenSharing={isScreenSharing}
            />
            </div>
            <SourcePanel
              role={role}
              onSettingsChange={handleSettingsChange}
              streamId={streamId}
            />
          </div>
          {/* Guest Request UI for Host */}
          {role === "host" && guestRequests.length > 0 && (
            <div className="fixed bottom-4 right-4 z-50 bg-zinc-800 p-4 w-96 rounded-lg border border-zinc-700">
              <h3 className="text-white font-bold mb-2">Guest Requests</h3>
              <AnimatePresence>
                {guestRequests.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2"
                  >
                    {guestRequests.map((request: any) => (
                      <motion.div
                        key={request.socketId}
                        variants={itemVariants}
                        className="flex items-center justify-between bg-zinc-800 p-3 rounded-md border border-zinc-700 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.span
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-gray-300"
                          >
                            {request.username[0].toUpperCase()}
                          </motion.span>
                          <span className="text-gray-300 font-medium">
                            {request.username}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleApproveGuest(request)}
                            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                          >
                            <span>Approve</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDenyGuest(request)}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-md transition-colors duration-200 flex items-center space-x-1"
                          >
                            <span>Deny</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default LIVESTUDIO;
