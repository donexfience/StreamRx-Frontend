"use server";

import jwt from "jsonwebtoken";
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
    console.log(response, "response");
    const loginData = response?.data?.loginStreamer;
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
      const cookieStore = await cookies();

      //cookie for preventing direct access in the register realated pages
      cookieStore.set("registration_initiated", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60,
      });
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

export async function clearAuthCookie(cookieName: string) {
  const cookiesStore = await cookies();
  cookiesStore.delete(cookieName);
}

export async function getAuthCookies() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    return {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    };
  } catch (error) {
    console.error("Error retrieving cookies:", error);
    return {
      accessToken: null,
      refreshToken: null,
      message: "Failed to retrieve cookies",
    };
  }
}

interface TokenPayload {
  username: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  id:string

}

export async function getUserFromCookies() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        message: "No access token found in cookies.",
      };
    }

    // Decode the token
    const decodedToken = jwt.decode(accessToken) as TokenPayload | null;

    if (!decodedToken) {
      return {
        success: false,
        message: "Invalid token. Unable to decode.",
      };
    }

    return {
      success: true,
      user: decodedToken,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return {
      success: false,
      message: "An unexpected error occurred while decoding the token.",
    };
  }
}

export async function RegisterationCookieSet() {
  const cookieStore = await cookies();
  cookieStore.set("registration_initiated", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60,
  });
}

export async function fetchUserData() {
  try {
    // Dispatch the action to fetch user data from the API endpoint
    const response = await store
      .dispatch(graphqlAuthApi.endpoints.users.initiate())
      .unwrap();
    console.log(response, "response from backend");
    const userData = response?.data?.getUserData;

    if (userData) {
      store.dispatch(setCredentials({ user: userData }));

      return {
        success: true,
        user: userData,
      };
    } else {
      return {
        success: false,
        message: "No user data found.",
      };
    }
  } catch (err) {
    console.error("Error during fetching user data:", err);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
