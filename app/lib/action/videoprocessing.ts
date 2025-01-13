"use server";
import ffmpeg from "fluent-ffmpeg";
import { join } from "path";
import { writeFile } from "fs/promises";
import { unlink, mkdir } from "fs/promises";
import { promises as fs } from "fs";
import path from "path";

interface ProcessingOptions {
  resolution: string;
  bitrate: string;
  fps: number;
}

ffmpeg.setFfmpegPath(
  "C:\\ffmpeg-2025-01-08-git-251de1791e-full_build\\bin\\ffmpeg.exe"
);
ffmpeg.setFfprobePath(
  "C:\\ffmpeg-2025-01-08-git-251de1791e-full_build\\bin\\ffprobe.exe"
);

const PROCESSING_OPTIONS: ProcessingOptions[] = [
  { resolution: "720p", bitrate: "1500k", fps: 30 },
];

export async function readAndProcessVideo(outputPath: string): Promise<Buffer> {
  try {
    const resolvedPath = path.resolve(process.cwd(), outputPath);
    const processedVideoBuffer = await fs.readFile(resolvedPath);
    return processedVideoBuffer;
  } catch (error) {
    console.error("Error reading video file:", error);
    throw new Error("Failed to process video file.");
  }
}

export const processVideo = async (
  base64Video: string,
  videoId: string
): Promise<{
  outputPath: string;
  metadata: any;
}> => {
  const tempDir = join(process.cwd(), "tmp");
  const tempInputPath = join(tempDir, `input-${videoId}`);
  const tempOutputPath = join(tempDir, `output-${videoId}.mp4`);

  try {
    await mkdir(tempDir, { recursive: true });

    // Decode base64 to buffer and save to a temporary file
    const videoBuffer = Buffer.from(base64Video, "base64");
    await writeFile(tempInputPath, videoBuffer);

    // Get video metadata
    const metadata = await getVideoMetadata(tempInputPath);

    // Compress video
    await compressVideo(tempInputPath, tempOutputPath);

    return {
      outputPath: tempOutputPath,
      metadata,
    };
  } catch (error) {
    // Cleanup temp files in case of error
    await cleanup([tempInputPath, tempOutputPath]);
    throw error;
  }
};

const getVideoMetadata = async (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      const videoStream = metadata.streams.find(
        (s: any) => s.codec_type === "video"
      );
      if (!videoStream) {
        throw new Error("Video stream undefined");
      }
      const frameRate = videoStream.r_frame_rate
        ? eval(videoStream.r_frame_rate)
        : 30;

      resolve({
        codec: videoStream.codec_name || "unknown",
        fps: frameRate,
        duration: metadata.format.duration,
      });
    });
  });
};

const compressVideo = async (
  inputPath: string,
  outputPath: string
): Promise<string> => {
  const options = PROCESSING_OPTIONS[0];

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=-2:${options.resolution.replace("p", "")}`,
        `-b:v ${options.bitrate}`,
        `-r ${options.fps}`,
        "-c:v libx264",
        "-preset medium",
        "-crf 23",
        "-c:a aac",
        "-b:a 128k",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
};

export const cleanup = async (files: string[]): Promise<void> => {
  await Promise.all(files.map((file) => unlink(file).catch(() => {})));
};
