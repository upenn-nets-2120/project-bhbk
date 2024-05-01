"use client";

import { extractHashtags } from "@/lib/posts";
import { usePosts } from "@/providers/PostsProvider";
import { Post } from "@/types/post";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsPlusCircleFill } from "react-icons/bs";
import { MdError } from "react-icons/md";
import { InputForm } from "../common/forms/InputForm";
import { TextareaForm } from "../common/forms/TextareaForm";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";

export const CreatePanel = () => {
  const [text, setText] = useState<string>();

  const [postGraphic, setPostGraphic] = useState<File>();

  const [hashtags, setHashtags] = useState<string[]>([]);

  const previewImgRef = useRef<HTMLImageElement>(null);

  const router = useRouter();

  const {
    uploadPost,
    isMakingRequest,
    uploadPostGraphic,
    uploadPostHashtags,
    error,
  } = usePosts();

  const onPostGraphicChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files?.length > 0) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        setPostGraphic(file);
      }
    }
  };

  useEffect(() => {
    if (previewImgRef.current && postGraphic) {
      previewImgRef.current.src = URL.createObjectURL(postGraphic);
    }
  }, [previewImgRef, postGraphic]);

  const submitPost = async () => {
    if (!text) {
      return;
    }

    if (text) {
      const newPost: Post = {
        text,
      };

      const createdPost = await uploadPost(newPost);

      setText(undefined);

      if (previewImgRef.current) {
        previewImgRef.current.src = "";
      }

      if (createdPost && createdPost.id && postGraphic) {
        await uploadPostGraphic(createdPost.id, postGraphic);
        setPostGraphic(undefined);
      }

      if (createdPost && createdPost.id && hashtags.length > 0) {
        await uploadPostHashtags(createdPost.id, hashtags);
        setHashtags([]);
      }

      router.push("/");
    }
  };

  useEffect(() => {
    if (!text) {
      return;
    }

    const extractedHashtags = extractHashtags(text);
    setHashtags(extractedHashtags);
  }, [text]);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:space-y-2">
        <div className="text-primary text-2xl md:text-[2rem] font-semibold">
          Create a new post
        </div>
        <div className="text-foreground text-sm text-opacity-40">
          Input details about your new post
        </div>
      </div>
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>⚙️ Post details</CardTitle>
          <CardDescription>Create your post details</CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <form>
            <div className="grid w-full grid-cols-1 items-center gap-4">
              <InputForm
                type="file"
                label="Post's graphic"
                placeholder="Upload your post graphic.."
                inputProps={{
                  onChange: onPostGraphicChange,
                  accept: "image/*",
                }}
              />
              {postGraphic && (
                <div className="flex flex-col items-center space-y-3">
                  <Label className="w-full text-left">
                    Preview post's graphic
                  </Label>
                  <img className="rounded-md max-w-[80%]" ref={previewImgRef} />
                </div>
              )}
              <TextareaForm
                setValue={setText}
                label="Post's content"
                placeholder="Your post's content..."
                value={text}
                textareaProps={{
                  className: "min-h-[200px]",
                }}
              />
              {hashtags.length > 0 && (
                <div className="flex flex-col items-center space-y-3">
                  <Label className="w-full text-left">
                    Preview post's hashtags
                  </Label>
                  <div className="flex w-full flex-wrap gap-2">
                    {hashtags.map((hashtag) => (
                      <div
                        key={hashtag}
                        className="text-sm px-3 py-2 rounded-full text-background bg-primary"
                      >
                        #{hashtag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-1">
          <Button
            onClick={submitPost}
            className="w-full flex space-x-2"
            disabled={isMakingRequest}
          >
            {isMakingRequest ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <BsPlusCircleFill />
            )}
            <span>Create post</span>
          </Button>
          {error && (
            <Button variant="destructive" className="w-full flex space-x-2">
              <MdError />
              <span>{error}</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
