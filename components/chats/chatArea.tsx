"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Play } from "lucide-react";
import { MdSend } from "react-icons/md";

const messages = [
  {
    id: 1,
    author: "Oreo",
    avatar: "/placeholder.svg?height=40&width=40",
    content:
      "A professional esports organization based in North America. TSM was founded in 2009 and has since become one of the most successful and popular esports teams in the world, with teams competing in games such as League of Legends.",
    time: "12:05",
    reactions: {
      "❤️": 3,
      "😊": 2,
      "👍": 3,
    },
  },
  {
    id: 2,
    author: "XanaocFams",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Ni kemauan gua abis coba saber core buat ngasi tau lu pade",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-daS5h8JPCJLpYAqRCxmWBNchzDTzVL.png",
    time: "12:05",
    reactions: {
      "❤️": 3,
      "😊": 2,
      "👍": 3,
    },
  },
];

export function ChatSection() {
  return (
    <div className="flex flex-col h-screen">
      <div className="h-12 border-b flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Mabar Santuy</span>
          <span className="text-muted-foreground">General</span>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-start gap-2">
                <Avatar>
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback>{message.author[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{message.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {message.time}
                    </span>
                  </div>
                  <p>{message.content}</p>
                  {message.image && (
                    <Card className="mt-2 overflow-hidden">
                      <img
                        src={message.image || "/placeholder.svg"}
                        alt="Message attachment"
                        className="w-full h-auto"
                      />
                    </Card>
                  )}
                  <div className="flex items-center gap-2">
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        {emoji} {count}
                      </Button>
                    ))}
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-4">
        <Input placeholder="Type a message..." className="w-full" />
        <Button>
          <MdSend />
        </Button>
      </div>
    </div>
  );
}
