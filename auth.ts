import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { graphqlAuthApi } from "./redux/services/auth/graphqlAuthApi";
import { store } from "./redux/store"; // Make sure to import your store properly

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

          // Dispatch the login action and unwrap to access the response
          const response = await store
            .dispatch(
              graphqlAuthApi.endpoints.login.initiate({
                email: credentials.email,
                password: credentials.password,
              })
            )
            .unwrap(); // Unwrap the payload

          console.log("Response received:", response);

          // Handle successful login
          if (response?.data?.login?.success) {
            const user = response.data?.login.user;
            return {
              id: user.id,
              email: user.email,
              token: response.data?.login.token.accessToken,
            };
          }

          // Handle unsuccessful login
          throw new Error(response?.data?.login?.message || "Invalid login");
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      },
    }),
  ],
});
