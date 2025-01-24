// context/SocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useRouter } from "next/navigation";
import { checkBlockedUser, clearAuthCookie } from "../lib/action/auth";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  useEffect(() => {
    const socket = io("http://localhost:8000", {
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      timeout: 5000,
    });

    // Handle user-blocked event
    socket.on(
      "user-blocked",
      async (data: { email: string; value: boolean }) => {
        console.log("data got through the socket", data);
        console.log(data.value, "value got ");
        if (!data.value) {
          const { isBlocked } = await checkBlockedUser(data.email);
          console.log(isBlocked, "block status");
          if (isBlocked) {
            // Clear tokens
            await clearAuthCookie("accessToken");
            await clearAuthCookie("refreshToken");
            router.push("/sign-in/viewer");
          }
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: null }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
