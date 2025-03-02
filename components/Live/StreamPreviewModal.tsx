"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useEditStreamMutation,
  useGetChannelStreamsQuery,
} from "@/redux/services/streaming/streamingApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Mic, Monitor, X, Play, Users, ThumbsUp } from "lucide-react";
import { useMediaDevices } from "@/hooks/useMediaDevice";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface StreamPreviewModalProps {
  channelId: string;
  onClose: () => void;
  stream: any;
  refetchStreams: any;
  onGoLive: any;
  onCloseCreateStream: any;
  isLoading: boolean;
}

export const StreamPreviewModal: React.FC<StreamPreviewModalProps> = ({
  channelId,
  onClose,
  refetchStreams,
  stream,
  onGoLive,
  isLoading,
  onCloseCreateStream,
}) => {
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<
    string | undefined
  >(undefined);
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<
    string | undefined
  >(undefined);
  const [useScreenShare, setUseScreenShare] = useState(false);
  const [useCamera, setUseCamera] = useState(true);
  const { videoDevices, audioDevices } = useMediaDevices();
  const [editStream, { isLoading: isEditing }] = useEditStreamMutation();

  const isScreenShareBroadcast = stream?.broadcastType === "Screen";
  const isWebcamBroadcast = stream?.broadcastType === "Webcam";

  useEffect(() => {
    if (isWebcamBroadcast) {
      if (videoDevices.length > 0 && !selectedVideoDeviceId) {
        setSelectedVideoDeviceId(videoDevices[0].deviceId);
      }
      setUseScreenShare(false);
      setUseCamera(true);
    } else if (isScreenShareBroadcast) {
      setUseScreenShare(true);
      if (videoDevices.length > 0 && !selectedVideoDeviceId) {
        setSelectedVideoDeviceId(videoDevices[0].deviceId);
      }
    }

    if (audioDevices.length > 0 && !selectedAudioDeviceId) {
      setSelectedAudioDeviceId(audioDevices[0].deviceId);
    }
  }, [
    videoDevices,
    audioDevices,
    selectedVideoDeviceId,
    selectedAudioDeviceId,
    isWebcamBroadcast,
    isScreenShareBroadcast,
  ]);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const handleGoLive = async () => {
    try {
      if (stream?._id) {
        await editStream({
          id: stream._id,
          updateData: { status: "started" },
        }).unwrap();
        refetchStreams();
      }
    } catch (error) {
      console.error("Failed to start stream:", error);
    }
    onClose();
    onGoLive();
    onCloseCreateStream();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="w-full h-6 bg-zinc-800" />
              <Skeleton className="w-full h-48 bg-zinc-800" />
              <Skeleton className="w-2/3 h-4 bg-zinc-800" />
              <Skeleton className="w-1/2 h-4 bg-zinc-800" />
              <Skeleton className="w-3/4 h-4 bg-zinc-800" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stream) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
      >
        <motion.div variants={modalVariants} className="w-full max-w-md">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle>Stream Preview</CardTitle>
              <CardDescription className="text-zinc-400">
                No stream found for this channel
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end pt-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={overlayVariants}
    >
      <motion.div variants={modalVariants} className="w-full max-w-lg">
        <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="bg-zinc-950 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-xl font-bold">
                  Stream Preview
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-1">
                  Get ready to go live
                </CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full text-white hover:bg-zinc-800"
                      onClick={onClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Close</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="w-full h-56 bg-zinc-800 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {useScreenShare ? (
                  <div className="flex flex-col items-center gap-2">
                    <Monitor className="h-12 w-12 text-zinc-700" />
                    {useCamera && (
                      <div className="absolute bottom-12 right-12 bg-zinc-900 p-2 rounded-full">
                        <Camera className="h-6 w-6 text-zinc-500" />
                      </div>
                    )}
                  </div>
                ) : (
                  <Play className="h-12 w-12 text-zinc-700" />
                )}
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge
                  variant="secondary"
                  className="bg-black/50 text-white border-0"
                >
                  Preview
                </Badge>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {stream.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-zinc-800 hover:bg-zinc-800 border-zinc-700"
                    >
                      {stream.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-zinc-800 hover:bg-zinc-800 border-zinc-700"
                    >
                      {stream.visibility}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-zinc-800 hover:bg-zinc-800 border-zinc-700"
                    >
                      {useScreenShare ? "ScreenShare" : "Webcam"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Users className="h-4 w-4" />
                    <span>Waiting: 0</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Likes: 0</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4 bg-zinc-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-400">
                    Screen Sharing
                  </Label>
                  <Switch
                    checked={useScreenShare}
                    onCheckedChange={setUseScreenShare}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm text-zinc-400">Enable Camera</Label>
                  <Switch checked={useCamera} onCheckedChange={setUseCamera} />
                </div>

                {useCamera && (
                  <div className="space-y-2">
                    <Label className="text-sm text-zinc-400">
                      Video Source
                    </Label>
                    <Select
                      value={selectedVideoDeviceId}
                      onValueChange={setSelectedVideoDeviceId}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select video device" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                        {videoDevices.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                          >
                            <div className="flex items-center gap-2">
                              <Camera className="h-4 w-4" />
                              <span className="truncate max-w-52">
                                {device.label}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-400">Audio Source</Label>
                  <Select
                    value={selectedAudioDeviceId}
                    onValueChange={setSelectedAudioDeviceId}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Select audio device" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {audioDevices.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            <span className="truncate max-w-52">
                              {device.label}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 p-6 pt-2 bg-zinc-950">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium"
              onClick={handleGoLive}
              disabled={
                (useCamera && !selectedVideoDeviceId) ||
                !selectedAudioDeviceId ||
                (!useCamera && !useScreenShare)
              }
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                Go Live
              </div>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};
