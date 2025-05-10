import { useSocket } from "@/hooks/useSocket";
import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import Header from "./studio/Header";
// import StreamView from "./studio/StreamPreview";
// import ControlBar from "./studio/ControllBar";
import SourcePanel from "./studio/SourcePanel";
import Sidebar from "./studio/SideBar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as mediasoupClient from "mediasoup-client";
import toast from "react-hot-toast";

interface MediaState {
  device: mediasoupClient.types.Device | null;
  sendTransport: mediasoupClient.types.Transport | null;
  receiveTransport: mediasoupClient.types.Transport | null;
  producers: {
    [key: string]: mediasoupClient.types.Producer;
  };
  consumers: {
    [key: string]: mediasoupClient.types.Consumer;
  };
  cameraOn: boolean;
  micOn: boolean;
  screenShareOn: boolean;
  producerStreams: {
    [producerId: string]: MediaStream;
  };
  consumerStreams: {
    [consumerId: string]: MediaStream;
  };
}

interface RemoteParticipant {
  userId: string;
  role: "host" | "guest";
  username: string;
  cameraOn?: boolean;
  micOn?: boolean;
  screenShareOn?: boolean;
}

interface LIVESTUDIOProps {
  role: "host" | "guest";
  user: any;
  channelData?: any;
  streams?: any[];
  initialCameraOn?: boolean;
  initialMicOn?: boolean;
}

