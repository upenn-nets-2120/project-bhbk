"use client";

import { useUser } from "@/providers/UserProvider";
import { MdLogout } from "react-icons/md";
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

export const Settings = () => {
  const { logOutUser } = useUser();

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
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pick-interests">
              <AccordionTrigger className="text-primary text-md">
                Pick your interests
              </AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
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
