import { baseQuery } from "./baseQuery";

import { createApi } from "@reduxjs/toolkit/query/react";

import {
  ChangePasswordInput,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  GoogleLoginInput,
  GoogleLoginResponse,
  googleLoginStreamerResponse,
  LoginInput,
  LoginResponse,
  RegisterationInitateInput,
  RegistrationInitiateResponse,
  RegistrationStatusResponse,
  StreamerLoginResponse,
  VerifyRegisterationInput,
  VerifyRegistrationResponse,
} from "./auth";

export const graphqlAuthApi = createApi({
  reducerPath: "graphqlAuthApi",
  baseQuery,
  endpoints: (builder) => ({
    initiateRegistration: builder.mutation<
      RegistrationInitiateResponse,
      RegisterationInitateInput
    >({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation InitiateRegistration($input: UserCreateInput!) {
              initiateRegistration(input: $input) {
                message
                status {
                  status
                  message
                  email
                  createdAt
                  attemptsRemaining
                  expiresIn
                }
              }
            }
          `,
          variables: { input },
        },
      }),
    }),

    verifyRegistration: builder.mutation<
      VerifyRegistrationResponse,
      VerifyRegisterationInput
    >({
      query: ({ email, otp }) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation VerifyRegistration($email: String!, $otp: String!) {
              verifyRegistration(email: $email, otp: $otp) {
                user {
                  id
                  email
                  isActive
                }
                token {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: { email, otp },
        },
      }),
    }),

    StreamerLogin: builder.mutation<StreamerLoginResponse, LoginInput>({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation loginStreamer($input: LoginInput!) {
              loginStreamer(input: $input) {
                success
                message
                user {
                  id
                  email
                  role
                  isVerified
                }
                token {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: { input },
        },
      }),
    }),

    registrationStatus: builder.query<
      RegistrationStatusResponse,
      { email: string }
    >({
      query: ({ email }) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            query RegistrationStatus($email: String!) {
              registrationStatus(email: $email) {
                status
                message
                email
                createdAt
                attemptsRemaining
                expiresIn
              }
            }
          `,
          variables: { email },
        },
      }),
    }),

    login: builder.mutation<LoginResponse, LoginInput>({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                success
                message
                user {
                  id
                  email
                  role
                  isVerified
                }
                token {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: { input },
        },
      }),
    }),

    forgotPassword: builder.mutation<ForgotPasswordResponse, { email: string }>(
      {
        query: ({ email }) => ({
          url: "/graphql",
          method: "POST",
          body: {
            query: `
            mutation ForgotPassword($email: String!) {
              forgotPassword(email: $email) {
                success
                message
              }
            }
          `,
            variables: { email },
          },
        }),
      }
    ),

    changePassword: builder.mutation<
      ChangePasswordResponse,
      ChangePasswordInput
    >({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation ChangePassword($input: ChangePasswordInput!) {
              changePassword(input: $input) {
                success
                message
              }
            }
          `,
          variables: { input },
        },
      }),
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation Logout {
              logout {
                success
              }
            }
          `,
        },
      }),
    }),
    googleLogin: builder.mutation<GoogleLoginResponse, GoogleLoginInput>({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation GoogleLogin($input: GoogleLoginInput!) {
              googleLogin(input: $input) {
                success
                message
                user {
                  id
                  email
                  name
                  role
                  isVerified
                  isActive
                }
                token {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: { input },
        },
      }),
    }),
    googleLoginStreamer: builder.mutation<googleLoginStreamerResponse, GoogleLoginInput>({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation GoogleLoginStreamer($input: GoogleLoginInput!) {
              googleLoginStreamer(input: $input) {
                success
                message
                user {
                  id
                  email
                  name
                  role
                  isVerified
                  isActive
                }
                token {
                  accessToken
                  refreshToken
                }
              }
            }
          `,
          variables: { input },
        },
      }),
    }),    
    resendOtp: builder.mutation<
      { message: string; status: RegistrationStatusResponse },
      { email: string }
    >({
      query: ({ email }) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
          mutation ResendOtp($email: String!) {
            resendOtp(email: $email) {
              message
              status {
                status
                message
                email
                createdAt
                attemptsRemaining
                expiresIn
              }
            }
          }
        `,
          variables: { email },
        },
      }),
    }),
    blockOrUnblock: builder.mutation<
      {
        success: boolean;
        message: string;
        email: string | null;
        status: boolean | null;
      },
      { email: string; value: boolean }
    >({
      query: (input) => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            mutation BlockOrUnblock($input: BlockOrUnblockInput!) {
              blockOrUnblock(input: $input) {
                success
                message
                email
                status
              }
            }
          `,
          variables: { input },
        },
      }),
    }),
    users: builder.query<any, void>({
      query: () => ({
        url: "/graphql",
        method: "POST",
        body: {
          query: `
            query {
              users {
                email
                username
                phoneNumber
                dateOfBirth
                profileImageUrl
                bio
                isActive
                isVerified
                role
                googleId
              }
            }
          `,
        },
      }),
    }),
  }),
});

export const {
  useInitiateRegistrationMutation,
  useVerifyRegistrationMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useStreamerLoginMutation,
  useUsersQuery,
  useBlockOrUnblockMutation,
  useGoogleLoginMutation,
  useRegistrationStatusQuery,
  useResendOtpMutation,
} = graphqlAuthApi;
