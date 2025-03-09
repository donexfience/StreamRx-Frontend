import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Participant {
  userId: string;
  name: string;
  role?: string;
}

interface ParticipantListProps {
  participants: Participant[];
  role: "host" | "guest";
  handleRemoveGuest: (guestId: string) => void;
  userId: string;
}

export const ParticipantList: React.FC<ParticipantListProps> = React.memo(
  ({ participants, role, handleRemoveGuest, userId }) => {
    const onRemoveGuest = useCallback(
      (guestId: string) => handleRemoveGuest(guestId),
      [handleRemoveGuest]
    );

    return (
      <div className="w-full">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Participants
        </h3>
        {participants.map((p) => (
          <div
            key={p.userId}
            className="text-white mb-2 flex items-center p-2 rounded-lg hover:bg-[#1a2641] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {p.name}{" "}
              <span className="text-sm text-gray-400">
                ({p.role || "guest"})
              </span>
            </span>
            {role === "host" && p.userId !== userId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 ml-auto"
                onClick={() => onRemoveGuest(p.userId)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }
);
