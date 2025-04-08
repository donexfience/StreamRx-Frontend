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
  userId?: string;
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

  // Create send transport - Fixed to match the SocketService implementation
  const createSendTransport = async () => {
    if (!streamingSocket || !deviceRef.current) return;

    try {
      const transportOptions = await new Promise<any>((resolve, reject) => {
        streamingSocket.emit(
          "createTransport",
          { direction: "send" },
          (response: any) => {
            if (response.error) reject(response.error);
            else resolve(response);
          }
        );
      });

      const transport = deviceRef.current.createSendTransport(transportOptions);

      transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await new Promise<void>((resolve, reject) => {
            streamingSocket.emit(
              "connectTransport",
              {
                transportId: transport.id,
                dtlsParameters,
              },
              (response?: any) => {
                if (response?.error) reject(response.error);
                else resolve();
              }
            );
          });
          callback();
        } catch (error:any) {
          errback(error);
        }
      });

      transport.on(
        "produce",
        async ({ kind, rtpParameters }, callback, errback) => {
          try {
            const { id, error } = await new Promise<any>((resolve) => {
              streamingSocket.emit(
                "produce",
                {
                  transportId: transport.id,
                  kind,
                  rtpParameters,
                },
                resolve
              );
            });

            if (error) {
              errback(error);
              return;
            }

            callback({ id });
          } catch (error:any) {
            errback(error);
          }
        }
      );

      sendTransportRef.current = transport;
    } catch (error) {
      console.error("Failed to create send transport:", error);
      setErrorMessage("Failed to create send transport");
    }
  };

  // Create receive transport - Fixed to match the SocketService implementation
  const createRecvTransport = async () => {
    if (!streamingSocket || !deviceRef.current) return;

    try {
      const transportOptions = await new Promise<any>((resolve, reject) => {
        streamingSocket.emit(
          "createTransport",
          { direction: "recv" },
          (response: any) => {
            if (response.error) reject(response.error);
            else resolve(response);
          }
        );
      });

      const transport = deviceRef.current.createRecvTransport(transportOptions);

      transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await new Promise<void>((resolve, reject) => {
            streamingSocket.emit(
              "connectTransport",
              {
                transportId: transport.id,
                dtlsParameters,
              },
              (response?: any) => {
                if (response?.error) reject(response.error);
                else resolve();
              }
            );
          });
          callback();
        } catch (error:any) {
          errback(error);
        }
      });

      recvTransportRef.current = transport;
    } catch (error) {
      console.error("Failed to create receive transport:", error);
      setErrorMessage("Failed to create receive transport");
    }
  };

  useEffect(() => {
    if (streamingSocket) {
      console.log("Streaming socket is connected in liveStudio");

      // Join studio
      streamingSocket.emit("joinStudio", { role, user, channelData });

      const handleRouterRtpCapabilities = async (rtpCapabilities: any) => {
        try {
          const device = new Device();
          await device.load({ routerRtpCapabilities: rtpCapabilities });
          deviceRef.current = device;

          await createSendTransport();
          await createRecvTransport();

          setIsJoined(true);

          // Handle initial media states after setup
          if (initialCameraOn) enableCamera();
          if (initialMicOn) enableMicrophone();
        } catch (error) {
          console.error("Error setting up device:", error);
          setErrorMessage("Failed to set up streaming device.");
        }
      };

      const handleStreamUpdate = (data: any) => {
        console.log("Stream update:", data);
        setStreamId(data?.id);
      };

      const handleParticipantJoined = (participant: any) => {
        console.log("Participant joined:", participant);
        setParticipants((prev) => {
          const updated = new Map(prev);
          if (!updated.has(participant.socketId)) {
            updated.set(participant.socketId, {
              socketId: participant.socketId,
              userId: participant.userId,
              role: participant.role,
              username: participant.username,
              consumers: [],
            });
          } else {
            const existing = updated.get(participant.socketId)!;
            updated.set(participant.socketId, {
              ...existing,
              userId: participant.userId,
              role: participant.role,
              username: participant.username,
            });
          }
          return updated;
        });
      };

      const handleNewProducer = async (data: any) => {
        const { producerId, producerSocketId, userId, role, username } = data;

        setParticipants((prev) => {
          const updated = new Map(prev);
          if (!updated.has(producerSocketId)) {
            updated.set(producerSocketId, {
              socketId: producerSocketId,
              userId: userId,
              role: role,
              username: username,
              consumers: [],
            });
          }
          return updated;
        });

        await consumeProducer(producerId, producerSocketId, userId);
      };

      const handleProducerClosed = ({ producerId }: any) => {
        removeConsumerByProducerId(producerId);
      };

      const handleParticipantLeft = ({ socketId, userId }: any) => {
        console.log(`Participant left: ${userId} (Socket: ${socketId})`);
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
        setErrorMessage(error.message || "An error occurred");
      };

      const handleGuestRequest = (request: any) => {
        console.log("Guest request received:", request);
        if (role === "host") {
          // Prevent duplicate requests
          setGuestRequests((prev) => {
            const exists = prev.some((r) => r.socketId === request.socketId);
            if (exists) return prev;
            return [...prev, request];
          });
        }
      };

      const handleJoinApproved = ({ streamId, reconnected }: any) => {
        console.log(
          `Join approved for stream ${streamId}, reconnected: ${reconnected}`
        );
        setStreamId(streamId);
      };

      const handleJoinDenied = (data: any) => {
        console.log("Join denied:", data);
        setErrorMessage(data.message || "Your request to join was denied");
      };

      // Setup event listeners
      streamingSocket.on("routerRtpCapabilities", handleRouterRtpCapabilities);
      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);
      streamingSocket.on("error", handleError);
      streamingSocket.on("newProducer", handleNewProducer);
      streamingSocket.on("producerClosed", handleProducerClosed);
      streamingSocket.on("participantLeft", handleParticipantLeft);
      streamingSocket.on("participantJoined", handleParticipantJoined);
      streamingSocket.on("guestRequest", handleGuestRequest);
      streamingSocket.on("joinApproved", handleJoinApproved);
      streamingSocket.on("joinDenied", handleJoinDenied);

      if (streamId) {
        streamingSocket.emit("getStreamSettings", streamId);
      }

      // Cleanup function
      return () => {
        closeAllProducers();
        streamingSocket.off(
          "routerRtpCapabilities",
          handleRouterRtpCapabilities
        );
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("streamSettings", handleStreamSettings);
        streamingSocket.off("error", handleError);
        streamingSocket.off("newProducer", handleNewProducer);
        streamingSocket.off("producerClosed", handleProducerClosed);
        streamingSocket.off("participantLeft", handleParticipantLeft);
        streamingSocket.off("participantJoined", handleParticipantJoined);
        streamingSocket.off("guestRequest", handleGuestRequest);
        streamingSocket.off("joinApproved", handleJoinApproved);
        streamingSocket.off("joinDenied", handleJoinDenied);
      };
    }
  }, [streamingSocket, role, user, channelData, initialCameraOn, initialMicOn]);

  useEffect(() => {
    if (streamingSocket && streamId) {
      streamingSocket.emit("getStreamSettings", streamId);
    }
  }, [streamingSocket, streamId]);

  const enableCamera = async () => {
    try {
      console.log(
        "Enabling camera...",
        deviceRef.current?.canProduce("video"),
        sendTransportRef.current,
        "sendTransportRef.current?.id",
        sendTransportRef.current?.id
      );

      if (
        !deviceRef.current?.canProduce("video") ||
        !sendTransportRef.current
      ) {
        console.warn("Cannot produce video or send transport not ready");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const track = stream.getVideoTracks()[0];
      const producer = await sendTransportRef.current.produce({
        track,
        encodings: [
          { maxBitrate: 500000, scaleResolutionDownBy: 2 },
          { maxBitrate: 1000000, scaleResolutionDownBy: 1 },
        ],
        codecOptions: {
          videoGoogleStartBitrate: 1000,
        },
      });

      setProducers((prev) => [
        ...prev,
        { id: producer.id, track, type: "webcam" },
      ]);

      setIsCameraOn(true);
    } catch (error) {
      console.error("Error enabling camera:", error);
      setErrorMessage("Failed to enable camera. Please check permissions.");
    }
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
    try {
      if (
        !deviceRef.current?.canProduce("audio") ||
        !sendTransportRef.current
      ) {
        console.warn("Cannot produce audio or send transport not ready");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const track = stream.getAudioTracks()[0];
      const producer = await sendTransportRef.current.produce({
        track,
        codecOptions: {
          opusStereo: true,
          opusDtx: true,
          opusFec: true,
          opusMaxPlaybackRate: 48000,
        },
      });

      setProducers((prev) => [
        ...prev,
        { id: producer.id, track, type: "microphone" },
      ]);

      setIsMicOn(true);
    } catch (error) {
      console.error("Error enabling microphone:", error);
      setErrorMessage("Failed to enable microphone. Please check permissions.");
    }
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
    try {
      if (
        !deviceRef.current?.canProduce("video") ||
        !sendTransportRef.current
      ) {
        console.warn("Cannot produce video or send transport not ready");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "screen",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
        },
      });

      const track = stream.getVideoTracks()[0];

      // Handle the user ending screen sharing through the browser UI
      track.addEventListener("ended", stopScreenSharing);

      const producer = await sendTransportRef.current.produce({
        track,
        encodings: [{ maxBitrate: 1500000, scaleResolutionDownBy: 1 }],
        appData: { mediaType: "screen" },
      });

      setProducers((prev) => [
        ...prev,
        { id: producer.id, track, type: "screen" },
      ]);

      setIsScreenSharing(true);
    } catch (error) {
      console.error("Error starting screen sharing:", error);
      setErrorMessage("Failed to start screen sharing. Please try again.");
    }
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
    producerSocketId: string,
    producerUserId?: string
  ) => {
    if (!recvTransportRef.current || !deviceRef.current) {
      console.warn("Receive transport or device not ready");
      return;
    }

    try {
      const { id, kind, rtpParameters, error } = await new Promise<any>(
        (resolve) => {
          streamingSocket.emit(
            "consume",
            {
              transportId: recvTransportRef.current.id,
              producerId,
              rtpCapabilities: deviceRef.current?.rtpCapabilities || null,
            },
            resolve
          );
        }
      );

      if (error) {
        console.error("Error consuming producer:", error);
        return;
      }

      const consumer = await recvTransportRef.current.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });

      // Resume the consumer to start receiving media
      await new Promise<void>((resolve, reject) => {
        streamingSocket.emit(
          "resumeConsumer",
          consumer.id,
          (response?: any) => {
            if (response?.error) reject(response.error);
            else resolve();
          }
        );
      });

      const newConsumer: Consumer = {
        id: consumer.id,
        producerId,
        consumer,
        track: consumer.track,
        producerSocketId,
        userId: producerUserId,
      };

      setParticipants((prev) => {
        const updated = new Map(prev);
        const participant = updated.get(producerSocketId);

        if (participant) {
          // Add consumer to existing participant
          participant.consumers = [...participant.consumers, newConsumer];
          updated.set(producerSocketId, participant);
        } else {
          // Create new participant if we don't have it yet
          updated.set(producerSocketId, {
            socketId: producerSocketId,
            consumers: [newConsumer],
            userId: producerUserId,
          });
          console.log(`Created new participant for socket ${producerSocketId}`);
        }

        return updated;
      });
    } catch (error) {
      console.error("Error consuming producer:", error);
    }
  };

  const removeConsumerByProducerId = (producerId: string) => {
    setParticipants((prev) => {
      const updated = new Map(prev);

      updated.forEach((participant, socketId) => {
        const consumerIndex = participant.consumers.findIndex(
          (c) => c.producerId === producerId
        );

        if (consumerIndex !== -1) {
          const consumer = participant.consumers[consumerIndex];
          consumer.consumer.close();

          // Update consumer list
          const updatedConsumers = [...participant.consumers];
          updatedConsumers.splice(consumerIndex, 1);

          // Update participant or remove if no consumers left
          if (updatedConsumers.length > 0) {
            participant.consumers = updatedConsumers;
            updated.set(socketId, participant);
          } else {
            // We don't remove participants without consumers - they might just have their camera/mic off
            participant.consumers = [];
            updated.set(socketId, participant);
          }
        }
      });

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

  // Updated approve guest handler to match socket service
  const handleApproveGuest = async (request: any) => {
    if (streamingSocket && role === "host") {
      try {
        await new Promise<void>((resolve, reject) => {
          streamingSocket.emit(
            "approveGuest",
            {
              token: request.token,
              username: request.username,
              channelId: request.channelId,
              socketId: request.socketId,
              approverId: user._id,
            },
            (response?: any) => {
              if (response?.error) {
                setErrorMessage(response.error);
                reject(response.error);
              } else {
                resolve();
              }
            }
          );
        });

        // Remove the request from the list
        setGuestRequests((prev) =>
          prev.filter((r) => r.socketId !== request.socketId)
        );
      } catch (error) {
        console.error("Error approving guest:", error);
      }
    }
  };

  const handleDenyGuest = (request: any) => {
    if (streamingSocket && role === "host") {
      streamingSocket.emit("denyGuest", {
        socketId: request.socketId,
        approverId: user._id,
        channelId: request.channelId,
      });

      // Remove the request from the list
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

  // Display error message if present
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a172b] text-white">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p>{errorMessage}</p>
          <Button
            className="mt-4 bg-white/10 hover:bg-white/20"
            onClick={() => setErrorMessage("")}
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

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
                localUserId={localUserId}
              />
              <ControlBar
                channelId={channelData._id}
                streamerId={channelData.ownerId}
                toggleCamera={() =>
                  isCameraOn ? disableCamera() : enableCamera()
                }
                toggleMicrophone={() =>
                  isMicOn ? disableMicrophone() : enableMicrophone()
                }
                toggleScreenSharing={() =>
                  isScreenSharing ? stopScreenSharing() : startScreenSharing()
                }
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
                            {request.username
                              ? request.username[0].toUpperCase()
                              : "?"}
                          </motion.span>
                          <span className="text-gray-300 font-medium">
                            {request.username || "Guest"}
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
