import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface SocketHook {
  authSocket: Socket | null;
  communitySocket: Socket | null;
  streamingSocket: Socket | any;
}

export const useSocket = () => {
  const [sockets, setSockets] = useState<SocketHook>({
    authSocket: null,
    communitySocket: null,
    streamingSocket: null,
  });

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

    authSocket.on("connect_error", (error) => {
      console.error("Auth Socket connection error:", error);
    });

    communitySocket.on("connect_error", (error) => {
      console.error("Community Socket connection error:", error);
    });

    authSocket.on("connect", () => {
      console.log("authSocket connected");
      authSocket.emit("message", "Hello Auth Server");
    });

    authSocket.on("response", (data) => {
      console.log("Auth Server response:", data);
    });

    communitySocket.on("connect", () => {
      console.log("communitySocket connected");
      communitySocket.emit("message", "Hello Community Server");
    });

    communitySocket.on("response", (data) => {
      console.log("Community Server response:", data);
    });

    streamingSocket.on("connect", () => {
      console.log("communitySocket connected");
      communitySocket.emit("message", "Hello Community Server");
    });

    streamingSocket.on("response", (data) => {
      console.log("Community Server response:", data);
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
    };
  }, []);

  return sockets;
};
