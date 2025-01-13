"use client";
import React, { useState, useRef } from "react";
import { X, FileVideo, Check, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FaVideo } from "react-icons/fa";
import { MdVideoCall } from "react-icons/md";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUploadVideoMutation } from "@/redux/services/channel/videoApi";
import {
  cleanup,
  processVideo,
  readAndProcessVideo,
} from "@/app/lib/action/videoprocessing";
import { uploadToS3 } from "@/app/lib/action/s3";
import toast from "react-hot-toast";

// Types
interface VideoFormData {
  title: string;
  description: string;
  visibility: "private" | "unlisted" | "public";
  subtitles: boolean;
  endScreen: boolean;
  cards: boolean;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  file?: string;
  general?: string;
}

interface VideoUploadProps {
  channelId: string | undefined;
  onClose: () => void;
  onSuccess: (videoData: any) => void;
  maxFileSize?: number; // in bytes
  refetch:any
}

const CircularProgress = ({ progress = 70 }: { progress: number }) => {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#E5E7EB"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#2563EB"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold">{progress}%</span>
      </div>
    </div>
  );
};

const VideoUploadFlow: React.FC<VideoUploadProps> = ({
  channelId,
  onClose,
  onSuccess,
  refetch,
  maxFileSize = 400 * 1024 * 1024,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentModal, setCurrentModal] = useState<"upload" | "details">(
    "upload"
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    visibility: "private",
    subtitles: false,
    endScreen: false,
    cards: false,
  });

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid video file (MP4, MOV, or AVI)";
    }

    if (file.size > maxFileSize) {
      return `File size should be less than ${maxFileSize / (1024 * 1024)}MB`;
    }

    return null;
  };

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }

    if (formData.description.length > 5000) {
      errors.description = "Description must be less than 5000 characters";
    }

    if (!selectedFile) {
      errors.file = "Please select a video file";
    }

    return errors;
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setErrors({});

    if (!files || files.length === 0) {
      setErrors({ file: "No file selected" });
      return;
    }

    const file = files[0];
    const fileError = validateFile(file);

    if (fileError) {
      setErrors({ file: fileError });
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({
      ...prev,
      title: file.name.split(".")[0],
    }));
    setCurrentModal("details");
  };
  const [uploadVideo] = useUploadVideoMutation();

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0)
    setErrors({});

    try {
      if (!selectedFile || !channelId) {
        throw new Error("No file selected or channel ID missing");
      }
      //first convert it in to buffer
      setUploadProgress(10); 
      const buffer = await selectedFile.arrayBuffer();
      const base64Video = Buffer.from(buffer).toString("base64");
      const videoId = Date.now().toString();
      setUploadProgress(10); 
      // Pass base64 string to the server function
      const { outputPath, metadata } = await processVideo(base64Video, videoId);
      console.log(outputPath, metadata, "data got 2624");
      setUploadProgress(50);
      const processedVideoBuffer = await readAndProcessVideo(outputPath);
      console.log(processedVideoBuffer, "hello got buffer");
      const s3Key = `videos/${channelId}/${videoId}/processed.mp4`;
      setUploadProgress(70);
      const fileUrl = await uploadToS3(
        processedVideoBuffer,
        s3Key,
        "video/mp4"
      );
      console.log(fileUrl, "file url from the s3");
      setUploadProgress(80);
      const videoData = {
        channelId,
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        fileUrl,
        s3Key,
        status: "processing",
        processingProgress: 0,
        metadata: {
          originalFileName: selectedFile.name,
          mimeType: selectedFile.type,
          codec: metadata.codec,
          fps: metadata.fps,
          duration: metadata.duration,
        },
        quality: {
          resolution: "720p",
          bitrate: "1500k",
          size: processedVideoBuffer.length,
        },
        videourl: fileUrl,
      };
      setUploadProgress(90);
      console.log(videoData, "video data");
      const uploadedVideo = await uploadVideo({
        ...videoData,
        subtitles: formData.subtitles,
        endScreen: formData.endScreen,
        cards: formData.cards,
      }).unwrap();
      await cleanup([outputPath]);
      setUploadProgress(100);
      console.log(uploadedVideo, "response come");

      onSuccess(videoData);
      toast.success("video upload successfully");
      refetch();
      onClose();
    } catch (error: any) {
      console.log(error, "errror of video");
      setErrors({
        general:
          error.data?.message || "Failed to upload video. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderError = (error: string | undefined) => {
    if (!error) return null;
    return (
      <Alert variant="destructive" className="mt-2 mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  // Floating Icons Component
  const FloatingIcons = () => (
    <div className="relative h-32 w-32 mb-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="bg-blue-100 p-3 rounded-lg shadow-lg">
            <FileVideo className="w-8 h-8 text-blue-500" />
          </div>
          <div className="absolute -top-6 -right-6 bg-blue-100 p-2 rounded-lg shadow-md animate-bounce">
            <FileVideo className="w-6 h-6 text-blue-500" />
          </div>
          <div className="absolute -top-4 -left-6 bg-blue-100 p-2 rounded-lg shadow-md animate-bounce delay-100">
            <FileVideo className="w-5 h-5 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 ">
      {currentModal === "upload" ? (
        <div className="bg-white rounded-lg w-full max-w-2xl">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <FaVideo className="text-2xl" />
              <h2 className="text-xl font-semibold">Upload Video</h2>
              <button
                onClick={onClose}
                className="hover:bg-gray-100 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-10">
            {renderError(errors.general)}
            <div>
              <p className="mb-3 font-bold text-lg">Upload your video here</p>
              <div className="border-2 border-blue-400 border-dashed rounded-lg p-8">
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <FloatingIcons />
                  <button
                    onClick={handleFileClick}
                    className="px-4 py-2 text-white font-bold bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Choose Video
                  </button>
                  <p className="text-sm text-black font-medium line-clamp-2 mt-4">
                    By submitting your videos to StreamrX, you acknowledge that
                    you agree to Terms of Service and Community Guidelines.
                  </p>
                  {renderError(errors.file)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-5xl bg-white mt-28 mb-28">
          <div className="flex items-center justify-between p-6 border-b">
            <MdVideoCall className="text-xl" />
            <h2 className="text-lg font-bold">Video Details</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-8">
            {renderError(errors.general)}

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="space-y-2">
                  <div className="">
                    <label className="block text-sm  font-bold">
                      Title (required)
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    {renderError(errors.title)}
                  </div>

                  <div>
                    <label className="block text-sm mb-2 font-bold">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Tell viewers about your video"
                      className="h-32"
                    />
                    {renderError(errors.description)}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">
                      Choose who can see your video
                    </h3>
                    <RadioGroup
                      value={formData.visibility}
                      onValueChange={(
                        value: "private" | "unlisted" | "public"
                      ) =>
                        setFormData((prev) => ({ ...prev, visibility: value }))
                      }
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <label htmlFor="private" className="flex flex-col">
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-gray-500">
                            Only you can watch
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unlisted" id="unlisted" />
                        <label htmlFor="unlisted" className="flex flex-col">
                          <div className="font-medium">Unlisted</div>
                          <div className="text-sm text-gray-500">
                            Anyone with the link can watch
                          </div>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <label htmlFor="public" className="flex flex-col">
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-gray-500">
                            Everyone can watch
                          </div>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Automatic Subtitles</h4>
                        <p className="text-sm text-gray-500">
                          Generate subtitles automatically
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            subtitles: !prev.subtitles,
                          }))
                        }
                        className={formData.subtitles ? "bg-blue-500 " : ""}
                      >
                        {formData.subtitles ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">End Screen</h4>
                        <p className="text-sm text-gray-500">
                          Add end screen elements
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            endScreen: !prev.endScreen,
                          }))
                        }
                        className={formData.endScreen ? "bg-blue-500" : ""}
                      >
                        {formData.endScreen ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          "Enable"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded mb-4">
                    {selectedFile && (
                      <video className="w-full h-full object-cover rounded">
                        <source
                          src={URL.createObjectURL(selectedFile)}
                          type={selectedFile.type}
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-sm">Filename</p>
                      <p className="text-sm text-gray-500 truncate">
                        {selectedFile?.name || "No file selected"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Size</p>
                      <p className="text-sm text-gray-500">
                        {selectedFile
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(
                              2
                            )} MB`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Upload Status</p>
                      {isUploading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span className="text-sm text-blue-500">
                            Uploading...
                          </span>
                        </div>
                      ) : (
                        <p className=" font-bold text-sm text-green-500 flex items-center pt-2 gap-1">
                          <Check className="h-4 w-4" />
                          Ready to upload
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileVideo className="h-5 w-5" />
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <CircularProgress progress={uploadProgress} />
                  <span>Uploading video...</span>
                </div>
              ) : errors.general ? (
                <span className="text-red-500">Error preparing upload</span>
              ) : (
                <span>Ready to upload</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentModal("upload")}
                disabled={isUploading}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || Object.keys(errors).length > 0}
                className="min-w-[100px]"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-blue-500 font-bold">
                      Uploading...
                    </span>
                  </div>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoUploadFlow;
