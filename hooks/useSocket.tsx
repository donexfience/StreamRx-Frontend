import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

interface SocketHook {
  authSocket: Socket | null;
}

export const useSocket = () => {
  const [sockets, setSockets] = useState<SocketHook>({
    authSocket: null,
  });

  useEffect(() => {
    const authSocket = io("http://localhost:8000", {
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      timeout: 5000,
    });
    authSocket.on("connect", () => {
      console.log("Socket connected");
      authSocket.emit("message", "Hello Server");
    });

    authSocket.on("response", (data) => {
      console.log("Server response:", data);
    });
    setSockets({ authSocket });

    // Cleanup on unmount
    return () => {
      authSocket.disconnect();
    };
  }, []);

  return sockets;
};
