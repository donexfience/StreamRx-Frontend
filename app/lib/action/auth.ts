"use server";
import { graphqlAuthApi } from "@/redux/services/auth/graphqlAuthApi";
import { store } from "@/redux/store";
import { LoginFormSchema } from "../defintion";
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
      console.log(loginData.user,"user",loginData.token);
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
