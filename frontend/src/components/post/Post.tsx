import { Post as PostType } from "@/types/post";
import { FC, useEffect, useState } from "react";
import { AiFillLike } from "react-icons/ai";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FaComment, FaUserCircle } from "react-icons/fa";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaRegComment } from "react-icons/fa";
import { getRelativeTime } from "@feelinglovelynow/get-relative-time";
import { api, fetcher } from "@/lib/api";
import useSWR from "swr";
import useIsInViewport from "use-is-in-viewport";
import { User } from "@/types/user";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { PostLikesDrawer } from "./PostLikesDrawer";
import { PostCommentsDrawer } from "./PostCommentsDrawer";

interface PostProps extends PostType {}

export const Post: FC<PostProps> = ({
  text,
  author,
  imageUrl,
  createdAt,
  id,
}) => {
  const timeAgo = getRelativeTime(new Date(createdAt));

  const [isInViewport, targetRef] = useIsInViewport({ threshold: 50 });

  const [hasLiked, setHasLiked] = useState(false);

  const [likesCount, setLikesCount] = useState<number>(0);

  const { user } = useUser();

  const router = useRouter();

  const [likedUsers, setLikedUsers] = useState<User[]>([]);

  const { data: fetchedLikedUsers, isLoading } = useSWR<User[]>(
    isInViewport ? `/posts/${id}/liked-users` : null,
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  const likePost = async () => {
    if (!user) {
      router.push("/log-in");
      return;
    }

    if (id) {
      await api.post("/posts/like", { postId: id });
      setHasLiked(true);
      setLikedUsers([...likedUsers, user]);
      setLikesCount(likesCount + 1);
    }
  };

  const unlikePost = async () => {
    if (!user) {
      router.push("/log-in");
      return;
    }

    if (id) {
      await api.post("/posts/unlike", { postId: id });
      setHasLiked(false);
      setLikedUsers(likedUsers.filter((likedUser) => likedUser.id !== user.id));
      setLikesCount(likesCount - 1);
    }
  };

  useEffect(() => {
    if (fetchedLikedUsers) {
      setLikedUsers(fetchedLikedUsers);
    }
  }, [fetchedLikedUsers]);

  useEffect(() => {
    if (!user) {
      setHasLiked(false);
    }

    if (user) {
      setHasLiked(!!likedUsers.find((likedUser) => likedUser.id === user.id));
    }

    setLikesCount(likedUsers.length);
  }, [likedUsers]);

  return (
    <div
      className="flex border-2 px-3 py-5 border-muted rounded-md flex-col"
      ref={targetRef}
    >
      <div className="flex space-x-3 items-center">
        {author && author.profileUrl ? (
          <Avatar className="w-[35px] h-[35px]">
            <AvatarImage src={author?.profileUrl} />
          </Avatar>
        ) : (
          <FaUserCircle size={35} />
        )}
        <div className="flex flex-col">
          <div className="font-semibold text-[1rem]">{author?.username}</div>
          <div className="text-xs">
            {author?.affiliation}{" "}
            {author?.linkedActor && <>/ {author?.linkedActor}</>}
          </div>
        </div>
        <div className="bg-black/40 rounded-md h-[5px] w-[5px]" />
        <div className="text-xs">{timeAgo}</div>
      </div>
      <div className="py-3" />
      {imageUrl && (
        <>
          <div className="w-full flex justify-center rounded-lg border-muted border-2 overflow-hidden min-h-[200px] max-h-[600px]">
            <img className="max-w-full object-contain" src={imageUrl} />
          </div>
          <div className="py-3" />
        </>
      )}
      <div className="flex space-x-2">
        <Button
          onClick={hasLiked ? unlikePost : likePost}
          variant="outline"
          className="w-fit h-full px-2 py-2 flex space-x-1.5"
          disabled={isLoading}
        >
          {hasLiked ? <BsHeartFill className="text-primary" /> : <BsHeart />}
          {likesCount > 0 && <span className="text-xs">{likesCount}</span>}
        </Button>
        <PostCommentsDrawer id={id} isPostVisible={isInViewport}>
          <Button variant="outline" className="w-fit h-full px-2 py-2">
            <FaRegComment />
          </Button>
        </PostCommentsDrawer>
      </div>
      <div className="py-2" />
      {likedUsers && likedUsers.length > 0 && (
        <>
          <div className="flex text-xs">
            Liked by{" "}
            <span className="font-semibold inline-flex items-center space-x-1 px-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={likedUsers[0].profileUrl} />
              </Avatar>
              <span>{likedUsers[0].username}</span>
            </span>{" "}
            {likedUsers.length - 1 > 0 && (
              <>
                and{" "}
                <span className="font-semibold space-x-1 px-1">
                  <PostLikesDrawer likedUsers={likedUsers} />
                </span>
              </>
            )}
          </div>
          <div className="py-2" />
        </>
      )}
      <div className="prose whitespace-pre-line prose-stone prose-sm sm:prose-base prose-pre:rounded-md prose-p:whitespace-pre-wrap prose-p:break-words w-full flex-1 leading-6 prose-p:leading-7 prose-pre:bg-[#282c34] max-w-full">
        <span className="font-semibold">{author?.username}</span> {text}
      </div>
      <div className="py-2" />
      <div className="w-full flex-1">
        <PostCommentsDrawer id={id} isPostVisible={isInViewport}>
          <Button className="inline-flex items-center text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1 relative h-8 w-full justify-start rounded-[0.5rem] bg-background font-normal text-muted-foreground shadow-none sm:pr-12">
            <span>Add a comment...</span>
            <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <FaRegComment />
            </div>
          </Button>
        </PostCommentsDrawer>
      </div>
    </div>
  );
};
