"use client";

import { api, fetcher } from "@/lib/api";
import { toast } from "@/lib/utils";
import { ErrorReponse } from "@/types/ErrorResponse";
import { User } from "@/types/user";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import useSWR from "swr";

interface UserContextProps {
  user?: User;
  isLoggedIn: boolean;
  registerUser: () => Promise<void>;
  logInUser: (username: string, password: string) => Promise<void>;
  setUser: (usert: User) => void;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  uploadProfilePic: (profile: File) => Promise<void>;
  error?: string;
  isMakingRequest: boolean;
}

export const UserContext = createContext<UserContextProps | undefined>(
  undefined
);

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
};

export const userRevalidationInterval = 100 * 1000;

interface UserProviderProps extends PropsWithChildren {
  initialUser?: User;
}

export const UserProvider: FC<UserProviderProps> = ({
  children,
  initialUser,
}) => {
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [error, setError] = useState<string>();

  const { data: revalidateUserData, error: revalidateUserError } = useSWR<User>(
    "/auth",
    fetcher,
    {
      refreshInterval: userRevalidationInterval,
    }
  );

  const [isLoggedIn, setIsLoggedIn] = useState(initialUser ? true : false);

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const router = useRouter();

  const registerUser = async () => {
    try {
      setIsMakingRequest(true);
      await api.post("/auth/sign-up", user);
      router.push("/log-in");
      setIsMakingRequest(false);
      toast(
        "Registered sucessfully",
        `Registration successful for ${user?.username}`
      );
      setError(undefined);
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        setIsMakingRequest(false);
        const errorMessage: ErrorReponse = error.response?.data;
        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const logInUser = async (username: string, password: string) => {
    try {
      setIsMakingRequest(true);
      const { data: loggedInUser } = await api.post<User>("/auth/log-in", {
        username,
        password,
      });
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setIsMakingRequest(false);
      toast(
        "Logged in sucessfully",
        `Log in successful for ${loggedInUser.username}`
      );
      setError(undefined);
      router.push("/");
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    try {
      setIsMakingRequest(true);

      await api.put("/user/update-user", updatedUser);

      toast("Update user details sucessfully!");

      setError(undefined);

      setIsMakingRequest(false);
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const { data: refreshedUser } = await api.get<User>("/auth");
      setUser(refreshedUser);
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        console.log(errorMessage);
      }
    }
  };

  const uploadProfilePic = async (profile: File) => {
    try {
      const formData = new FormData();
      formData.append("file", profile);

      const { data: profileUrl } = await api.post<string>(
        "/image/upload/profile-pic",
        formData
      );

      await updateUser({ profileUrl });

      toast(
        "Sucessfully uploaded profile picture",
        `Uploaded file ${profile.name}`
      );
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        toast(
          "Failed to upload profile picture",
          `Failed to upload file ${profile.name}`
        );
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  useEffect(() => {
    if (revalidateUserError) {
      setUser(undefined);
      setIsLoggedIn(false);
      return;
    }

    if (revalidateUserData) {
      setUser(revalidateUserData);
      setIsLoggedIn(true);
    }
  }, [revalidateUserData]);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      registerUser,
      logInUser,
      setUser,
      error,
      isMakingRequest,
      updateUser,
      refreshUser,
      uploadProfilePic,
    }),
    [
      user,
      isLoggedIn,
      setIsLoggedIn,
      setUser,
      error,
      setError,
      setIsMakingRequest,
      updateUser,
      refreshUser,
      uploadProfilePic,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
