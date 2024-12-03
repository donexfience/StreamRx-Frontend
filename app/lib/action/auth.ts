"use server";
import { graphqlAuthApi } from "@/redux/services/auth/graphqlAuthApi";
import { store } from "@/redux/store";
import { LoginFormSchema, RegistrationFormSchema } from "../defintion";
import { cookies } from "next/headers";
import { setCredentials } from "@/redux/services/auth/authSlice";

export async function credentialsLogin(formData: {
  email: string;
  password: string;
}) {
  const validationResult = LoginFormSchema.safeParse(formData);

  if (!validationResult.success) {
    const fieldErrors: { email?: string; password?: string } = {};
    validationResult.error.errors.forEach((error) => {
      if (error.path[0] === "email") fieldErrors.email = error.message;
      if (error.path[0] === "password") fieldErrors.password = error.message;
    });

    return {
      success: false,
      errors: fieldErrors,
    };
  }

  try {
    const response = await store
      .dispatch(
        graphqlAuthApi.endpoints.login.initiate({
          email: formData.email,
          password: formData.password,
        })
      )
      .unwrap();
    const loginData = response?.data?.login;

    if (loginData?.success) {
      const cookieStore = await cookies();
      console.log(loginData.user, "user", loginData.token);
      store.dispatch(
        setCredentials({
          user: loginData.user,
        })
      );

      cookieStore.set("accessToken", loginData.token.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 120,
      });

      cookieStore.set("refreshToken", loginData.token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return {
        success: true,
        user: loginData.user,
      };
    }

    return {
      success: false,
      message: loginData?.message || "Login failed",
    };
  } catch (err) {
    console.error("Error during login attempt:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
export async function credentialsLoginStreamer(formData: {
  email: string;
  password: string;
}) {
  const validationResult = LoginFormSchema.safeParse(formData);

  if (!validationResult.success) {
    const fieldErrors: { email?: string; password?: string } = {};
    validationResult.error.errors.forEach((error) => {
      if (error.path[0] === "email") fieldErrors.email = error.message;
      if (error.path[0] === "password") fieldErrors.password = error.message;
    });

    return {
      success: false,
      errors: fieldErrors,
    };
  }

  try {
    const response = await store
      .dispatch(
        graphqlAuthApi.endpoints.StreamerLogin.initiate({
          email: formData.email,
          password: formData.password,
        })
      )
      .unwrap();
    const loginData = response?.data?.login;
    console.log(loginData, "logindata");
    if (loginData?.success) {
      const cookieStore = await cookies();
      console.log(loginData.user, "user-streamer", loginData.token);
      store.dispatch(
        setCredentials({
          user: loginData.user,
        })
      );

      cookieStore.set("accessToken", loginData.token.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 120,
      });

      cookieStore.set("refreshToken", loginData.token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return {
        success: true,
        user: loginData.user,
      };
    }

    return {
      success: false,
      message: loginData?.message || "Login failed invalid credentials",
    };
  } catch (err) {
    console.error("Error during login attempt:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function credentialsSignup(formData: {
  email: string;
  password: string;
  username: string;
  dateOfBirth: string;
  phoneNumber: string;
}) {
  const validationResult = RegistrationFormSchema.safeParse(formData);

  if (!validationResult.success) {
    const fieldErrors: Partial<{
      email: string;
      password: string;
      username: string;
      dateOfBirth: string;
      phoneNumber: string;
    }> = {};

    validationResult.error.errors.forEach((error) => {
      const field = error.path[0] as keyof typeof fieldErrors;
      fieldErrors[field] = error.message;
    });

    return {
      success: false,
      errors: fieldErrors,
    };
  }

  try {
    console.log(formData, "data");
    const response = await store
      .dispatch(
        graphqlAuthApi.endpoints.initiateRegistration.initiate(formData)
      )
      .unwrap();
    console.log(response, "response from");
    const registrationData = response?.data?.initiateRegistration;
    console.log(registrationData, "registreation data");

    if (registrationData?.status?.message === "OTP verification pending") {
      console.log("hello in the if of singup action");
      return {
        success: true,
        message: "Registration successful please verify your email ",
        status: "pending",
      };
    }

    if (registrationData?.message === "Registration already initiated") {
      return {
        success: true,
        message: "Already sent OTP. Please wait for 5 minutes.",
        status: "Already Started",
      };
    }
    if (
      response?.errors?.[0]?.message === "User with this email already exists"
    ) {
      return {
        success: false,
        errors: {
          email:
            "This email is already registered. Please use a different email or try logging in.",
        },
      };
    }
    return {
      success: false,
      message: registrationData?.status?.message || "Registration failed",
    };
  } catch (err) {
    console.error("Error during registration attempt:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookiesStore = await cookies();
  cookiesStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 120,
  });
  cookiesStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, 
  });
}
