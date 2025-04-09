import React from "react";
import { ArrowLeft, Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  streams: any;
}

const Header: React.FC<HeaderProps> = ({streams}) => {
  return (
    <div className="h-16 flex items-center justify-between px-4 bg-[#0e1e3c] border-b border-white/10">
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-white/10 rounded-md">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-medium text-lg">
            Live with StreamRx, March 22
          </span>
          <button className="p-1 hover:bg-white/10 rounded-md">
            <Edit size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <div className="bg-purple-600/50 text-white px-3 py-1 rounded-md flex items-center gap-1 hover:bg-purple-600/60 cursor-pointer">
            <span>GO PRO</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <div className="flex h-6 items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white"></div>
              <span className="text-sm">Record</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-[#192b4e] border-[#2d4271] hover:bg-[#243860]"
          >
            <Clock size={14} className="mr-1" />
            Channels
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-[#192b4e] border-[#2d4271] hover:bg-[#243860]"
          >
            Schedule
          </Button>
          <Button size="sm" className="h-8 bg-orange-500 hover:bg-orange-600">
            Go Live
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
