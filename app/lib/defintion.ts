import { z } from "zod";
export const LoginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }).trim(),
  // password: z
  //   .string()
  //   .min(8, { message: "Be at least 8 characters long" })
  //   .regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
  //   .regex(/[0-9]/, { message: "Contain at least one number." })
  //   .regex(/[^a-zA-Z0-9]/, {
  //     message: "Contain at least one special character.",
  //   })
  //   .trim(),
});

export const RegistrationFormSchema = z.object({
  email: z.string().email("Invalid email address").nonempty("Email is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[\W_]/, "Password must contain at least one special character")
    .nonempty("Password is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .nonempty("Username is required"),
    dateOfBirth: z.string()
    .refine((date) => {
      const dob = new Date(date);
      return !isNaN(dob.getTime());
    }, "Invalid date of birth"),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .nonempty("Phone number is required"),
});


export type FormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
