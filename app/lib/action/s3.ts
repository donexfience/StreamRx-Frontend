"use server";
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const uploadResult = await s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
    .promise();

  return uploadResult.Location;
};

export const getPresignedUrl = async (key: string): Promise<string> => {
  try {
    const presignedUrl = await s3.getSignedUrlPromise("getObject", {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key, 
      Expires: 60 * 60,
    });

    return presignedUrl;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    await s3
      .deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      })
      .promise();
  } catch (error) {
    console.error("Error deleting object from S3:", error);
    throw new Error("Failed to delete object from S3");
  }
};
