"use client";
import { store } from "@/redux/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <SessionProvider>
      <Provider store={store}>{children}</Provider>
    // </SessionProvider>
  );
}
