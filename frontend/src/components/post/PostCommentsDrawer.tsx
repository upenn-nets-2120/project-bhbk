import { api, fetcher } from "@/lib/api";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import useSWR from "swr";
import { TextareaForm } from "../common/forms/TextareaForm";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "../ui/drawer";
import { Comment } from "@/types/comment";
import { Avatar, AvatarImage } from "../ui/avatar";
import { useUser } from "@/providers/UserProvider";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { getRelativeTime } from "@feelinglovelynow/get-relative-time";
import { ScrollArea } from "../ui/scroll-area";
import { extractHashtags } from "@/lib/posts";
import { usePosts } from "@/providers/PostsProvider";

interface PostCommentsDrawerProps extends PropsWithChildren {
  id?: number;
  isPostVisible: boolean | null;
}

export const PostCommentsDrawer: FC<PostCommentsDrawerProps> = ({
  children,
  id,
  isPostVisible,
}) => {
  const [content, setContent] = useState<string>();

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);

  const { data: fetchedComments } = useSWR<Comment[]>(
    isPostVisible ? `posts/${id}/comments` : null,
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  const router = useRouter();

  const { isLoggedIn, user } = useUser();

  const { uploadPostHashtags } = usePosts();

  useEffect(() => {
    if (fetchedComments) {
      const addedComments = [...fetchedComments];
      addedComments.reverse();
      setComments(addedComments);
    }
  }, [fetchedComments]);

  const submitComment = async () => {
    if (!isLoggedIn) {
      router.push("/log-in");
      return;
    }
    if (content && content.trim().length > 0 && user) {
      const hashtags = extractHashtags(content);

      if (hashtags.length > 0 && id) {
        await uploadPostHashtags(id, hashtags);
      }

      setIsMakingRequest(true);
      await api.post(`/posts/${id}/comment`, { content });
      setComments([
        { content, author: user, createdAt: new Date().toString(), id: 1 },
        ...comments,
      ]);
      setIsMakingRequest(false);
      setContent("");
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-3xl pb-6">
        <DrawerHeader className="font-semibold">Comments</DrawerHeader>
        <div className="py-2 flex flex-col space-y-4 px-4">
          {comments.length === 0 && (
            <div className="w-full text-center text-primary">
              Be the first to comment!
            </div>
          )}
          <ScrollArea className="min-h-[100px] max-h-[450px] w-full overflow-y-scroll">
            {comments.map((comment, idx) => (
              <>
                <div key={idx} className="flex items-center space-x-2 py-2.5">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.profileUrl} />
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="font-semibold text-xs">
                      {comment.author.username} / {comment.author.affiliation}{" "}
                      <span className="text-[0.6rem] font-normal opacity-50">
                        / {getRelativeTime(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <div className="text-[0.8rem]">{comment.content}</div>
                  </div>
                </div>
                <Separator />
              </>
            ))}
          </ScrollArea>
        </div>
        <DrawerFooter className="pb-4">
          <TextareaForm
            textareaProps={{ className: "min-h-[80px]" }}
            label="Add comment"
            placeholder="Your comment..."
            setValue={setContent}
            value={content}
          />
          <div className="pt-1" />
          <Button
            className="flex space-x-2"
            disabled={isMakingRequest}
            onClick={submitComment}
          >
            {isMakingRequest ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <FaComment />
            )}
            <span>Add comment</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
