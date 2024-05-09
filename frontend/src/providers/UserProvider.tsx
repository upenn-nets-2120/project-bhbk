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
  users?: User[];
  isLoggedIn: boolean;
  registerUser: () => Promise<void>;
  logInUser: (username: string, password: string) => Promise<void>;
  logOutUser: () => Promise<void>;
  setUser: (usert: User) => void;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  uploadProfilePic: (profile: File) => Promise<void>;
  addFriend: (friendId: number) => Promise<void>;
  removeFriend: (friendId: number) => Promise<void>;
  setFriends: (friends: User[]) => void;
  error?: string;
  isMakingRequest: boolean;
  friends: User[];
  actorRecommendations: string[];
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
  initialUsers: User[];
}

export const UserProvider: FC<UserProviderProps> = ({
  children,
  initialUser,
  initialUsers,
}) => {
  const [user, setUser] = useState<User | undefined>(initialUser);
  const [error, setError] = useState<string>();
  const [actorRecommendations, setActorRecommendations] = useState<string[]>(
    []
  );

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [friends, setFriends] = useState<User[]>([]);

  const [isLoggedIn, setIsLoggedIn] = useState(initialUser ? true : false);

  const { data: revalidateUserData, error: revalidateUserError } = useSWR<User>(
    "/auth",
    fetcher,
    {
      refreshInterval: userRevalidationInterval,
    }
  );

  const { data: allUsers, error: allUsersError } = useSWR<User[]>(
    isLoggedIn ? "/user/list" : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const { data: allFriends, error: allFriendsError } = useSWR<User[]>(
    isLoggedIn ? "/friends/list" : null,
    fetcher,
    { refreshInterval: 1000 }
  );

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const router = useRouter();

  const registerUser = async () => {
    try {
      setIsMakingRequest(true);
      await api.post("/auth/sign-up", user);
      api.post("/search/upsertUsers");
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
      updateUserOnlineStatus(true);
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

  const updateUser = async (updatedUser: Partial<User>) => {
    try {
      setIsMakingRequest(true);

      await api.put("/user/update-user", updatedUser);

      toast("Update user details sucessfully!");

      setError(undefined);

      setIsMakingRequest(false);

      refreshUser();
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const updateUserOnlineStatus = async (isOnline: boolean) => {
    await api.put("/user/update-user", { isOnline });
  };

  const uploadProfilePic = async (profile: File) => {
    try {
      setIsMakingRequest(true);
      const formData = new FormData();
      formData.append("file", profile);

      setError(undefined);

      const { data: profileUrl } = await api.post<string>(
        "/image/upload/profile-pic",
        formData
      );

      await updateUser({ profileUrl });

      toast(
        "Sucessfully uploaded profile picture",
        `Uploaded file ${profile.name}`
      );
      setIsMakingRequest(false);
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

  const logOutUser = async () => {
    try {
      setIsMakingRequest(true);
      await updateUserOnlineStatus(false);
      await api.post("/auth/log-out");
      setIsLoggedIn(false);
      setUser(undefined);
      setIsMakingRequest(false);
      router.push("/");
      toast("Sucessfully logged out of Instalite", "See you next time!");
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const getActorRecommendations = async () => {
    try {
      if (user?.profileUrl) {
        const { data: fetchedActors } = await api.post<string[]>(
          "/search/imageSearch",
          { imageUrl: user?.profileUrl }
        );

        setActorRecommendations(fetchedActors);
      }
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        console.error(errorMessage);
      }
    }
  };

  const addFriend = async (friendId: number) => {
    try {
      setIsMakingRequest(true);
      await api.post("/friends/add", { friendId });
      setIsMakingRequest(false);
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        console.error(errorMessage);
      }
    }
  };

  const removeFriend = async (friendId: number) => {
    try {
      setIsMakingRequest(true);
      await api.post("/friends/remove", { friendId });
      setIsMakingRequest(false);
    } catch (error: any | AxiosError) {
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        console.error(errorMessage);
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
      updateUserOnlineStatus(true);
      setUser(revalidateUserData);
      setIsLoggedIn(true);
    }
  }, [revalidateUserData, revalidateUserError]);

  useEffect(() => {
    getActorRecommendations();
  }, [user?.profileUrl]);

  useEffect(() => {
    if (allUsersError) {
      setUsers([]);
      return;
    }

    if (allUsers) {
      setUsers(allUsers);
    }
  }, [allUsers, allUsersError]);

  useEffect(() => {
    if (allFriendsError) {
      setFriends([]);
      return;
    }

    if (allFriends) {
      console.log(allFriends);
      setFriends(allFriends);
    }
  }, [allFriends, allFriendsError]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await updateUserOnlineStatus(false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      updateUserOnlineStatus(false).then(() =>
        window.removeEventListener("beforeunload", handleBeforeUnload)
      );
    };
  }, []);

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
      logOutUser,
      users,
      actorRecommendations,
      addFriend,
      removeFriend,
      friends,
      setFriends,
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
      logOutUser,
      actorRecommendations,
      setActorRecommendations,
      users,
      setUsers,
      addFriend,
      removeFriend,
      friends,
      setFriends,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
