// app/viewer/layout.tsx
import ViewerHead from "@/components/viewer-main/ViewerHead";
import ViewerNavbar from "@/components/viewer-main/ViewerNavbar";
import React from "react";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-950">
      <ViewerHead />
      <div className="flex flex-1">
        <ViewerNavbar />
        {children}
      </div>
    </div>
  );
}



