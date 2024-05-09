"use client";

import { FriendOption } from "@/components/friends/FriendOption";
import { Post } from "@/components/post/Post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { Post as PostType } from "@/types/post";
import { User } from "@/types/user";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { HiSparkles } from "react-icons/hi2";
import { MdManageSearch } from "react-icons/md";
import { RiSearchEyeLine } from "react-icons/ri";
import { InputForm } from "../forms/InputForm";

export const searchBarGraphicSize = 14;

export const SearchBar = () => {
  const [query, setQuery] = useState<string>();
  const [userResults, setUserResults] = useState<User[]>([]);
  const [postResults, setPostResults] = useState<PostType[]>([]);
  const [aiResponse, setAiResponse] = useState<string>();

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const onSearch = async () => {
    setIsMakingRequest(true);
    const { data: llmReponse } = await api.post("/search/llmsearch", { query });
    const { data: searchUsers } = await api.post("/search/directUserSearch", {
      query,
    });
    const { data: searchPosts } = await api.post("/search/directPostSearch", {
      query,
    });
    setUserResults(searchUsers);
    setPostResults(searchPosts);
    setAiResponse(llmReponse);
    setIsMakingRequest(false);
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full flex-1" asChild>
        <div className="w-full flex-1">
          <button className="inline-flex items-center text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-3 py-1 relative h-8 w-full justify-start rounded-[0.5rem] bg-background font-normal text-muted-foreground shadow-none sm:pr-12">
            <span className="hidden lg:inline-flex">
              Search users, posts...
            </span>
            <span className="inline-flex lg:hidden">Search...</span>
            <div className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <MdManageSearch size={searchBarGraphicSize} />
            </div>
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="w-full min-w-[90%] md:min-w-[60%] max-h-[600px] overflow-scroll">
        <DialogHeader>
          <DialogTitle>Search for users, posts and everything!</DialogTitle>
          <DialogDescription>
            Type your search query for AI-powered results
          </DialogDescription>
        </DialogHeader>
        <InputForm
          label="Input your search query"
          placeholder="Search across InstaLite..."
          value={query}
          setValue={setQuery}
        />
        <Button
          disabled={!query || query.length <= 0 || isMakingRequest}
          className="flex space-x-2"
          onClick={onSearch}
        >
          <span>Search</span>
          {isMakingRequest ? (
            <AiOutlineLoading className="animate-spin" />
          ) : (
            <RiSearchEyeLine />
          )}
        </Button>
        {aiResponse && (
          <>
            <div className="py-2" />
            <div className="flex text-white bg-primary px-2 py-4 rounded-md space-x-2">
              <HiSparkles size={50} />
              <div className="text-sm prose whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          </>
        )}
        {userResults.length > 0 && (
          <>
            <div className="py-2" />
            <div className="text-primary">
              User results: {userResults.length} found
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border border-primary">
              <div className="flex w-max space-x-4 p-4">
                {userResults.map((user, index) => (
                  <div className="border rounded-md">
                    <FriendOption
                      key={user?.username || index}
                      user={user}
                      noSep
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </>
        )}
        {postResults.length > 0 && (
          <>
            <div className="py-2" />
            <div className="text-primary">
              Post results: {postResults.length} found
            </div>
            <ScrollArea className="w-full rounded-md border border-primary">
              <div className="flex flex-col w-full space-x-4 p-4 items-center">
                {postResults.map((post) => (
                  <Post className="w-full" {...post} />
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
