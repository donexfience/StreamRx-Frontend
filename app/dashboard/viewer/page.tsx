import ViewerDashboard from "@/components/dashboard/ViewerDashboard";
import React from "react";
import { ThemeProvider } from "next-themes";
const dashboard: React.FC = () => {
  return (
    <div>
      <ViewerDashboard />
    </div>
  );
};

export default dashboard;
