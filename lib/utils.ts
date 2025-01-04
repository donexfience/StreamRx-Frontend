import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Yup from "yup";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




// URL regex for social media links
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Step 1 Validation Schema
export const BasicInfoSchema = Yup.object().shape({
  channelProfileImageURL: Yup.string()
    .nullable()
    .test("required-image", "Profile image is required", function(value) {
      return !!value;
    }),
  channelName: Yup.string()
    .required("Channel name is required")
    .min(3, "Channel name must be at least 3 characters")
    .max(30, "Channel name must not exceed 30 characters")
    .matches(
      /^[a-zA-Z0-9_\s]+$/,
      "Channel name can only contain letters, numbers, and underscores"
    ),
  accessibility: Yup.string()
    .required("Channel accessibility is required")
    .oneOf(["public", "private", "personal"], "Invalid accessibility option"),
  experience: Yup.string()
    .required("Channel description is required")
    .min(50, "Description must be at least 50 characters")
    .max(500, "Description must not exceed 500 characters")
});

// Step 2 Validation Schema
export const StreamingDetailsSchema = Yup.object().shape({
  category: Yup.mixed()
    .required("At least one category is required")
    .test("is-array", "Categories must be selected", value => 
      Array.isArray(value) && value.length > 0
    )
    .test("max-categories", "Maximum 3 categories allowed", value => 
      Array.isArray(value) && value.length <= 3
    ),
  experience: Yup.string()
    .required("Streaming experience is required")
    .min(100, "Experience description must be at least 100 characters")
    .max(1000, "Experience description must not exceed 1000 characters"),
  socialLinks: Yup.object().shape({
    twitter: Yup.string()
      .matches(urlRegex, "Invalid Twitter URL")
      .required("Twitter link is required"),
    instagram: Yup.string()
      .matches(urlRegex, "Invalid Instagram URL")
      .required("Instagram link is required"),
    youtube: Yup.string()
      .matches(urlRegex, "Invalid YouTube URL")
      .required("YouTube link is required")
  })
});

// Step 3 Validation Schema
export const AdditionalInfoSchema = Yup.object().shape({
  message: Yup.string()
    .required("Additional information is required")
    .min(100, "Additional information must be at least 100 characters")
    .max(500, "Additional information must not exceed 500 characters")
});

// Helper function to validate current step
export const validateStep = async (
  step: number,
  formData: any
): Promise<{ isValid: boolean; errors: any }> => {
  try {
    let schema;
    let dataToValidate;

    switch (step) {
      case 0:
        schema = BasicInfoSchema;
        dataToValidate = {
          channelProfileImageURL: formData.channelProfileImageURL,
          channelName: formData.channelName,
          accessibility: formData.accessibility,
          experience: formData.experience
        };
        break;
      case 1:
        schema = StreamingDetailsSchema;
        dataToValidate = {
          category: formData.category,
          experience: formData.experience,
          socialLinks: formData.socialLinks
        };
        break;
      case 2:
        schema = AdditionalInfoSchema;
        dataToValidate = {
          message: formData.message
        };
        break;
      default:
        return { isValid: false, errors: { general: "Invalid step" } };
    }

    await schema.validate(dataToValidate, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    if (err instanceof Yup.ValidationError) {
      const errors = err.inner.reduce((acc, error) => ({
        ...acc,
        [error.path!]: error.message
      }), {});
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: "Validation failed" } };
  }
};