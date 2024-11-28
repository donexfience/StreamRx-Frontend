'use client'
import { logout, setCredentials } from "@/redux/services/auth/authSlice";
import {
  useLoginMutation,
  useLogoutMutation,
} from "@/redux/services/auth/graphqlAuthApi";
import { RootState } from "@/redux/store";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
  const dispatch = useDispatch();
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const authState = useSelector((state: RootState) => state.auth);
  const [isLoading,setIsLoading] = useState(false)
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await loginMutation({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: response.user,
          tokens: response.token,
        })
      );
      return response;
    } catch (error: any) {
      throw error;
    }
  };
  const logoutUser = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return {
    ...authState,
    login,
    logout: logoutUser,
  };
};
