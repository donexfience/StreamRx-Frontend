import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { graphqlAuthApi } from "@/redux/services/auth/graphqlAuthApi";
import { store } from "@/redux/store";
import Google from "next-auth/providers/google";
import Instagram from "next-auth/providers/instagram";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Instagram,
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        console.log(email,password,"got here")
        try {
          const response = await store.dispatch(
            graphqlAuthApi.endpoints.login.initiate({ email, password })
          );

          const { data, error } = response as {
            data?: {
              success: boolean;
              user: {
                id: string;
                email: string;
                role: string;
                emailVerified: number | null;
              };
              token: {
                accessToken: string;
                refreshToken: string;
              };
            };
            error?: any;
          };

          if (error) throw new Error("Invalid credentials");

          if (data?.success && data?.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              role: data.user.role,
              emailVerified: data.user.emailVerified
                ? new Date(data.user.emailVerified)
                : null,
              token: JSON.stringify(data.token),
            };
          }

          throw new Error("Authentication failed");
        } catch (err) {
          console.error("Auth error:", err);
          throw new Error("Failed to authenticate");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        emailVerified: token.emailVerified as Date | null,
        token: JSON.parse(token.token as string),
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.token = user.token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/viewer/login",
  },
} satisfies NextAuthConfig);
