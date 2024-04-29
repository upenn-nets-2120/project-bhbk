"use client";

import { useEffect, useRef, useState } from "react";
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

  const previewImgRef = useRef<HTMLImageElement>(null);

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

  const submitPost = () => {};

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
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Create post</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
