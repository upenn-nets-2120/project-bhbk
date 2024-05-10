"use client";

import { fetcher } from "@/lib/api";
import { usePosts } from "@/providers/PostsProvider";
import { Post } from "./Post";
import InfiniteScroll from "react-swr-infinite-scroll";
import useSWRInfinite from "swr/infinite";
import { useEffect } from "react";
import { Post as PostType } from "@/types/post";
import { useUser } from "@/providers/UserProvider";

export const PAGE_SIZE = 3;

export const Feed = () => {
  const { posts } = usePosts();

  const { isLoggedIn } = useUser();

  const getKey = (pageIndex: number, prevPageData: PostType[]) => {
    return `/posts/blended/paginate?pageSize=${PAGE_SIZE}&page=${
      pageIndex + 1
    }`;
  };

  const swr = useSWRInfinite<PostType[]>(getKey, fetcher, {
    parallel: true,
  });

  // const swrRecs = useSWRInfinite<PostType[]>(getKeyRecs, fetcher, {
  //   parallel: true,
  // });

  return (
    <div className="flex flex-col space-y-10">
      {/* {isLoggedIn && (
        <InfiniteScroll
          loadingIndicator="Loading..."
          endingIndicator="No more issues! 🎉"
          swr={swrRecs}
          isReachingEnd={(swr) =>
            swr.data?.[0]?.length === 0 ||
            swr.data?.[swr.data?.length - 1]?.length < PAGE_SIZE
          }
        >
          {(response) => response.map((post) => <Post {...post} />)}
        </InfiniteScroll>
      )} */}
      <InfiniteScroll
        loadingIndicator="Loading..."
        endingIndicator="No more issues! 🎉"
        swr={swr}
        isReachingEnd={(swr) =>
          swr.data?.[0]?.length === 0 ||
          swr.data?.[swr.data?.length - 1]?.length < PAGE_SIZE
        }
      >
        {(response) => response.map((post) => <Post {...post} />)}
      </InfiniteScroll>
    </div>
  );
};
