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
  { resolution: "1080p", bitrate: "4000k", fps: 30 },
  { resolution: "720p", bitrate: "2500k", fps: 30 },
  { resolution: "480p", bitrate: "1000k", fps: 30 },
  { resolution: "360p", bitrate: "600k", fps: 30 },
];

export async function readAndProcessVideo(outputPath: string): Promise<Buffer> {
  try {
    // Normalize the path to handle different path formats
    const filePath = path.normalize(
      path.isAbsolute(outputPath)
        ? outputPath
        : path.join(process.cwd(), outputPath)
    );

    console.log("Attempting to read file from:", filePath);

    // Wait a short time before attempting to read the file
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      await fs.access(filePath);
      console.log(`File verified as accessible: ${filePath}`);
    } catch (error: any) {
      console.error(`File not accessible: ${filePath}`);
      console.error(
        `Directory contents:`,
        await fs.readdir(path.dirname(filePath))
      );
      throw new Error(`File not accessible: ${error.message}`);
    }

    const processedVideoBuffer = await fs.readFile(filePath);
    console.log(
      `Successfully read file. Size: ${processedVideoBuffer.length} bytes`
    );
    return processedVideoBuffer;
  } catch (error: any) {
    console.error("Error in readAndProcessVideo:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to process video file");
  }
}
export const processVideo = async (
  base64Video: string,
  videoId: string
): Promise<{
  outputPaths: { [key: string]: string };
  metadata: any;
}> => {
  const tempDir = join(process.cwd(), "tmp");
  const tempInputPath = join(tempDir, `input-${videoId}`);
  const outputPaths: { [key: string]: string } = {};

  try {
    await mkdir(tempDir, { recursive: true });
    const videoBuffer = Buffer.from(base64Video, "base64");
    await writeFile(tempInputPath, videoBuffer);

    const metadata = await getVideoMetadata(tempInputPath);

    // Process each quality option
    for (const quality of PROCESSING_OPTIONS) {
      const qualityOutputPath = join(
        tempDir,
        `output-${videoId}-${quality.resolution}.mp4`
      );
      await compressVideo(tempInputPath, qualityOutputPath, quality);
      outputPaths[quality.resolution.toLowerCase()] = qualityOutputPath;
    }

    await cleanup([tempInputPath]);

    return {
      outputPaths,
      metadata,
    };
  } catch (error) {
    // Cleanup temp files in case of error
    await cleanup([tempInputPath, ...Object.values(outputPaths)]);
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
  outputPath: string,
  options: ProcessingOptions = PROCESSING_OPTIONS[0]
): Promise<string> => {
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
