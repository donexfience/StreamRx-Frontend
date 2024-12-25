import { googleLoginStreamer } from './redux/services/auth/auth';
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { graphqlAuthApi } from "./redux/services/auth/graphqlAuthApi";
import { store } from "./redux/store";
import Google from "next-auth/providers/google";
import GoogleProvider from "next-auth/providers/google";
import Instagram from "next-auth/providers/instagram";
import Twitch from "next-auth/providers/twitch";
import { setAuthCookies } from "./app/lib/action/auth";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      id: "googleViewer",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GoogleProvider({
      id: "googleStreamer",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          throw new Error("Invalid credentials");
        }

        try {
          console.log("Attempting login...");
          const response = await store
            .dispatch(
              graphqlAuthApi.endpoints.login.initiate({
                email: credentials.email,
                password: credentials.password,
              })
            )
            .unwrap();

          console.log("Response received:", response);
          if (response?.data?.login?.success) {
            const user = response.data?.login.user;
            return {
              id: user.id,
              email: user.email,
              token: response.data?.login.token.accessToken,
            };
          }
          throw new Error(response?.data?.login?.message || "Invalid login");
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in/viewer",
    error: "/sign-in/viewer",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "googleViewer") {
        try {
          const response = await store
            .dispatch(
              graphqlAuthApi.endpoints.googleLogin.initiate({
                email: profile?.email!,
                name: profile?.name as string,
                googleId: account?.providerAccountId!,
              })
            )
            .unwrap();
          console.log(response, "response");
          console.log(
            response.data.googleLogin.token,
            "token got for google login"
          );
          if (response.data?.googleLogin?.token) {
            setAuthCookies(
              response.data.googleLogin.token?.accessToken,
              response.data.googleLogin.token?.refreshToken
            );
          }
          return response?.data?.googleLogin.success || false;
        } catch (error) {
          console.error("Google login failed:", error);
          return false;
        }
      }
      if (account?.provider === "googleStreamer") {
        try {
          const response = await store
            .dispatch(
              graphqlAuthApi.endpoints.googleLoginStreamer.initiate({
                email: profile?.email!,
                name: profile?.name as string,
                googleId: account?.providerAccountId!,
              })
            )
            .unwrap();
          console.log(response, "response");
          console.log(
            response.data.googleLoginStreamer.token,
            "token got for google login"
          );
          if (response.data?.googleLoginStreamer?.token) {
            setAuthCookies(
              response.data.googleLoginStreamer.token?.accessToken,
              response.data.googleLoginStreamer.token?.refreshToken
            );
          }
          return response?.data?.googleLoginStreamer.success || false;
        } catch (error) {
          console.error("Google login failed:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (
        account?.provider === "googleViewer" ||
        account?.provider === "googleStreamer"
      ) {
        console.log(profile, "profile");
        token.id = profile?.sub;
        token.name = profile?.name;
        token.picture = profile?.picture;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes("/api/auth/error")) {
        if (url.includes("googleViewer")) {
          return `${baseUrl}/signin/viewer`;
        }
        if (url.includes("googleStreamer")) {
          return `${baseUrl}/signin/streamer`;
        }
        return `${baseUrl}/signup`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
});
