"use client";

import { api, fetcher } from "@/lib/api";
import { Hashtag } from "@/lib/hashtag";
import { toast } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { MdInterests, MdLogout, MdUpdate } from "react-icons/md";
import useSWR from "swr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export const Settings = () => {
  const {
    logOutUser,
    actorRecommendations,
    user,
    updateUser,
    isMakingRequest,
  } = useUser();
  const [selectedActor, setSelectedActor] = useState<string | undefined>(
    user?.linkedActor
  );

  const [interests, setInterests] = useState<string[]>([]);

  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);

  const { data: topHashtags } = useSWR<Hashtag[]>("/hashtags/top", fetcher, {
    refreshInterval: 5000,
  });

  const { data: userHashtags } = useSWR<Hashtag[]>(
    "/hashtags/interests",
    fetcher,
    {
      refreshInterval: 1000,
    }
  );

  const [hashtags, setHashtags] = useState<Hashtag[]>([]);

  const isNewActorSelected = user?.linkedActor !== selectedActor;

  const isNewInterestSelected =
    userHashtags &&
    userHashtags.map((hashtag) => hashtag.content).toString() !==
      interests.toString();

  const onActorChange = (value: string) => {
    setSelectedActor(value);
  };

  const linkToActor = async () => {
    if (isNewActorSelected && selectedActor) {
      await updateUser({
        linkedActor: selectedActor,
      });

      toast(
        `You are now linked to ${selectedActor}. A post about your link has been uploaded!`
      );
    }
  };

  const onInterestsChange = (values: string[]) => {
    if (values.length > 5) {
      return;
    }
    setInterests(values);
  };

  useEffect(() => {
    if (topHashtags) {
      setHashtags(topHashtags);
    }
  }, [topHashtags]);

  useEffect(() => {
    if (userHashtags) {
      const userInterests = userHashtags.map((hashtag) => hashtag.content);
      setInterests(userInterests);
    }
  }, [userHashtags]);

  const submitInterests = async () => {
    const interestsSet = new Set(interests);

    const selectedHashtags = hashtags.filter((hashtag) =>
      interestsSet.has(hashtag.content)
    );

    setIsUpdatingInterests(true);

    await api.post("/hashtags/interests", { hashtags: selectedHashtags });

    setIsUpdatingInterests(false);

    toast("Updated your interests");
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="text-primary text-2xl md:text-[2rem] font-semibold">
          Settings
        </div>
        <div className="text-foreground text-sm text-opacity-40">
          Manage your settings here
        </div>
      </div>
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>🔎 Your settings</CardTitle>
          <CardDescription>Update your user settings</CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="link-actor">
              <AccordionTrigger className="text-primary text-md">
                Link your account to an actor
              </AccordionTrigger>
              <AccordionContent>
                {user?.linkedActor && (
                  <div className="pb-3">
                    You are currently linked to{" "}
                    <span className="text-primary">{user.linkedActor}</span>
                  </div>
                )}
                <ToggleGroup
                  type="single"
                  onValueChange={onActorChange}
                  value={selectedActor}
                >
                  {actorRecommendations.length === 0 && (
                    <div>
                      Cannot find actors that looks similar to your profile pic.
                      Maybe change your profile pic?
                    </div>
                  )}
                  {actorRecommendations.map((recommedation) => (
                    <ToggleGroupItem
                      className="data-[state=on]:bg-primary data-[state=on]:text-background rounded-full"
                      key={recommedation}
                      value={recommedation}
                    >
                      {recommedation}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="py-3" />
                {isNewActorSelected && (
                  <Button
                    className="flex space-x-2"
                    onClick={linkToActor}
                    disabled={isMakingRequest}
                  >
                    {isMakingRequest ? (
                      <AiOutlineLoading className="animate-spin" />
                    ) : (
                      <MdUpdate />
                    )}
                    <span>Update linked actor</span>
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pick-interests">
              <AccordionTrigger className="text-primary text-md">
                Pick your top 5 interests
              </AccordionTrigger>
              <AccordionContent>
                <ToggleGroup
                  onValueChange={onInterestsChange}
                  className="w-full justify-start flex flex-wrap"
                  type="multiple"
                  value={interests}
                >
                  {hashtags.map((hashtag) => (
                    <ToggleGroupItem
                      value={hashtag.content}
                      className="data-[state=on]:bg-primary data-[state=on]:text-background rounded-full border-muted border-2"
                    >
                      {hashtag.content} | {hashtag.count} 📈
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="py-3" />
                {isNewInterestSelected && (
                  <Button onClick={submitInterests} className="flex space-x-2">
                    {isUpdatingInterests ? (
                      <AiOutlineLoading className="animate-spin" />
                    ) : (
                      <MdInterests />
                    )}
                    <span>Update your interests</span>
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              className="flex items-center space-x-2"
              onClick={logOutUser}
            >
              <MdLogout />
              <span>Log out</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
