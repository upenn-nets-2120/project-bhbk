"use client";

import { api } from "@/lib/api";
import { User } from "@/types/user";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

interface UserContextProps {
  user?: User;
  isLoggedIn: boolean;
  registerUser: () => Promise<void>;
  logInUser: (username: string, password: string) => Promise<void>;
  setUser: (usert: User) => void;
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

interface UserProviderProps extends PropsWithChildren {}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const registerUser = async () => {
    await api.post("/auth/sign-up", user);
  };

  const logInUser = async (username: string, password: string) => {
    const { data: loggedInUser } = await api.post<User>("/auth/log-in", {
      username,
      password,
    });
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      registerUser,
      logInUser,
      setUser,
    }),
    [user, isLoggedIn, setIsLoggedIn, setUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
