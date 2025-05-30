"use client";

import localFont from "next/font/local";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { PersistGate } from "redux-persist/integration/react";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { SocketProvider } from "./context/SocketContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "green",
                color: "white",
              },
            },
            error: {
              style: {
                background: "red",
                color: "white",
              },
            },
          }}
        />
        <SocketProvider>
          <Provider store={store}>
            <Theme
              accentColor="crimson"
              grayColor="sand"
              radius="large"
              scaling="95%"
            >
              {children}
            </Theme>
          </Provider>
        </SocketProvider>
      </body>
    </html>
  );
}
