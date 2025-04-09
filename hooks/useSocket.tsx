import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface SocketHook {
  authSocket: Socket | null;
  communitySocket: Socket | null;
  streamingSocket: Socket | null;
}

export const useSocket = () => {
  const [sockets, setSockets] = useState<SocketHook>({
    authSocket: null,
    communitySocket: null,
    streamingSocket: null,
  });
  const streamingSocketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const authSocket = io(
      process.env._AUTH_SERVICE_URL || "http://localhost:8000",
      {
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      }
    );

    const communitySocket = io(
      process.env.COMMUNITY_SERVICE_URL || "http://localhost:3009",
      {
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      }
    );

    const streamingSocket = io(
      process.env.STREAMING_SERVICE_URL || "http://localhost:3011",
      {
        transports: ["websocket", "polling"],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      }
    );

    streamingSocketRef.current = streamingSocket;

    // Socket event handlers
    authSocket.on("connect", () => {
      console.log("authSocket connected");
      authSocket.emit("message", "Hello Auth Server");
    });

    communitySocket.on("connect", () => {
      console.log("communitySocket connected");
      communitySocket.emit("message", "Hello Community Server");
    });

    streamingSocket.on("connect", () => {
      console.log("streamingSocket connected");
      streamingSocket.emit("message", "Hello Streaming Server");
    });

    streamingSocket.on("disconnect", () => {
      console.log("streamingSocket disconnected");
    });

    setSockets({
      authSocket,
      communitySocket,
      streamingSocket,
    });

    return () => {
      authSocket.disconnect();
      communitySocket.disconnect();
      streamingSocket.disconnect();
      streamingSocketRef.current = null;
    };
  }, []);

  return { ...sockets, streamingSocketRef };
};
