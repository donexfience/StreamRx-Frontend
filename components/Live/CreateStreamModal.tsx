import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, addMinutes, isBefore } from "date-fns";
import { useDebounce } from "use-debounce";
import {
  AlertCircle,
  CalendarIcon,
  Camera,
  Monitor,
  User,
  Users,
  Lock,
  Globe,
  ImagePlus,
  X,
  Video,
  Upload,
  MonitorPlay,
} from "lucide-react";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { useGetPlaylistByQueryQuery } from "@/redux/services/channel/plalylistApi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  processVideo,
  readAndProcessVideo,
} from "@/app/lib/action/videoprocessing";
import { uploadToS3 } from "@/app/lib/action/s3";
import { uploadToCloudinary } from "@/app/lib/action/user";
import { useCreateStreamMutation } from "@/redux/services/streaming/streamingApi";
import { StreamPreviewModal } from "./StreamPreviewModal";

interface CreateStreamModalProps {
  onClose: () => void;
  setShowStreamPreview: any;
}

const CreateStreamModal: React.FC<CreateStreamModalProps> = ({
  onClose,
  setShowStreamPreview,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Details", "Customization", "Visibility"];

  const getInitialScheduleTime = () => {
    const now = new Date();
    return addMinutes(now, 5);
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    broadcastType: "Webcam" as "Webcam" | "Screen" | "Both",
    category: "People & Blogs",
    visibility: "Public" as "Public" | "Private" | "Unlisted",
    thumbnail: null as File | string | null,
    fallbackVideo: null as
      | File
      | { [key: string]: { url: string; s3Key: string } }
      | null,
    schedule: {
      dateTime: getInitialScheduleTime(),
    },
    playlistId: "",
    liveChat: {
      enabled: true,
      replay: false,
      participantMode: "Anyone" as "Anyone" | "Subscribers" | "Approved",
      reactions: true,
      slowMode: false,
      slowModeDelay: "60",
    },
    isScheduled: false,
    status: "pending" as "pending" | "scheduled" | "started" | "stopped",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const [users, setUsers] = useState<any>(null);
  const [createStream] = useCreateStreamMutation();
  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const { data: channelData, isLoading: channelLoading } =
    useGetChannelByEmailQuery(users?.email, { skip: !users?.email });

  const { data: playlistData, isLoading: playlistLoading } =
    useGetPlaylistByQueryQuery(
      { query: debouncedSearchQuery, channelId: channelData?._id || "" },
      { skip: !channelData?._id || !debouncedSearchQuery }
    );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [fallbackVideoUrls, setFallbackVideoUrls] = useState<{
    [key: string]: { url: string; s3Key: string };
  }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    title: "",
    thumbnail: "",
    fallbackVideo: "",
    schedule: "",
    description: "",
  });
  const [openCalendar, setOpenCalendar] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.isScheduled) {
        const now = new Date();
        const minTime = addMinutes(now, 5);
        if (isBefore(formData.schedule.dateTime, minTime)) {
          setErrors((prev) => ({
            ...prev,
            schedule:
              "Scheduled time must be at least 5 minutes from now. Please select a new time.",
          }));
        } else {
          setErrors((prev) => ({ ...prev, schedule: "" }));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [formData.isScheduled, formData.schedule.dateTime]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleChatSettingsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      liveChat: {
        ...prev.liveChat,
        [field]: value,
      },
    }));
  };

  const handleScheduleChange = (date: Date | undefined) => {
    if (date) {
      const now = new Date();
      const minTime = addMinutes(now, 5);
      if (isBefore(date, minTime)) {
        setErrors((prev) => ({
          ...prev,
          schedule: "Scheduled time must be at least 5 minutes from now.",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          schedule: {
            ...prev.schedule,
            dateTime: date,
          },
        }));
        setErrors((prev) => ({ ...prev, schedule: "" }));
      }
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
      setErrors((prev) => ({ ...prev, thumbnail: "" }));
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setVideoPreview(objectUrl);
      setFormData((prev) => ({
        ...prev,
        fallbackVideo: file,
      }));
      setErrors((prev) => ({ ...prev, fallbackVideo: "" }));
    }
  };

  const uploadFiles = async () => {
    let uploadedThumbnailUrl = "";
    let uploadedFallbackVideoUrls: {
      [key: string]: { url: string; s3Key: string };
    } = {};

    try {
      if (formData.thumbnail && typeof formData.thumbnail !== "string") {
        const file = formData.thumbnail as File;
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
          throw new Error("Please upload a valid image (JPEG, PNG, or GIF)");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("Thumbnail size must be less than 5MB");
        }
        uploadedThumbnailUrl = await uploadToCloudinary(file);
        setThumbnailUrl(uploadedThumbnailUrl);
      } else if (typeof formData.thumbnail === "string") {
        uploadedThumbnailUrl = formData.thumbnail;
      }

      if (formData.fallbackVideo && formData.fallbackVideo instanceof File) {
        const file = formData.fallbackVideo as File;
        const validTypes = ["video/mp4", "video/webm", "video/ogg"];
        if (!validTypes.includes(file.type)) {
          throw new Error("Please upload a valid video (MP4, WebM, or OGG)");
        }
        if (file.size > 100 * 1024 * 1024) {
          throw new Error("Video size must be less than 100MB");
        }
        setUploadProgress(0);
        const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
        const { outputPaths } = await processVideo(base64, `${Date.now()}`);
        const totalResolutions = Object.keys(outputPaths).length;
        let processedResolutions = 0;

        const uploadPromises = Object.entries(outputPaths).map(
          async ([resolution, path]) => {
            const buffer = await readAndProcessVideo(path);
            const s3Key = `videos/${
              channelData?._id || "unknown"
            }/${Date.now()}-${resolution}.mp4`;
            const url = await uploadToS3(buffer, s3Key, "video/mp4");
            processedResolutions++;
            setUploadProgress((processedResolutions / totalResolutions) * 100);
            return [resolution, { url, s3Key }] as [
              string,
              { url: string; s3Key: string }
            ];
          }
        );

        const uploadedResults = await Promise.all(uploadPromises);
        uploadedFallbackVideoUrls = Object.fromEntries(uploadedResults);
        setFallbackVideoUrls(uploadedFallbackVideoUrls);
      } else if (
        formData.fallbackVideo &&
        typeof formData.fallbackVideo === "object"
      ) {
        uploadedFallbackVideoUrls = formData.fallbackVideo;
      }

      return { uploadedThumbnailUrl, uploadedFallbackVideoUrls };
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error(error.message || "Failed to upload files");
    }
  };

  const validateStep = () => {
    const newErrors = {
      title: "",
      thumbnail: "",
      fallbackVideo: "",
      schedule: "",
      description: "",
    };
    let isValid = true;

    // if (currentStep === 0) {
    //     if (!formData.title.trim()) {
    //       newErrors.title = "Title is required";
    //       isValid = false;
    //     }
    //     if (!formData.thumbnail) {
    //       newErrors.thumbnail = "Thumbnail is required";
    //       isValid = false;
    //     }
    //     if (!formData.description) {
    //       newErrors.description = "Description is required";
    //       isValid = false;
    //     }
    //   }

    if (currentStep === 1) {
      // if (!formData.fallbackVideo) {
      //   newErrors.fallbackVideo = "Fallback video is required";
      //   isValid = false;
      // }
    }

    if (currentStep === 2 && formData.isScheduled) {
      const now = new Date();
      const minTime = addMinutes(now, 5);
      if (
        !formData.schedule.dateTime ||
        isNaN(formData.schedule.dateTime.getTime()) ||
        isBefore(formData.schedule.dateTime, minTime)
      ) {
        newErrors.schedule =
          "Scheduled time must be at least 5 minutes from now.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleNext = async () => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        try {
          const { uploadedThumbnailUrl, uploadedFallbackVideoUrls } =
            await uploadFiles();

          const now = new Date();
          const status: "pending" | "scheduled" | "started" | "stopped" =
            formData.isScheduled
              ? isBefore(now, formData.schedule.dateTime)
                ? "scheduled"
                : "started"
              : "started";

          const streamData = {
            ...formData,
            thumbnail: uploadedThumbnailUrl || "",
            fallbackVideo: uploadedFallbackVideoUrls,
            channelId: channelData?._id || "",
            schedule: {
              dateTime: formData.isScheduled
                ? formData.schedule.dateTime
                : new Date(),
            },
            status,
          };

          console.log("Sending to backend:", streamData);
          await createStream(streamData).unwrap();
          setShowStreamPreview(true);
          onClose();
        } catch (error: any) {
          console.error("Error in handleNext:", error);
          setErrors((prev) => ({
            ...prev,
            thumbnail: error?.message?.includes("thumbnail") ? error.message : "",
            fallbackVideo: error?.message?.includes("video") ? error.message : "",
          }));
        }
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const clearVideoSelection = () => {
    setFormData((prev) => ({ ...prev, fallbackVideo: null }));
    setVideoPreview(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white" htmlFor="title">
                Title (required)
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Add a title that describes your stream"
                className="bg-zinc-800 border-zinc-600 text-white"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white" htmlFor="description">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Tell viewers more about your stream"
                className="bg-zinc-800 border-zinc-600 text-white h-32"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">How do you want to go live?</Label>
              <div className="flex gap-4">
                <Button
                  variant={
                    formData.broadcastType === "Webcam" ? "default" : "outline"
                  }
                  className="w-1/3 gap-2"
                  onClick={() => handleChange("broadcastType", "Webcam")}
                >
                  <Camera className="w-5 h-5" />
                  Webcam
                </Button>
                <Button
                  variant={
                    formData.broadcastType === "Screen" ? "default" : "outline"
                  }
                  className="w-1/3 gap-2"
                  onClick={() => handleChange("broadcastType", "Screen")}
                >
                  <Monitor className="w-5 h-5" />
                  Screen
                </Button>
                <Button
                  variant={
                    formData.broadcastType === "Both" ? "default" : "outline"
                  }
                  className="w-1/3 gap-2"
                  onClick={() => handleChange("broadcastType", "Both")}
                >
                  <MonitorPlay className="w-5 h-5" />
                  Both
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white" htmlFor="category">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-600 text-white">
                  <SelectItem value="People & Blogs">People & Blogs</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Tech">Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Thumbnail (required)</Label>
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center flex flex-col items-center justify-center space-y-2">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Thumbnail Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                ) : (
                  <ImagePlus className="h-8 w-8 text-white" />
                )}
                <input
                  type="file"
                  id="thumbnail-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                />
                <label htmlFor="thumbnail-upload">
                  <Button asChild className="text-white" variant="link">
                    <span>
                      {formData.thumbnail ? "Change" : "Select"} thumbnail
                    </span>
                  </Button>
                </label>
                {errors.thumbnail && (
                  <p className="text-red-500 text-sm">{errors.thumbnail}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Fallback Video
              </h3>
              <Alert
                variant="destructive"
                className="bg-blue-950 border-blue-800 text-blue-100"
              >
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription>
                  This video will be shown to viewers when you're not online.
                  Upload a welcome video or previous stream recording.
                </AlertDescription>
              </Alert>
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center flex flex-col items-center justify-center space-y-4">
                {videoPreview ? (
                  <div className="w-full space-y-4">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-48 rounded-lg object-contain bg-black"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm truncate max-w-48">
                        {(formData.fallbackVideo as File)?.name ||
                          "Selected Video"}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearVideoSelection}
                        className="text-xs px-2"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Video className="h-12 w-12 text-blue-400" />
                    <p className="text-gray-400 text-sm">
                      Select a fallback video (MP4, WebM, OGG)
                    </p>
                    <p className="text-gray-500 text-xs">
                      Maximum file size: 100MB
                    </p>
                    <input
                      type="file"
                      id="video-upload"
                      className="hidden"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={handleVideoSelect}
                    />
                    <label htmlFor="video-upload">
                      <Button
                        variant="outline"
                        className="gap-2 cursor-pointer"
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4" />
                          Select video
                        </span>
                      </Button>
                    </label>
                    {errors.fallbackVideo && (
                      <p className="text-red-500 text-sm">
                        {errors.fallbackVideo}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white" htmlFor="playlists">
                Playlists
              </Label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search playlists..."
                  className="bg-zinc-800 border-zinc-600 text-white"
                />
                {debouncedSearchQuery && (
                  <Select
                    value={formData.playlistId}
                    onValueChange={(value) => handleChange("playlistId", value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white mt-2">
                      <SelectValue placeholder="Select a playlist" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-600 text-white">
                      {playlistLoading ? (
                        <SelectItem value="loading">Loading...</SelectItem>
                      ) : Array.isArray(playlistData) &&
                        playlistData?.length ? (
                        playlistData.map((playlist: any) => (
                          <SelectItem key={playlist._id} value={playlist._id}>
                            {playlist.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no playlist">
                          No playlists found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Reactions</h3>
              <div className="text-gray-400 flex items-center space-x-2">
                <Checkbox
                  id="reactions"
                  checked={formData.liveChat.reactions}
                  onCheckedChange={(checked) =>
                    handleChatSettingsChange("reactions", checked)
                  }
                />
                <Label htmlFor="reactions">Live reactions</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Message Delay
              </h3>
              <div className="space-y-4">
                <div className="text-gray-400 flex items-center space-x-2">
                  <Checkbox
                    id="slow-mode"
                    checked={formData.liveChat.slowMode}
                    onCheckedChange={(checked) =>
                      handleChatSettingsChange("slowMode", checked)
                    }
                  />
                  <Label htmlFor="slow-mode">Slow mode</Label>
                </div>
                {formData.liveChat.slowMode && (
                  <Input
                    type="number"
                    value={formData.liveChat.slowModeDelay}
                    onChange={(e) =>
                      handleChatSettingsChange("slowModeDelay", e.target.value)
                    }
                    className="bg-zinc-800 border-zinc-600 text-white"
                    placeholder="Seconds"
                    min="1"
                    max="300"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Participant Modes
              </h3>
              <RadioGroup
                value={formData.liveChat.participantMode}
                onValueChange={(value) =>
                  handleChatSettingsChange("participantMode", value)
                }
                className="space-y-3 text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Anyone"
                    id="anyone"
                    className="bg-red-500"
                  />
                  <Label htmlFor="anyone">Anyone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Subscribers"
                    id="subscribers"
                    className="bg-green-500"
                  />
                  <Label htmlFor="subscribers">Subscribers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Approved"
                    className="bg-blue-500"
                    id="approved"
                  />
                  <Label htmlFor="approved">
                    Live commentary (approved users)
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Visibility</h3>
              <p className="text-sm text-gray-400">
                Choose who can see your stream.
              </p>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(value) => handleChange("visibility", value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value="Private"
                    id="private"
                    className="bg-green-500"
                  />
                  <div>
                    <Label
                      htmlFor="private"
                      className="flex items-center gap-2 text-white"
                    >
                      <Lock className="w-4 h-4" /> Private
                    </Label>
                    <p className="text-sm text-gray-400">
                      Only you and people you choose can watch
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value="Unlisted"
                    id="unlisted"
                    className="bg-red-500"
                  />
                  <div>
                    <Label
                      htmlFor="unlisted"
                      className="text-white flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> Unlisted
                    </Label>
                    <p className="text-sm text-gray-400">
                      Anyone with the link can watch
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem
                    value="Public"
                    id="public"
                    className="bg-blue-500"
                  />
                  <div>
                    <Label
                      htmlFor="public"
                      className="flex items-center gap-2 text-white"
                    >
                      <Globe className="w-4 h-4" /> Public
                    </Label>
                    <p className="text-sm text-gray-400">Everyone can watch</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                When to Start
              </h3>
              <RadioGroup
                value={formData.isScheduled ? "schedule" : "now"}
                onValueChange={(value) =>
                  handleChange("isScheduled", value === "schedule")
                }
                className="space-y-3 text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="now"
                    id="now"
                    className="bg-blue-500"
                  />
                  <Label htmlFor="now">Start Now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="schedule"
                    id="schedule"
                    className="bg-blue-500"
                  />
                  <Label htmlFor="schedule">Schedule for Later</Label>
                </div>
              </RadioGroup>

              {formData.isScheduled && (
                <div className="space-y-2">
                  <Label className="text-white">Schedule Date and Time</Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-zinc-800 border-zinc-600 text-white",
                          !formData.schedule.dateTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.schedule.dateTime ? (
                          format(formData.schedule.dateTime, "PPP HH:mm")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-800 border-zinc-600">
                      <Calendar
                        mode="single"
                        selected={formData.schedule.dateTime}
                        onSelect={(date) => {
                          handleScheduleChange(date);
                          setOpenCalendar(false);
                        }}
                        initialFocus
                        className="text-white"
                        disabled={(date) =>
                          isBefore(date, addMinutes(new Date(), 5))
                        }
                      />
                      <div className="p-3 border-t border-zinc-600">
                        <Select
                          onValueChange={(value) => {
                            const [hours, minutes] = value.split(":");
                            const newDate = new Date(
                              formData.schedule.dateTime
                            );
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            newDate.setSeconds(0); // Reset seconds for consistency
                            handleScheduleChange(newDate);
                          }}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-600 text-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-600 text-white max-h-60 overflow-y-auto">
                            {Array.from({ length: 24 * 12 }, (_, i) => {
                              const totalMinutes = i * 5;
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              const time = `${hours
                                .toString()
                                .padStart(2, "0")}:${minutes
                                .toString()
                                .padStart(2, "0")}`;
                              const now = new Date();
                              const minTime = addMinutes(now, 5);
                              const proposedDate = new Date(
                                formData.schedule.dateTime
                              );
                              proposedDate.setHours(hours);
                              proposedDate.setMinutes(minutes);
                              proposedDate.setSeconds(0);
                              return (
                                <SelectItem
                                  key={time}
                                  value={time}
                                  disabled={isBefore(proposedDate, minTime)}
                                >
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.schedule && (
                    <p className="text-red-500 text-sm">{errors.schedule}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Alert className="bg-green-950 border-green-800 text-green-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2">
                    <Video className="h-5 w-5 text-green-400" />
                  </div>
                  <AlertDescription>
                    <span className="font-semibold block mb-1">
                      Fallback video is configured
                    </span>
                    When you're not streaming live, your fallback video will be
                    shown to viewers.
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center pt-2">
      <div className="bg-zinc-900 rounded-xl w-full max-w-3xl shadow-2xl px-8 py-2">
        <div className="flex pt-3 justify-between">
          <h2 className="text-2xl font-bold text-white mb-4">Create Stream</h2>
          <X className="text-white" onClick={onClose} size={24} />
        </div>

        <div className="flex items-center mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    index <= currentStep ? "bg-blue-600" : "bg-zinc-700"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className="ml-3 text-sm text-gray-300">{step}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-3 ${
                    index < currentStep ? "bg-blue-600" : "bg-zinc-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {renderStep()}

        <div className="flex justify-end mt-8 gap-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
          )}
          <Button className="bg-white text-black" onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateStreamModal;
