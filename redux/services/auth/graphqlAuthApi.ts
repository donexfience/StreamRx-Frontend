
import { baseQuery } from './baseQuery';

import { createApi } from '@reduxjs/toolkit/query/react'

import { ChangePasswordInput, ChangePasswordResponse, ForgotPasswordResponse, LoginInput, LoginResponse, RegisterationInitateInput, RegistrationInitiateResponse, VerifyRegisterationInput, VerifyRegistrationResponse } from './auth'


export const graphqlAuthApi = createApi({
  reducerPath: 'graphqlAuthApi',
  baseQuery,
  endpoints: (builder) => ({
    initiateRegistration: builder.mutation<
      RegistrationInitiateResponse, 
      RegisterationInitateInput
    >({
      query: (input) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: `
            mutation InitiateRegistration($input: RegistrationInitiateInput!) {
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
          variables: { input }
        }
      })
    }),

    verifyRegistration: builder.mutation<
      VerifyRegistrationResponse, 
      VerifyRegisterationInput
    >({
      query: ({ email, otp }) => ({
        url: '/graphql',
        method: 'POST',
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
          variables: { email, otp }
        }
      })
    }),

    login: builder.mutation<LoginResponse, LoginInput>({
      query: (input) => ({
        url: '/graphql',
        method: 'POST',
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
          variables: { input }
        }
      })
    }),

    forgotPassword: builder.mutation<
      ForgotPasswordResponse, 
      { email: string }
    >({
      query: ({ email }) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: `
            mutation ForgotPassword($email: String!) {
              forgotPassword(email: $email) {
                success
                message
              }
            }
          `,
          variables: { email }
        }
      })
    }),

    changePassword: builder.mutation<
      ChangePasswordResponse , 
      ChangePasswordInput
    >({
      query: (input) => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: `
            mutation ChangePassword($input: ChangePasswordInput!) {
              changePassword(input: $input) {
                success
                message
              }
            }
          `,
          variables: { input }
        }
      })
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/graphql',
        method: 'POST',
        body: {
          query: `
            mutation Logout {
              logout {
                success
              }
            }
          `
        }
      })
    })
  })
})

export const { 
  useInitiateRegistrationMutation,
  useVerifyRegistrationMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useChangePasswordMutation,
  useLogoutMutation
} = graphqlAuthApi
