"use client";

import { api, fetcher } from "@/lib/api";
import { ErrorReponse } from "@/types/ErrorResponse";
import { Post } from "@/types/post";
import axios, { AxiosError } from "axios";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "@/lib/utils";
import useSWR from "swr";

export interface PostContextProps {
  uploadPost: (post: Post) => Promise<Post | undefined>;
  uploadPostGraphic: (
    postId: number,
    graphic: File
  ) => Promise<string | undefined>;
  uploadPostHashtags: (postId: number, hashtags: string[]) => Promise<void>;
  isMakingRequest: boolean;
  error?: string;
  posts: Post[];
}

export const PostContext = createContext<PostContextProps | undefined>(
  undefined
);

export const usePosts = () => {
  const context = useContext(PostContext);

  if (!context) {
    throw new Error("usePosts must be used within PostContext");
  }

  return context;
};

export interface PostsProviderProps extends PropsWithChildren {}

export const PostsProvider: FC<PostsProviderProps> = ({ children }) => {
  const [isMakingRequest, setIsMakingRequest] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [posts, setPosts] = useState<Post[]>([]);

  const uploadPost = async (post: Post) => {
    try {
      setIsMakingRequest(true);
      const { data: newPost } = await api.post<Post>("/posts/create", post);
      setIsMakingRequest(false);

      setError(undefined);

      toast("Sucessfully uploaded post's content");

      api.post("/search/upsertPosts");

      return newPost;
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const uploadPostGraphic = async (postId: number, graphic: File) => {
    try {
      setIsMakingRequest(true);

      const formData = new FormData();
      formData.append("file", graphic);

      const { data: fileUrl } = await api.post<string>(
        `/image/upload/${postId}/graphic`,
        formData
      );

      setError(undefined);

      setIsMakingRequest(false);

      toast("Sucessfully uploaded post's graphic");

      return fileUrl;
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const uploadPostHashtags = async (postId: number, hashtags: string[]) => {
    try {
      setIsMakingRequest(true);

      await api.post(`/hashtags/${postId}/create`, { hashtags });

      setError(undefined);

      setIsMakingRequest(false);

      toast("Sucessfully uploaded post's hashtags");
    } catch (error: any | AxiosError) {
      setIsMakingRequest(false);
      if (axios.isAxiosError(error)) {
        const errorMessage: ErrorReponse = error.response?.data;

        setError(errorMessage ? errorMessage.message : undefined);
      }
    }
  };

  const value = useMemo(
    () => ({
      uploadPost,
      isMakingRequest,
      error,
      uploadPostGraphic,
      uploadPostHashtags,
      posts,
    }),
    [
      uploadPost,
      isMakingRequest,
      setIsMakingRequest,
      error,
      setError,
      uploadPostGraphic,
      uploadPostHashtags,
      posts,
      setPosts,
    ]
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};
