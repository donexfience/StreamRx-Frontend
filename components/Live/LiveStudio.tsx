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
import * as mediasoup from "mediasoup-client";
import { Producer } from "mediasoup-client/lib/types";
import { Device } from "mediasoup-client";

interface LIVESTUDIOProps {
  role: "host" | "guest";
  user: any;
  channelData?: any;
  streams?: any[];
  initialCameraOn?: boolean;
  initialMicOn?: boolean;
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
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentLayout, setCurrentLayout] = useState<string>("grid-4");
  const localUserId = user._id;

  //mediasoup related states
  const [device, setDevice] = useState<mediasoup.Device | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);
  const [localProducers, setLocalProducers] = useState<Producer[]>([]);
  const [localTracks, setLocalTracks] = useState<{
    webcam?: MediaStreamTrack;
    microphone?: MediaStreamTrack;
    screen?: MediaStreamTrack;
  }>({});
  const [isCameraOn, setIsCameraOn] = useState(initialCameraOn);
  const [isMicOn, setIsMicOn] = useState(initialMicOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [transportsReady, setTransportsReady] = useState(false);
  const [pendingProducers, setPendingProducers] = useState<
    Array<{ producerId: string; producerUserId: string }>
  >([]);

  // Use ref to track transport readiness state reliably
  const transportsReadyRef = useRef(false);

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
    if (streamingSocket && isJoined && streamId && !device) {
      streamingSocket.emit("getMediasoupConfig", (response: any) => {
        if (response.error) {
          console.error(response.error);
          return;
        }
        const { routerRtpCapabilities } = response;
        const newDevice = new Device();
        newDevice
          .load({ routerRtpCapabilities })
          .then(() => {
            setDevice(newDevice);
            deviceRef.current = newDevice;
          })
          .catch((err) => console.error("Device load error:", err));
      });
    }
  }, [streamingSocket, isJoined, streamId, device]);

  // Create transports
  useEffect(() => {
    if (device && streamingSocket) {
      const createTransport = async (
        direction: "send" | "recv",
        setter: (t: any) => void
      ) => {
        return new Promise<void>((resolve) => {
          streamingSocket.emit(
            "createTransport",
            direction,
            (transportOptions: any) => {
              if (transportOptions.error) {
                console.error(transportOptions.error);
                resolve();
                return;
              }
              const transport =
                direction === "send"
                  ? device.createSendTransport(transportOptions)
                  : device.createRecvTransport(transportOptions);

              // Event handlers remain the same
              transport.on(
                "connect",
                ({ dtlsParameters }, callback, errback) => {
                  streamingSocket.emit(
                    "connectTransport",
                    { transportId: transport.id, dtlsParameters },
                    (response: any) => {
                      if (response.error) errback(response.error);
                      else callback();
                    }
                  );
                }
              );

              if (direction === "send") {
                transport.on(
                  "produce",
                  ({ kind, rtpParameters, appData }, callback, errback) => {
                    streamingSocket.emit(
                      "produce",
                      {
                        transportId: transport.id,
                        kind,
                        rtpParameters,
                        appData,
                      },
                      (response: any) => {
                        if (response.error) errback(response.error);
                        else callback({ id: response.id });
                      }
                    );
                  }
                );
              }

              if (direction === "send") {
                sendTransportRef.current = transport;
              } else {
                recvTransportRef.current = transport;
              }
              console.log(`${direction} transport created:`, transport.id);
              resolve();
            }
          );
        });
      };

      const setupTransports = async () => {
        try {
          await createTransport("send", sendTransportRef.current);
          await createTransport("recv", recvTransportRef.current);
          setTransportsReady(true);
          transportsReadyRef.current = true;
          console.log("Both transports created");

          // Process pending producers immediately using refs
          if (pendingProducers.length > 0) {
            console.log(
              "Processing pending producers:",
              pendingProducers.length
            );
            const producersToProcess = [...pendingProducers];
            setPendingProducers([]);
            producersToProcess.forEach(({ producerId, producerUserId }) => {
              consumeProducerInternal(producerId, producerUserId);
            });
          }
        } catch (error) {
          console.error("Error setting up transports:", error);
        }
      };
      setupTransports();
    }
  }, [device, streamingSocket, pendingProducers, transportsReadyRef]);

  const consumeProducerInternal = async (
    producerId: string,
    producerUserId: string
  ) => {
    console.log(
      `consumeProducerInternal called with producerId: ${producerId}, producerUserId: ${producerUserId}`
    );

    if (!streamingSocket || !streamingSocket.connected) {
      console.error("Socket is not connected or undefined");
      return;
    }

    const transport = recvTransportRef.current;
    if (!deviceRef.current || !transport) {
      console.log(device, transport, "device or transport is not ready");
      console.error("Missing required objects: device or transport");
      return;
    }

    console.log(
      `Emitting 'consume' with transportId: ${transport.id}, producerId: ${producerId}, rtpCapabilities:`,
      deviceRef.current.rtpCapabilities
    );

    streamingSocket.emit(
      "consume",
      {
        transportId: transport.id,
        producerId,
        rtpCapabilities: deviceRef.current.rtpCapabilities,
      },
      async (response: any) => {
        console.log("Received consume response:", response);
        if (!response) {
          console.error("No response received from consume event");
          return;
        }
        if (response.error) {
          console.error("Error from consume:", response.error);
          return;
        }
        console.log(
          "Consumer created with id:",
          response.id,
          "kind:",
          response.kind
        );

        try {
          const consumer = await transport.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters,
            appData: response.appData || { type: "unknown" },
          });

          console.log("Consumer object:", consumer);

          streamingSocket.emit(
            "resumeConsumer",
            consumer.id,
            (resumeResponse: any) => {
              console.log("Consumer resumed, response:", resumeResponse);
              if (resumeResponse && resumeResponse.success) {
                console.log(`Consumer ${consumer.id} resumed successfully`);
              } else if (resumeResponse && resumeResponse.error) {
                console.error(
                  "Failed to resume consumer:",
                  resumeResponse.error
                );
              } else {
                console.warn("Unexpected resume response:", resumeResponse);
              }
            }
          );

          const track = consumer.track;
          console.log("Consumer track:", track);
          console.log(
            `Track state: muted=${track.muted}, enabled=${track.enabled}, readyState=${track.readyState}`
          );

          //  Attach the track immediately to a MediaStream**
          const mediaStream = new MediaStream([track]);

          //  Update participants with the track and handle muted state**
          setParticipants((prev) => {
            const newParticipants = [...prev];
            const idx = newParticipants.findIndex(
              (p) => p.userId === producerUserId
            );
            if (idx !== -1) {
              const participant = { ...newParticipants[idx] };
              participant.consumers = [
                ...participant.consumers,
                {
                  id: consumer.id,
                  producerId,
                  track,
                  type:
                    consumer.appData?.type ||
                    response.appData?.type ||
                    "unknown",
                },
              ];
              newParticipants[idx] = participant;
            } else {
              newParticipants.push({
                userId: producerUserId,
                consumers: [
                  {
                    id: consumer.id,
                    producerId,
                    track,
                    type:
                      consumer.appData?.type ||
                      response.appData?.type ||
                      "unknown",
                  },
                ],
              });
            }
            return newParticipants;
          });

          // **Change 3: Handle the muted state with an unmute event listener**
          if (track.muted) {
            console.log(
              `Track ${track.id} is initially muted, waiting for unmute`
            );
            const onUnmute = () => {
              console.log(`Track ${track.id} unmuted`);
              // Optionally, trigger a re-render or state update if needed
              track.removeEventListener("unmute", onUnmute);
            };
            track.addEventListener("unmute", onUnmute);
          } else {
            console.log(`Track ${track.id} is already unmuted and ready`);
          }

          // Ensure the track is live and log its state
          if (track.readyState === "live") {
            console.log(`Track ${track.id} is live and should be rendering`);
          }
        } catch (error) {
          console.error("Error creating consumer:", error);
        }
      }
    );
  };
  // Main consume function that checks readiness or queues for later
  const consumeProducer = async (
    producerId: string,
    producerUserId: string
  ) => {
    if (!recvTransportRef.current) {
      console.warn("Recv transport not ready, queuing producer");
      setPendingProducers((prev) => [...prev, { producerId, producerUserId }]);
      return;
    }
    consumeProducerInternal(producerId, producerUserId);
  };

  // Media control functions
  const enableCamera = async () => {
    if (!device || !sendTransportRef.current || !streamingSocket) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = stream.getVideoTracks()[0];
    const producer = await sendTransportRef.current.produce({
      track,
      appData: { type: "webcam" },
    });
    setLocalProducers((prev) => [...prev, producer]);
    setLocalTracks((prev) => ({ ...prev, webcam: track }));
    setIsCameraOn(true);
  };
  const disableCamera = () => {
    const producer = localProducers.find((p) => p.appData.type === "webcam");
    if (producer) {
      producer.close();
      if (producer.track) producer.track.stop();
      streamingSocket?.emit("closeProducer", { producerId: producer.id });
      setLocalProducers((prev) => prev.filter((p) => p.id !== producer.id));
      setLocalTracks((prev) => ({ ...prev, webcam: undefined }));
      setIsCameraOn(false);
    }
  };

  const enableMicrophone = async () => {
    if (!device || !sendTransportRef.current || !streamingSocket) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const track = stream.getAudioTracks()[0];
    const producer = await sendTransportRef.current.produce({
      track,
      appData: { type: "microphone" },
    });
    setLocalProducers((prev) => [...prev, producer]);
    setLocalTracks((prev) => ({ ...prev, microphone: track }));
    setIsMicOn(true);
  };

  const disableMicrophone = () => {
    const producer = localProducers.find(
      (p) => p.appData.type === "microphone"
    );
    if (producer) {
      producer.close();
      if (producer.track) {
        producer.track.stop();
        streamingSocket?.emit("closeProducer", { producerId: producer.id });
        setLocalProducers((prev) => prev.filter((p) => p.id !== producer.id));
        setLocalTracks((prev) => ({ ...prev, microphone: undefined }));
        setIsMicOn(false);
      }
    }
  };

  const startScreenSharing = async () => {
    if (!device || !sendTransportRef.current || !streamingSocket) return;
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const track = stream.getVideoTracks()[0];
    track.onended = stopScreenSharing;
    const producer = await sendTransportRef.current.produce({
      track,
      appData: { type: "screen" },
    });
    setLocalProducers((prev) => [...prev, producer]);
    setLocalTracks((prev) => ({ ...prev, screen: track }));
    setIsScreenSharing(true);
  };

  const stopScreenSharing = () => {
    const producer = localProducers.find((p) => p.appData.type === "screen");
    if (producer) {
      producer.close();
      if (producer && producer.track) {
        producer.track.stop();
        streamingSocket?.emit("closeProducer", { producerId: producer.id });
        setLocalProducers((prev) => prev.filter((p) => p.id !== producer.id));
        setLocalTracks((prev) => ({ ...prev, screen: undefined }));
        setIsScreenSharing(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      localProducers.forEach((producer) => {
        if (producer.track) {
          producer.track.stop();
        }
        streamingSocket?.emit("closeProducer", { producerId: producer.id });
      });
    };
  }, [localProducers, streamingSocket]);

  useEffect(() => {
    if (streamingSocket) {
      console.log("Streaming socket is connected in liveStudio");

      streamingSocket.emit("joinStudio", { role, user, channelData });
      const handleStreamUpdate = (data: any) => {
        console.log("Stream update received:", data);
        setStreamId(data?.id);
        setParticipants(
          (data?.participants || []).map((p: any) => ({
            ...p,
            consumers: p.consumers || [],
          }))
        );
        setIsJoined(true);
      };
      const handleParticipantJoined = (participant: any) => {
        console.log("Participant joined:", participant);
        setParticipants((prev) => {
          const exists = prev.some((p) => p.userId === participant.userId);
          if (!exists) {
            return [
              ...prev,
              { ...participant, consumers: participant.consumers || [] },
            ];
          }
          return prev;
        });
      };

      console.log(participants, "participants got ");

      const handleExistingProducers = (
        producers: Array<{ producerId: string; producerUserId: string }>
      ) => {
        console.log("Received existing producers:", producers);
        producers.forEach(({ producerId, producerUserId }) => {
          if (producerUserId !== localUserId) {
            consumeProducer(producerId, producerUserId);
          }
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

      const handleNewProducer = ({
        producerId,
        producerUserId,
      }: {
        producerId: string;
        producerUserId: string;
      }) => {
        if (producerUserId !== localUserId) {
          console.log(
            "New producer added: event got from backend",
            producerId,
            producerUserId
          );
          consumeProducer(producerId, producerUserId);
        }
      };

      const handleProducerClosed = ({ producerId }: { producerId: string }) => {
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            consumers: p.consumers.filter(
              (c: any) => c.producerId !== producerId
            ),
          }))
        );
      };

      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);
      streamingSocket.on("error", handleError);
      streamingSocket.on("guestRequest", handleGuestRequest);
      streamingSocket.on("participantJoined", handleParticipantJoined);
      streamingSocket.on("newProducer", handleNewProducer);
      streamingSocket.on("producerClosed", handleProducerClosed);
      streamingSocket.on("existingProducers", handleExistingProducers);

      return () => {
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("participantJoined", handleParticipantJoined);
        streamingSocket.off("streamSettings", handleStreamSettings);
        streamingSocket.off("error", handleError);
        streamingSocket.off("newProducer", handleNewProducer);
        streamingSocket.off("producerClosed", handleProducerClosed);
        streamingSocket.off("guestRequest", handleGuestRequest);
        streamingSocket.off("existingProducers", handleExistingProducers);
      };
    }
  }, [
    streamingSocket,
    role,
    user,
    channelData,
    handleSettingsChange,
    localUserId,
  ]);

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
                participants={participants}
                currentLayout={currentLayout}
                setCurrentLayout={setCurrentLayout}
                localuserId={localUserId}
                localTracks={localTracks}
              />
              <ControlBar
                channelId={channelData._id}
                streamerId={channelData.ownerId}
                isCameraOn={isCameraOn}
                toggleCamera={() =>
                  isCameraOn ? disableCamera() : enableCamera()
                }
                isMicOn={isMicOn}
                toggleMicrophone={() =>
                  isMicOn ? disableMicrophone() : enableMicrophone()
                }
                isScreenSharing={isScreenSharing}
                toggleScreenSharing={() =>
                  isScreenSharing ? stopScreenSharing() : startScreenSharing()
                }
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
