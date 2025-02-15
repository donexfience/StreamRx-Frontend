import { useEffect, useState, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MessageCircle,
  Heart,
  Image as ImageIcon,
  Smile,
  Edit2,
  Reply,
  X,
  AtSign,
  Send,
  Crown,
  MoreVertical,
  Trash,
} from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { useGetChannelMessagesQuery } from "@/redux/services/community/communityApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ChatMessage {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    username: string;
    profileImage: string;
  };
  channelId: string;
  createdAt: string;
  fileUrl?: string;
  messageType: "text" | "image";
  reactions: Array<{
    emoji: string;
    users: string[];
  }>;
  replies: Array<ChatMessage>;
  replyTo?: {
    _id: string;
    content: string;
    senderId: {
      name: string;
    };
  };
  isEdited: boolean;
}

interface ChatSectionProps {
  currentChannel: {
    channelId: string;
    label: string;
    category: string;
    imageUrl: string;
    ownerId: string; // Added ownerId to the interface
  } | null;
  currentUser: any;
  // channelMembers: Array<{
  //   _id: string;
  //   name: string;
  //   profileImage: string;
  // }>;
}

export function ChatSection({ currentChannel, currentUser }: ChatSectionProps) {
  const { communitySocket } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<
    Map<string, { name: string; timestamp: number }>
  >(new Map());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const {
    data: messagesData,
    refetch: refetchMessages,
    isLoading,
  } = useGetChannelMessagesQuery(
    { channelId: currentChannel?.channelId || "", page, limit },
    { skip: !currentChannel?.channelId }
  );

  console.log(messagesData, "message data got from rtk");

  useEffect(() => {
    if (!communitySocket || !currentChannel?.channelId || !currentUser?._id)
      return;

    communitySocket.emit("join-channel", {
      channelId: currentChannel.channelId,
      userId: currentUser?._id,
    });

    const handleNewMessage = () => {
      refetchMessages();
      scrollToBottom();
    };

    const handleMessageDeleted = () => {
      refetchMessages();
    };

    const handleReactionUpdate = () => {
      refetchMessages();
    };

    const handleTypingStart = ({
      userId,
      userName,
    }: {
      userId: string;
      userName: string;
    }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, { name: userName, timestamp: Date.now() });
        return newMap;
      });
    };

    const handleTypingStop = ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    };

    const typingCleanupInterval = setInterval(() => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        const now = Date.now();
        for (const [userId, data] of newMap.entries()) {
          if (now - data.timestamp > 3000) {
            newMap.delete(userId);
          }
        }
        return newMap;
      });
    }, 5000);

    communitySocket.on("new-message", handleNewMessage);
    communitySocket.on("message-deleted", handleMessageDeleted);
    communitySocket.on("message-reaction-updated", handleReactionUpdate);
    communitySocket.on("user-typing", handleTypingStart);
    communitySocket.on("user-stopped-typing", handleTypingStop);

    return () => {
      clearInterval(typingCleanupInterval);
      communitySocket.off("new-message", handleNewMessage);
      communitySocket.off("message-deleted", handleMessageDeleted);
      communitySocket.off("message-reaction-updated", handleReactionUpdate);
      communitySocket.off("user-typing", handleTypingStart);
      communitySocket.off("user-stopped-typing", handleTypingStop);
    };
  }, [
    communitySocket,
    currentChannel?.channelId,
    currentUser?._id,
    refetchMessages,
  ]);

  const handleDeleteMessage = (messageId: string) => {
    if (!communitySocket || !currentChannel?.channelId) return;

    communitySocket.emit("delete-message", {
      messageId,
      channelId: currentChannel.channelId,
      userId: currentUser?._id,
    });
  };

  const canDeleteForEveryone = (message: ChatMessage) => {
    return (
      message.senderId?._id === currentUser?._id ||
      currentChannel?.ownerId === currentUser?._id
    );
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth" });
      messageElement.classList.add("bg-blue-50");
      setTimeout(() => {
        messageElement.classList.remove("bg-blue-50");
      }, 2000);
    }
  };

  const handleTyping = () => {
    if (!communitySocket || !currentChannel?.channelId || !currentUser?._id)
      return;

    communitySocket.emit("typing-started", {
      channelId: currentChannel.channelId,
      userId: currentUser?._id,
      userName: currentUser.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (communitySocket && currentChannel?.channelId && currentUser?._id) {
        communitySocket.emit("typing-stopped", {
          channelId: currentChannel.channelId,
          userId: currentUser?._id,
        });
      }
    }, 1000);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSendMessage = () => {
    if (
      !communitySocket ||
      !newMessage.trim() ||
      !currentChannel?.channelId ||
      !currentUser?._id
    )
      return;

    const messageData = {
      channelId: currentChannel.channelId,
      senderId: currentUser?._id,
      content: newMessage,
      messageType: "text",
      ...(replyingTo && {
        replyTo: {
          _id: replyingTo?._id,
        },
      }),
    };

    communitySocket.emit("send-message", messageData);
    setNewMessage("");
    refetchMessages();
    setReplyingTo(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (
      !communitySocket ||
      !currentChannel?.channelId ||
      !currentUser?._id ||
      !messageId ||
      !emoji
    )
      return;

    communitySocket.emit("react-to-message", {
      messageId,
      userId: currentUser?._id,
      emoji,
      channelId: currentChannel.channelId,
    });
    refetchMessages();
  };

  if (!currentChannel || !currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const fileUrl = await uploadToCloudinary(file);

      communitySocket?.emit("send-message", {
        channelId: currentChannel?.channelId,
        senderId: currentUser?._id,
        content: "",
        messageType: "image",
        fileUrl,
      });

      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!communitySocket || !currentChannel?.channelId) return;

    communitySocket.emit("edit-message", {
      messageId,
      channelId: currentChannel.channelId,
      content: newContent,
    });

    setIsEditing(null);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyingTo(message);
    messageInputRef.current?.focus();
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // const handleMention = (user: (typeof channelMembers)[0]) => {
  //   const beforeMention = newMessage.slice(0, newMessage.lastIndexOf("@"));
  //   setNewMessage(beforeMention + `@${user.name} `);
  //   setShowMentions(false);
  // };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    const lastAtIndex = value.lastIndexOf("@");

    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionQuery("");
      const rect = input.getBoundingClientRect();
      setCursorPosition({
        x: rect.left + input.selectionStart! * 8, // Approximate character width
        y: rect.bottom,
      });
    } else if (lastAtIndex !== -1) {
      const query = value.slice(lastAtIndex + 1);
      setMentionQuery(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }

    handleTyping();
  };

  const consolidateReactions = (
    reactions: Array<{ emoji: string; users: string[] }>
  ) => {
    const heartReactions = reactions.filter((r) => r.emoji === "❤️");
    const totalHeartCount = heartReactions.reduce(
      (sum, reaction: any) => sum + reaction?.userId?.length,
      0
    );
    const otherReactions = reactions.filter((r) => r.emoji !== "❤️");

    return [
      ...(totalHeartCount > 0
        ? [
            {
              emoji: "❤️",
              users: heartReactions.flatMap((r) => r.users),
              count: totalHeartCount,
            },
          ]
        : []),
      ...otherReactions,
    ];
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isCurrentUser = message.senderId?._id === currentUser?._id;

    return (
      <div
        id={`message-${message?._id}`}
        className={`space-y-2 transition-colors duration-300 rounded-lg p-2 ${
          message.replyTo ? "ml-2" : ""
        } ${isCurrentUser ? "ml-auto max-w-[80%]" : "mr-auto max-w-[80%]"}`}
      >
        {message.replyTo && (
          <div
            onClick={() => scrollToMessage(message.replyTo?._id || "")}
            className="flex items-center gap-2 -mb-1 p-2 bg-gray-50 border-l-4 border-blue-400 rounded cursor-pointer hover:bg-gray-100"
          >
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-blue-600">
                {message.replyTo.senderId.name}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {message.replyTo.content}
              </div>
            </div>
            <Reply className="h-4 w-4 text-gray-400" />
          </div>
        )}

        <div
          className={`flex items-start gap-2 ${
            isCurrentUser ? "flex-row-reverse" : ""
          }`}
        >
          <Avatar>
            {message.senderId?.profileImage ? (
              <AvatarImage src={message.senderId.profileImage} />
            ) : null}
            <AvatarFallback>
              {message.senderId?.username?.[0] || "?"}
            </AvatarFallback>
          </Avatar>

          <div className={`space-y-1 ${isCurrentUser ? "text-right" : ""}`}>
            <div
              className={`flex items-center gap-2 ${
                isCurrentUser ? "justify-end" : ""
              }`}
            >
              <span className="font-semibold flex items-center gap-1">
                {message.senderId?.username || "Unknown User"}
                {currentChannel?.ownerId === message.senderId?._id && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString()}
                {message.isEdited && " (edited)"}
              </span>
            </div>

            {isEditing === message?._id ? (
              <div className="flex gap-2">
                <Input
                  defaultValue={message.content}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleEditMessage(message?._id, e.currentTarget.value);
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`p-3 rounded-lg ${
                  isCurrentUser
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-gray-100 text-gray-900 mr-auto"
                }`}
              >
                <p>{message.content}</p>
              </div>
            )}

            {message.fileUrl && (
              <Card
                className={`mt-2 overflow-hidden relative group ${
                  isCurrentUser ? "ml-auto" : "mr-auto"
                }`}
              >
                <img
                  src={message.fileUrl}
                  alt="Message attachment"
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </Card>
            )}

            <div
              className={`flex items-center gap-2 ${
                isCurrentUser ? "justify-end" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                {consolidateReactions(message.reactions).map(
                  (reaction, index) => (
                    <button
                      key={`${message?._id}-${reaction.emoji}-${index}`}
                      onClick={() =>
                        handleReaction(message?._id, reaction.emoji)
                      }
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
                    >
                      <span className="text-sm">{reaction.emoji}</span>
                      <span className="text-xs text-gray-600">
                        {reaction.users?.length || ""}
                      </span>
                    </button>
                  )
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(message._id, "❤️")}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="h-4 w-4" />
                  </Button>

                  {message.senderId._id === currentUser._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(message._id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className={`${
                        canDeleteForEveryone(message) ? "" : "hidden"
                      }`}
                    >
                      {canDeleteForEveryone(message) ? (
                        <DropdownMenuItem
                          onClick={() => handleDeleteMessage(message._id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete for everyone
                        </DropdownMenuItem>
                      ) : (
                        <div></div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full ">
      <div className="h-12 border-b flex items-center px-4 fixed top-0 w-full bg-white z-10">
        <div className="flex items-center gap-2">
          {currentChannel?.imageUrl ? (
            <img
              src={currentChannel.imageUrl}
              alt={currentChannel.label}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentChannel?.label}</span>
            <span className="text-xs text-gray-500">
              {currentChannel?.category}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4 mt-12 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messagesData &&
            messagesData.data.messages.map((message) => (
              <MessageBubble key={message._id} message={message} />
            ))}
        </div>
        {typingUsers.size > 0 && (
          <div className="text-sm text-muted-foreground italic">
            {Array.from(typingUsers.values())
              .map((user) => user.name)
              .join(", ")}{" "}
            {typingUsers.size === 1 ? "is" : "are"} typing...
          </div>
        )}
      </ScrollArea>

      {replyingTo && (
        <div className="px-4 py-2 border-t flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Reply className="h-4 w-4" />
            <span>Replying to {replyingTo.senderId.username}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="p-4 border-t space-y-2 flex-shrink-0">
        {selectedFile && (
          <Card className="p-2 flex items-center justify-between">
            <span className="text-sm truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        )}

        <div className="flex gap-2 ">
          <div className="flex-1 flex gap-2">
            <Input
              ref={messageInputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyUp={handleKeyUp}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  handleFileUpload(file);
                }
              }}
            />

            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
              </PopoverContent>
            </Popover>

            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
