"use client";

import { usePosts } from "@/providers/PostsProvider";
import { Post } from "./Post";

export const Feed = () => {
  const { posts } = usePosts();
  return (
    <div className="flex flex-col space-y-10">
      {posts.map((post) => (
        <Post {...post} />
      ))}
    </div>
  );
};
