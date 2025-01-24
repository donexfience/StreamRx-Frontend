"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, Settings } from "lucide-react";

const members = [
  {
    name: "KillEveryone",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Oreo",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Xanac",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Popolusuncy",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
  },
  {
    name: "Jimmy Sullivan",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
  },
];

export function MembersList() {
  return (
    <div className="w-60 border-l h-screen">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <h3 className="font-semibold">Members (16)</h3>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-3rem)]">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Server Info</h4>
            <p className="text-sm text-muted-foreground">
              A professional esports organization based in North America...
            </p>
            <Button variant="outline" className="w-full justify-between">
              Copy Link
              <Link className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Members</h4>
            {members.map((member) => (
              <div
                key={member.name}
                className="flex items-center gap-2 group px-2 py-1 rounded hover:bg-muted"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm">{member.name}</span>
                <div
                  className={`h-2 w-2 rounded-full ${
                    member.status === "online" ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
