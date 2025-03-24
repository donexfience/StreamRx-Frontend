import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

interface StreamerCardProps {
  streamer: {
    id: string;
    email: string;
    username: string;
    profileImageURL: string;
    bio: string;
    friendshipStatus:
      | "FRIEND"
      | "ACCEPTED"
      | "PENDING_SENT"
      | "PENDING_RECEIVED"
      | "BLOCKED"
      | "NONE"
      | "CHURNED"
      | "CUSTOMER";
    mutualFriendsCount?: any;
  };
  onAction: (streamerId: string, action: string) => void;
  className?: string;
}

const statusDisplay: any = {
  FRIEND: {
    label: "Friend",
    className: "bg-green-100 text-green-800",
  },
  ACCEPTED: {
    label: "Friend",
    className: "bg-green-100 text-green-800",
  },
  PENDING_SENT: {
    label: "Request Sent",
    className: "bg-blue-100 text-blue-800",
  },
  PENDING_RECEIVED: {
    label: "Request Received",
    className: "bg-purple-100 text-purple-800",
  },
  BLOCKED: {
    label: "Blocked",
    className: "bg-red-100 text-red-800",
  },
  NONE: {
    label: "Not Connected",
    className: "bg-gray-100 text-gray-800",
  },
  CHURNED: {
    label: "Churned",
    className: "bg-amber-100 text-amber-800",
  },
  CUSTOMER: {
    label: "Customer",
    className: "bg-indigo-100 text-indigo-800",
  },
};

const StreamerCard: React.FC<StreamerCardProps> = ({
  streamer,
  onAction,
  className = "",
}) => {
  console.log(streamer, "streamerrrrrrrrrrrrrrrrrrrrrrrrr");

  const effectiveStatus = streamer.friendshipStatus;
  const status = statusDisplay[effectiveStatus] || statusDisplay.NONE;

  const mutualCount: any =
    Number.isInteger(streamer.mutualFriendsCount ?? 0) &&
    streamer.mutualFriendsCount >= 0
      ? streamer.mutualFriendsCount
      : 0;

  return (
    <motion.tr
      className={`border-b transition-colors ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={streamer.profileImageURL} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {streamer.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-blue-900">
              {streamer.username}
            </span>
            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
              {streamer.email}
            </span>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <Badge className={`${status.className} font-medium`}>
          {status.label}
        </Badge>
      </td>

      <td className="py-4 px-4 max-w-[300px]">
        <p className="text-sm truncate">{streamer.bio}</p>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {Array(Math.min(mutualCount, 3))
              .fill(0)
              .map((_, i) => (
                <Avatar key={i} className="h-7 w-7 border-2 border-background">
                  <AvatarImage
                    src={`https://i.pravatar.cc/150?img=${i + 10}`}
                    alt="User"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    U{i}
                  </AvatarFallback>
                </Avatar>
              ))}
          </div>
          {mutualCount > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              +{mutualCount} {mutualCount === 1 ? "user" : "users"}
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-2 justify-end">
          {effectiveStatus === "NONE" && (
            <Button
              size="sm"
              onClick={() => onAction(streamer.id, "add")}
              className="flex items-center gap-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
          {effectiveStatus === "PENDING_RECEIVED" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onAction(streamer.id, "accept")}
              className="flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              <span>Accept</span>
            </Button>
          )}
          {(effectiveStatus === "FRIEND" || effectiveStatus === "ACCEPTED") && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onAction(streamer.id, "message")}
                className="flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onAction(streamer.id, "block")}
                className="flex items-center gap-1"
              >
                <UserX className="h-4 w-4" />
                <span>Block</span>
              </Button>
            </div>
          )}
          {effectiveStatus === "BLOCKED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction(streamer.id, "unblock")}
            >
              Unblock
            </Button>
          )}
          {effectiveStatus === "PENDING_SENT" && (
            <span className="text-sm text-muted-foreground">Request Sent</span>
          )}
        </div>
      </td>
    </motion.tr>
  );
};

export default StreamerCard;
