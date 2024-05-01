import { Post as PostType } from "@/types/post";
import { FC } from "react";
import { AiFillLike } from "react-icons/ai";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { FaComment, FaUserCircle } from "react-icons/fa";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaRegComment } from "react-icons/fa";
import { getRelativeTime } from "@feelinglovelynow/get-relative-time";

interface PostProps extends PostType {}

export const Post: FC<PostProps> = ({ text, author, imageUrl, createdAt }) => {
  const timeAgo = getRelativeTime(new Date(createdAt));
  return (
    <div className="flex border-2 px-3 py-5 border-muted rounded-md flex-col">
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
        <Button variant="outline" className="w-fit h-fit px-2 py-2">
          <BsHeart />
        </Button>
        <Button variant="outline" className="w-fit h-fit px-2 py-2">
          <FaRegComment />
        </Button>
      </div>
      <div className="py-2" />
      <div className="prose whitespace-pre-line prose-stone prose-sm sm:prose-base prose-pre:rounded-md prose-p:whitespace-pre-wrap prose-p:break-words w-full flex-1 leading-6 prose-p:leading-7 prose-pre:bg-[#282c34] max-w-full">
        <span className="font-semibold">{author?.username}</span> {text}
      </div>
      <div className="py-2" />
      <div className="w-full flex-1">
        <Button className="inline-flex items-center text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1 relative h-8 w-full justify-start rounded-[0.5rem] bg-background font-normal text-muted-foreground shadow-none sm:pr-12">
          <span>Add a comment...</span>
          <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <FaRegComment />
          </div>
        </Button>
      </div>
    </div>
  );
};
