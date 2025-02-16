"use client";

import ViewerHead from "@/components/viewer-main/ViewerHead";
import ViewerNavbar from "@/components/viewer-main/ViewerNavbar";
import { useEffect, useState } from "react";
import "../../../../styles/dark.css";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [result, setResult] = useState<any>(null);
  return (
    <div className={`h-screen flex flex-col`}>
      <ViewerHead />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