const StreamView: FC<{
  streamSettings: any;
  participants: RemoteParticipant[];
  currentLayout: string;
  setCurrentLayout: (layout: string) => void;
  participantStreams: {
    [userId: string]: {
      camera: MediaStream | null;
      screen: MediaStream | null;
    };
  };
}> = ({ streamSettings, participants, currentLayout, participantStreams }) => {
  const handleVideoRef = (
    element: HTMLVideoElement | null,
    stream: MediaStream
  ) => {
    console.log(stream.getTracks(), "stream in the video ref function");
    if (element && stream) {
      element.srcObject = stream;
    }
  };

  return (
    <div
      className="flex-1 p-4 overflow-auto"
      style={{ background: streamSettings.background }}
    >
      <div className="grid grid-cols-2 gap-4">
        {participants.map((participant) => {
          const cameraStream = participantStreams[participant.userId]?.camera;
          const screenStream = participantStreams[participant.userId]?.screen;
          return (
            <div key={participant.userId} className="flex flex-col gap-2">
              {cameraStream && (
                <div>
                  <p>{participant.username} (Camera)</p>
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => handleVideoRef(el, cameraStream)}
                    className="w-full h-auto bg-black rounded"
                  />
                </div>
              )}
              {screenStream && (
                <div>
                  <p>{participant.username} (Screen)</p>
                  <video
                    autoPlay
                    playsInline
                    ref={(el) => handleVideoRef(el, screenStream)}
                    className="w-full h-auto bg-black rounded"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Demo ControlBar Component
const ControlBar: FC<{
  channelId: string;
  streamerId: any;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  toggleScreenShare: () => void;
  cameraOn: boolean;
  micOn: boolean;
  screenShareOn: boolean;
}> = ({
  toggleCamera,
  toggleMicrophone,
  toggleScreenShare,
  cameraOn,
  micOn,
  screenShareOn,
}) => {
  return (
    <div className="p-4 bg-gray-800 flex gap-4">
      <Button
        onClick={toggleCamera}
        variant={cameraOn ? "destructive" : "default"}
      >
        {cameraOn ? "Stop Camera" : "Start Camera"}
      </Button>
      <Button
        onClick={toggleMicrophone}
        variant={micOn ? "destructive" : "default"}
      >
        {micOn ? "Mute Mic" : "Unmute Mic"}
      </Button>
      <Button
        onClick={toggleScreenShare}
        variant={screenShareOn ? "destructive" : "default"}
      >
        {screenShareOn ? "Stop Screen Share" : "Start Screen Share"}
      </Button>
    </div>
  );
};
const LIVESTUDIO: React.FC<LIVESTUDIOProps> = ({
  role,
  user,
  channelData,
  streams,
  initialCameraOn = false,
  initialMicOn = false,
}) => {
  const { streamingSocket, streamingSocketRef } = useSocket();
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

  const mediaState = useRef<MediaState>({
    device: null,
    sendTransport: null,
    receiveTransport: null,
    producers: {},
    consumers: {},
    cameraOn: initialCameraOn,
    micOn: initialMicOn,
    screenShareOn: false,
    producerStreams: {},
    consumerStreams: {},
  });
  const resolverRef = useRef<(id: string | null) => void>();

  // Local streams refs
  const localCameraStream = useRef<MediaStream | null>(null);
  const localMicStream = useRef<MediaStream | null>(null);
  const localScreenStream = useRef<MediaStream | null>(null);
  const [participantStreams, setParticipantStreams] = useState<{
    [userId: string]: {
      camera: MediaStream | null;
      screen: MediaStream | null;
    };
  }>({});

  // DOM refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localScreenRef = useRef<HTMLVideoElement>(null);

  // Debug state for development testing only
  const [debugMode, setDebugMode] = useState(false);

  // Initialize MediaSoup device
  const initializeDevice = async () => {
    try {
      if (!streamingSocket || !streamId) return;

      // Create a new MediaSoup device
      const device = new mediasoupClient.Device();

      // Get router RTP capabilities
      const { rtpCapabilities } = await new Promise<any>((resolve, reject) => {
        streamingSocket.emit(
          "getRtpCapabilities",
          { streamId },
          (response: any) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response);
            }
          }
        );
      });

      // Load the device with router RTP capabilities
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      mediaState.current.device = device;
      console.log("MediaSoup device initialized", mediaState.current.device);

      // Create send and receive transports
      await createSendTransport();
      await createReceiveTransport();

      // Start camera and mic if initial states are true
      if (mediaState.current.cameraOn) {
        await startCamera();
      }
      if (mediaState.current.micOn) {
        await startMicrophone();
      }
    } catch (error) {
      console.error("Failed to initialize MediaSoup device:", error);
      toast.error("Failed to initialize streaming device");
    }
  };

  // Create send transport for sending media
  const createSendTransport = async () => {
    try {
      if (!mediaState.current.device || !streamingSocket || !streamId) return;

      const transportParams = await new Promise<any>((resolve, reject) => {
        streamingSocket.emit(
          "createWebRtcTransport",
          {
            streamId,
            direction: "send",
          },
          (response: any) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response);
            }
          }
        );
      });

      const sendTransport = mediaState.current.device.createSendTransport({
        id: transportParams.id,
        iceParameters: transportParams.iceParameters,
        iceCandidates: transportParams.iceCandidates,
        dtlsParameters: transportParams.dtlsParameters,
        sctpParameters: transportParams.sctpParameters,
      });

      console.log(
        transportParams,
        "<- transport params in the sendTransport from backend"
      );
      console.log(
        sendTransport.getStats(),
        "get status of the receive transport in the function"
      );

      // Handle transport events
      sendTransport.on(
        "connect",
        async (
          {
            dtlsParameters,
          }: { dtlsParameters: mediasoupClient.types.DtlsParameters },
          callback: () => void,
          errback: (error: any) => void
        ) => {
          try {
            await new Promise<void>((resolve, reject) => {
              streamingSocket?.emit(
                "connectTransport",
                {
                  transportId: sendTransport.id,
                  dtlsParameters,
                  streamId,
                },
                (response: any) => {
                  if (response.error) {
                    reject(response.error);
                  } else {
                    resolve();
                  }
                }
              );
            });
            callback();
          } catch (error) {
            errback(error as Error);
          }
        }
      );

      sendTransport.on(
        "produce",
        async (
          {
            kind,
            rtpParameters,
            appData,
          }: {
            kind: mediasoupClient.types.MediaKind;
            rtpParameters: mediasoupClient.types.RtpParameters;
            appData: any;
          },
          callback: (options: { id: string }) => void,
          errback: (error: Error) => void
        ) => {
          try {
            const { id } = await new Promise<any>((resolve, reject) => {
              streamingSocket?.emit(
                "produce",
                {
                  streamId,
                  transportId: sendTransport.id,
                  kind,
                  rtpParameters,
                  appData,
                },
                (response: any) => {
                  if (response.error) {
                    reject(response.error);
                  } else {
                    resolve(response);
                  }
                }
              );
            });
            callback({ id });
          } catch (error) {
            errback(error as Error);
          }
        }
      );

      mediaState.current.sendTransport = sendTransport;
      console.log("Send transport created:", sendTransport.id);
    } catch (error) {
      console.error("Failed to create send transport:", error);
      toast.error("Failed to establish streaming connection");
    }
  };

  // Create receive transport for receiving media
  const createReceiveTransport = async () => {
    try {
      if (!mediaState.current.device || !streamingSocket || !streamId) return;

      const transportParams = await new Promise<any>((resolve, reject) => {
        streamingSocket.emit(
          "createWebRtcTransport",
          {
            streamId,
            direction: "recv",
          },
          (response: any) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve(response);
            }
          }
        );
      });

      console.log(
        transportParams,
        "transport params in recieveTransport from backend"
      );

      const receiveTransport = mediaState.current.device.createRecvTransport({
        id: transportParams.id,
        iceParameters: transportParams.iceParameters,
        iceCandidates: transportParams.iceCandidates,
        dtlsParameters: transportParams.dtlsParameters,
        sctpParameters: transportParams.sctpParameters,
      });

      // Handle transport connect event
      receiveTransport.on(
        "connect",
        async (
          {
            dtlsParameters,
          }: { dtlsParameters: mediasoupClient.types.DtlsParameters },
          callback: () => void,
          errback: (error: Error) => void
        ) => {
          try {
            await new Promise<void>((resolve, reject) => {
              streamingSocket?.emit(
                "connectTransport",
                {
                  transportId: receiveTransport.id,
                  dtlsParameters,
                  streamId,
                },
                (response: any) => {
                  if (response.error) {
                    reject(response.error);
                  } else {
                    resolve();
                  }
                }
              );
            });
            callback();
          } catch (error) {
            errback(error as Error);
          }
        }
      );
      console.log(
        receiveTransport.getStats(),
        "get status of the receive transport in the function"
      );

      mediaState.current.receiveTransport = receiveTransport;
      console.log("Receive transport created:", receiveTransport.id);
    } catch (error) {
      console.error("Failed to create receive transport:", error);
      toast.error("Failed to establish streaming connection");
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      console.log(
        mediaState.current.device?.canProduce("video"),
        "camera produce check",
        mediaState.current.sendTransport
      );
      if (
        !mediaState.current.device?.canProduce("video") ||
        !mediaState.current.sendTransport
      ) {
        toast.error("Cannot produce video - device not ready");
        return;
      }

      const existingProducer = mediaState.current.producers["camera"];
      console.log(existingProducer, "existingProducerrrrrrrrr");
      if (existingProducer) {
        // Get new media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });
        localCameraStream.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current
            .play()
            .catch((err) => console.error("Error playing local video:", err));
        }

        const newTrack = stream.getVideoTracks()[0];
        await existingProducer.replaceTrack({ track: newTrack });
        await existingProducer.resume();
        if (streamingSocket) {
          streamingSocket.emit(
            "resumeProducer",
            { streamId, producerId: existingProducer.id },
            (response: any) => {
              if (response.error)
                console.error(
                  "Error resuming camera producer:",
                  response.error
                );
            }
          );
        }
        mediaState.current.cameraOn = true;
        mediaState.current.producerStreams[existingProducer.id] = stream;
        console.log("Camera resumed with producer ID:", existingProducer.id);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });
        localCameraStream.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current
            .play()
            .catch((err) => console.error("Error playing local video:", err));
        }

        const track = stream.getVideoTracks()[0];
        const producer = await mediaState.current.sendTransport.produce({
          track,
          encodings: [
            { maxBitrate: 100000, scaleResolutionDownBy: 4 },
            { maxBitrate: 300000, scaleResolutionDownBy: 2 },
            { maxBitrate: 900000 },
          ],
          codecOptions: { videoGoogleStartBitrate: 1000 },
          appData: { source: "webcam", userId: user._id },
        });

        mediaState.current.producers["camera"] = producer;
        mediaState.current.producerStreams[producer.id] = stream;
        mediaState.current.cameraOn = true;

        producer.on("transportclose", () => stopCamera());
        producer.on("trackended", () => stopCamera());

        console.log("Camera started with new producer ID:", producer.id);
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      toast.error("Failed to start camera");
    }
  };

  const stopCamera = async () => {
    try {
      const producer = mediaState.current.producers["camera"];
      console.log(
        producer,
        "pausing producer in stop camera function",
        streamingSocketRef.current
      );
      if (!producer) return;

      if (!streamingSocketRef.current) {
        console.error("Streaming socket is not available in stopCamera");
        if (localCameraStream.current) {
          localCameraStream.current
            .getTracks()
            .forEach((track) => track.stop());
          localCameraStream.current = null;
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        mediaState.current.cameraOn = false;
        return;
      }
      await producer.pause();

      streamingSocketRef.current.emit(
        "pauseProducer",
        { streamId, producerId: producer.id },
        (response: any) => {
          if (response.error)
            console.error("Error pausing camera producer:", response.error);
        }
      );

      if (localCameraStream.current) {
        localCameraStream.current.getTracks().forEach((track) => track.stop());
        localCameraStream.current = null;
      }

      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      mediaState.current.cameraOn = false;
      console.log("Camera paused and tracks stopped");
    } catch (error) {
      console.error("Error pausing camera:", error);
    }
  };
  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (mediaState.current.cameraOn) await stopCamera();
    else await startCamera();
  }, []);

  // Start microphone
  const startMicrophone = async () => {
    try {
      if (
        !mediaState.current.device?.canProduce("audio") ||
        !mediaState.current.sendTransport
      ) {
        toast.error("Cannot produce audio - device not ready");
        return;
      }

      const existingProducer = mediaState.current.producers["microphone"];
      if (existingProducer) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        localMicStream.current = stream;

        const newTrack = stream.getAudioTracks()[0];
        await existingProducer.replaceTrack({ track: newTrack });
        await existingProducer.resume();
        if (streamingSocket) {
          streamingSocket.emit(
            "resumeProducer",
            { streamId, producerId: existingProducer.id },
            (response: any) => {
              if (response.error)
                console.error("Error resuming mic producer:", response.error);
            }
          );
        }

        mediaState.current.micOn = true;
        mediaState.current.producerStreams[existingProducer.id] = stream;
        console.log(
          "Microphone resumed with producer ID:",
          existingProducer.id
        );
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        localMicStream.current = stream;

        const track = stream.getAudioTracks()[0];
        const producer = await mediaState.current.sendTransport.produce({
          track,
          codecOptions: {
            opusStereo: true,
            opusDtx: true,
            opusFec: true,
            opusMaxPlaybackRate: 48000,
          },
          appData: { source: "microphone", userId: user._id },
        });

        mediaState.current.producers["microphone"] = producer;
        mediaState.current.producerStreams[producer.id] = stream;
        mediaState.current.micOn = true;

        producer.on("transportclose", () => stopMicrophone());
        producer.on("trackended", () => stopMicrophone());

        console.log("Microphone started with producer ID:", producer.id);
      }
    } catch (error) {
      console.error("Error starting microphone:", error);
      toast.error("Failed to start microphone");
    }
  };
  const stopMicrophone = async () => {
    try {
      const producer = mediaState.current.producers["microphone"];
      if (!producer || !streamingSocketRef.current) return;
      console.log(producer, "pausing producer in stop microphone function");
      await producer.pause();
      streamingSocketRef.current.emit(
        "pauseProducer",
        { streamId, producerId: producer.id },
        (response: any) => {
          if (response.error)
            console.error("Error pausing mic producer:", response.error);
        }
      );

      if (localMicStream.current) {
        localMicStream.current.getTracks().forEach((track) => track.stop());
        localMicStream.current = null;
      }

      mediaState.current.micOn = false;
      console.log("Microphone paused and tracks stopped");
    } catch (error) {
      console.error("Error pausing microphone:", error);
    }
  };
  // Toggle microphone
  const toggleMicrophone = useCallback(async () => {
    if (mediaState.current.micOn) await stopMicrophone();
    else await startMicrophone();
  }, []);
  // Start screen share
  const startScreenShare = async () => {
    try {
      if (
        !mediaState.current.device?.canProduce("video") ||
        !mediaState.current.sendTransport
      ) {
        toast.error("Cannot produce screen share - device not ready");
        return;
      }

      const existingVideoProducer = mediaState.current.producers["screen"];
      if (existingVideoProducer) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: true,
        });
        localScreenStream.current = stream;

        if (localScreenRef.current) {
          localScreenRef.current.srcObject = stream;
          localScreenRef.current
            .play()
            .catch((err) => console.error("Error playing screen share:", err));
        }

        const videoTrack = stream.getVideoTracks()[0];
        await existingVideoProducer.replaceTrack({ track: videoTrack });
        await existingVideoProducer.resume();
        if (streamingSocket) {
          streamingSocket.emit(
            "resumeProducer",
            { streamId, producerId: existingVideoProducer.id },
            (response: any) => {
              if (response.error)
                console.error(
                  "Error resuming screen producer:",
                  response.error
                );
            }
          );
        }

        const audioTrack = stream.getAudioTracks()[0];
        const existingAudioProducer =
          mediaState.current.producers["screen-audio"];
        if (audioTrack && existingAudioProducer) {
          await existingAudioProducer.replaceTrack({ track: audioTrack });
          await existingAudioProducer.resume();
          if (streamingSocket) {
            streamingSocket.emit(
              "resumeProducer",
              { streamId, producerId: existingAudioProducer.id },
              (response: any) => {
                if (response.error)
                  console.error(
                    "Error resuming screen-audio producer:",
                    response.error
                  );
              }
            );
          }
        }

        mediaState.current.screenShareOn = true;
        mediaState.current.producerStreams[existingVideoProducer.id] = stream;
        console.log(
          "Screen share resumed with producer ID:",
          existingVideoProducer.id
        );
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: "monitor",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: true,
        });
        localScreenStream.current = stream;

        if (localScreenRef.current) {
          localScreenRef.current.srcObject = stream;
          localScreenRef.current
            .play()
            .catch((err) => console.error("Error playing screen share:", err));
        }

        const videoTrack = stream.getVideoTracks()[0];
        const videoProducer = await mediaState.current.sendTransport.produce({
          track: videoTrack,
          encodings: [{ maxBitrate: 1500000 }],
          codecOptions: { videoGoogleStartBitrate: 1000 },
          appData: { source: "screen", userId: user._id },
        });

        mediaState.current.producers["screen"] = videoProducer;
        mediaState.current.producerStreams[videoProducer.id] = stream;
        mediaState.current.screenShareOn = true;

        videoProducer.on("transportclose", () => stopScreenShare());
        videoProducer.on("trackended", () => stopScreenShare());
        videoTrack.addEventListener("ended", () => stopScreenShare());

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          const audioProducer = await mediaState.current.sendTransport.produce({
            track: audioTrack,
            codecOptions: { opusStereo: true, opusDtx: true },
            appData: { source: "screen-audio", userId: user._id },
          });
          mediaState.current.producers["screen-audio"] = audioProducer;
        }

        console.log("Screen share started with producer ID:", videoProducer.id);
      }
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast.error("Failed to start screen sharing");
      mediaState.current.screenShareOn = false;
    }
  };

  const stopScreenShare = async () => {
    try {
      const videoProducer = mediaState.current.producers["screen"];
      if (videoProducer) {
        await videoProducer.pause();
        if (streamingSocketRef.current) {
          streamingSocketRef.current.emit(
            "pauseProducer",
            { streamId, producerId: videoProducer.id },
            (response: any) => {
              if (response.error)
                console.error("Error pausing screen producer:", response.error);
            }
          );
        }
      }

      const audioProducer = mediaState.current.producers["screen-audio"];
      if (audioProducer) {
        await audioProducer.pause();
        if (streamingSocket) {
          streamingSocket.emit(
            "pauseProducer",
            { streamId, producerId: audioProducer.id },
            (response: any) => {
              if (response.error)
                console.error(
                  "Error pausing screen-audio producer:",
                  response.error
                );
            }
          );
        }
      }

      if (localScreenStream.current) {
        localScreenStream.current.getTracks().forEach((track) => track.stop());
        localScreenStream.current = null;
      }

      if (localScreenRef.current) localScreenRef.current.srcObject = null;
      mediaState.current.screenShareOn = false;
      console.log("Screen share paused and tracks stopped");
    } catch (error) {
      console.error("Error pausing screen share:", error);
    }
  };

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (mediaState.current.screenShareOn) await stopScreenShare();
    else await startScreenShare();
  }, []);
  // Consume remote producer
  const consumeTrack = async (
    producerId: string,
    userId: string,
    kind: "audio" | "video",
    appData: any
  ) => {
    try {
      if (
        !mediaState.current.device ||
        !mediaState.current.device.rtpCapabilities ||
        !mediaState.current.receiveTransport ||
        !streamingSocket
      ) {
        console.log(
          "consum track states",
          mediaState.current.device,
          "<- device",
          mediaState.current.receiveTransport,
          "<-recvTransport",
          streamingSocket,
          "<-ssocket"
        );
        console.warn("Cannot consume track - device not ready");
        return;
      }

      console.log(mediaState.current.receiveTransport, "<-recvTransport");

      // Request to consume the track
      const { id, rtpParameters } = await new Promise<any>(
        (resolve, reject) => {
          streamingSocket.emit(
            "consume",
            {
              producerId,
              rtpCapabilities: mediaState.current.device!.rtpCapabilities,
            },
            (response: any) => {
              if (response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            }
          );
        }
      );

      // Create consumer
      const consumer = await mediaState.current.receiveTransport.consume({
        id,
        producerId,
        kind,
        rtpParameters,
        appData: { ...appData, userId },
      });

      // Store the consumer
      mediaState.current.consumers[consumer.id] = consumer;

      console.log(
        mediaState.current.consumers,
        "consumers in consume track function previous to resume",
        consumer,
        "from backend"
      );

      // Resume the consumer
      await new Promise<void>((resolve, reject) => {
        streamingSocket.emit(
          "resumeConsumer",
          {
            streamId,
            consumerId: consumer.id,
          },
          (response: any) => {
            if (response.error) {
              reject(response.error);
            } else {
              resolve();
            }
          }
        );
      });

      // Create a new stream from the consumer's track
      const stream = new MediaStream([consumer.track]);
      console.log(
        stream.getTracks(),
        "stream got from the backend after consuminggggggggggggg"
      );
      mediaState.current.consumerStreams[consumer.id] = stream;

      // Handle consumer events
      consumer.on("transportclose", () => {
        console.log(`Consumer ${consumer.id} transport closed`);
        delete mediaState.current.consumers[consumer.id];
        delete mediaState.current.consumerStreams[consumer.id];
      });

      consumer.on("@close", () => {
        const stream = mediaState.current.consumerStreams[consumer.id];
        if (stream) {
          setParticipantStreams((prev) => {
            const newStreams = { ...prev };
            for (const userId in newStreams) {
              if (newStreams[userId].camera === stream) {
                newStreams[userId].camera = null;
              }
              if (newStreams[userId].screen === stream) {
                newStreams[userId].screen = null;
              }
            }
            return newStreams;
          });
        }
        delete mediaState.current.consumers[consumer.id];
        delete mediaState.current.consumerStreams[consumer.id];
      });

      console.log(
        `Consuming ${kind} track from ${userId} with consumer ID ${consumer.id}`
      );

      return {
        consumerId: consumer.id,
        stream,
        kind,
        userId,
        appData,
      };
    } catch (error) {
      console.error("Error consuming track:", error);
      toast.error("Failed to receive remote stream");
      return null;
    }
  };

  // New method to handle stream settings update events
  const updateStreamSettings = useCallback(
    (settingsData: any) => {
      console.log(
        "Updating stream settings from external event:",
        settingsData
      );
      setStreamSettings((prevSettings) => ({
        ...prevSettings,
        ...settingsData,
      }));
      if (streamingSocket && streamId) {
        streamingSocket.emit("updateStreamSettings", {
          streamId,
          settings: settingsData,
        });
      }
    },
    [streamId, streamingSocket]
  );
  const handleSettingsChange = useCallback(
    (newSettings: any) => {
      const newSettingsStr = JSON.stringify(newSettings);
      const currentSettingsStr = JSON.stringify(streamSettings);
      if (newSettingsStr !== currentSettingsStr) {
        console.log("Updating stream settings in LIVESTUDIO:", newSettings);
        updateStreamSettings(newSettings);
      }
    },
    [streamSettings, updateStreamSettings]
  );

  useEffect(() => {
    if (streamingSocket && isJoined && streamId) {
      streamingSocket.emit("getStreamSettings", streamId);
    }
  }, [streamingSocket, isJoined, streamId]);

  // Initialize MediaSoup device when streamId becomes available
  useEffect(() => {
    if (streamingSocket && streamId) {
      initializeDevice();
    }

    return () => {
      // Stop all media tracks
      if (localCameraStream.current) {
        localCameraStream.current.getTracks().forEach((track) => track.stop());
      }
      if (localMicStream.current) {
        localMicStream.current.getTracks().forEach((track) => track.stop());
      }
      if (localScreenStream.current) {
        localScreenStream.current.getTracks().forEach((track) => track.stop());
      }

      // Close all producers
      Object.values(mediaState.current.producers).forEach((producer) => {
        producer.close();
      });

      // Close all consumers
      Object.values(mediaState.current.consumers).forEach((consumer) => {
        consumer.close();
      });

      // Close transports
      if (mediaState.current.sendTransport) {
        mediaState.current.sendTransport.close();
      }
      if (mediaState.current.receiveTransport) {
        mediaState.current.receiveTransport.close();
      }

      // Reset the media state
      mediaState.current = {
        device: null,
        sendTransport: null,
        receiveTransport: null,
        producers: {},
        consumers: {},
        cameraOn: false,
        micOn: false,
        screenShareOn: false,
        producerStreams: {},
        consumerStreams: {},
      };
    };
  }, [streamingSocket, streamId]);

  useEffect(() => {
    if (streamingSocket) {
      console.log("Streaming socket is connected in liveStudio");
      streamingSocket.emit("joinStudio", { role, user, channelData });

      const handleStreamUpdate = (data: any) => {
        console.log("Stream update received:", data);
        setStreamId(data?.id);
        if (resolverRef.current) {
          resolverRef.current(data?.id);
        }
        setParticipants(data?.participants || []);
        setIsJoined(true);
      };

      const handleParticipantJoined = (participant: any) => {
        console.log("Participant joined:", participant);
        setParticipants((prev) => {
          const exists = prev.some((p) => p.userId === participant.userId);
          return exists ? prev : [...prev, participant];
        });
      };
      const handleProducersList = async (producers: any[]) => {
        for (const { producerId, userId, kind, appData } of producers) {
          await consumeTrack(producerId, userId, kind, appData);
        }
      };

      const handleNewProducer = async (producer: any) => {
        const { producerId, userId, kind, appData } = producer;
        const result = await consumeTrack(producerId, userId, kind, appData);
        if (result) {
          const { stream, userId, appData } = result;
          setParticipantStreams((prev) => {
            const newStreams = { ...prev };
            if (!newStreams[userId]) {
              newStreams[userId] = { camera: null, screen: null };
            }
            if (appData.source === "webcam") {
              newStreams[userId].camera = stream;
            } else if (appData.source === "screen") {
              newStreams[userId].screen = stream;
            }
            return newStreams;
          });
        }
      };

      console.log(participants, "participants got ");

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

      streamingSocket.onAny((event: any, ...args: any[]) => {
        console.log(`EVENT RECIEVED FE EVENT NAME: ${event}`, args);
      });

      const originalEmit = streamingSocket.emit.bind(streamingSocket);
      (streamingSocket as any).emit = function <Ev extends string>(
        event: Ev,
        ...args: any[]
      ): boolean {
        console.log(`[SOCKET SEND] ${event}`, args);
        return !!originalEmit(event, ...args);
      };

      // Handle producer closed notification
      streamingSocket.on(
        "producerClosed",
        ({ producerId }: { producerId: any }) => {
          console.log(`Producer ${producerId} closed`);
          // Update UI if needed, though consumerClosed may suffice
        }
      );

      // Handle consumer closed due to producer closing
      streamingSocket.on(
        "consumerClosed",
        ({ consumerId, reason }: { consumerId: any; reason: any }) => {
          console.log(`Consumer ${consumerId} closed: ${reason}`);
          const consumer = mediaState.current.consumers[consumerId];
          if (consumer) {
            consumer.close();
            delete mediaState.current.consumers[consumerId];
            const stream = mediaState.current.consumerStreams[consumerId];
            if (stream) {
              setParticipantStreams((prev) => {
                const newStreams = { ...prev };
                for (const userId in newStreams) {
                  if (newStreams[userId].camera === stream)
                    newStreams[userId].camera = null;
                  if (newStreams[userId].screen === stream)
                    newStreams[userId].screen = null;
                }
                return newStreams;
              });
              delete mediaState.current.consumerStreams[consumerId];
            }
          }
        }
      );
      streamingSocket.on("participantLeft", ({ userId }: { userId: any }) => {
        console.log(`Participant ${userId} left`);
        setParticipantStreams((prev) => {
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        });
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));

        streamingSocket.on(
          "producerResumed",
          ({
            producerId,
            userId,
            appData,
          }: {
            producerId: any;
            userId: any;
            appData: any;
          }) => {
            console.log(`Producer ${producerId} resumed for user ${userId}`);
            if (appData.source === "webcam") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, cameraOn: true } : p
                )
              );
            } else if (appData.source === "microphone") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, micOn: true } : p
                )
              );
            } else if (appData.source === "screen") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, screenShareOn: true } : p
                )
              );
            }
          }
        );

        streamingSocket.on(
          "producerResumed",
          ({
            producerId,
            userId,
            appData,
          }: {
            producerId: any;
            userId: any;
            appData: any;
          }) => {
            console.log(`Producer ${producerId} resumed for user ${userId}`);
            if (appData.source === "webcam") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, cameraOn: true } : p
                )
              );
            } else if (appData.source === "microphone") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, micOn: true } : p
                )
              );
            } else if (appData.source === "screen") {
              setParticipants((prev) =>
                prev.map((p) =>
                  p.userId === userId ? { ...p, screenShareOn: true } : p
                )
              );
            }
          }
        );
      });
      streamingSocket.on("streamUpdate", handleStreamUpdate);
      streamingSocket.on("streamSettings", handleStreamSettings);
      streamingSocket.on("producersList", handleProducersList);
      streamingSocket.on("newProducer", handleNewProducer);
      streamingSocket.on("error", handleError);
      streamingSocket.on("guestRequest", handleGuestRequest);
      streamingSocket.on("participantJoined", handleParticipantJoined);

      return () => {
        streamingSocket.off("streamUpdate", handleStreamUpdate);
        streamingSocket.off("participantJoined", handleParticipantJoined);
        streamingSocket.off("streamSettings", handleStreamSettings);
        streamingSocket.off("error", handleError);
        streamingSocket.off("producersList", handleProducersList);
        streamingSocket.off("newProducer", handleNewProducer);
        streamingSocket.off("guestRequest", handleGuestRequest);
      };
    }
  }, [streamingSocket, role, user, channelData]);

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
                participantStreams={participantStreams}
              />
              <ControlBar
                channelId={channelData._id}
                streamerId={channelOwner}
                toggleCamera={toggleCamera}
                toggleMicrophone={toggleMicrophone}
                toggleScreenShare={toggleScreenShare}
                cameraOn={mediaState.current.cameraOn}
                micOn={mediaState.current.micOn}
                screenShareOn={mediaState.current.screenShareOn}
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
