"use client";

import { useUser } from "@/providers/UserProvider";
import { useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsInstagram } from "react-icons/bs";
import { MdAppRegistration, MdError } from "react-icons/md";
import { InputForm } from "../common/forms/InputForm";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export const logInCardGraphicSize = 40;

export const logInGraphicSize = 18;

export const LogInCard = () => {
  const [username, setUsername] = useState<string>();

  const [password, setPassword] = useState<string>();

  const [error, setError] = useState<string>();

  const { isMakingRequest, logInUser, error: userError } = useUser();

  const isMissingFields = !username || !password;

  const logIn = async () => {
    if (isMissingFields) {
      setError("Missing fields, please fill out all details");
      return;
    }

    await logInUser(username, password);
  };

  return (
    <Card className="w-[80%] md:w-[500px]">
      <CardHeader className="flex items-center justify-center text-center">
        <BsInstagram size={logInCardGraphicSize} className="text-primary" />
        <CardTitle>Welcome to InstaLite!</CardTitle>
        <CardDescription>Log in to enjoy InstaLite</CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <form>
          <div className="grid w-full grid-cols-1 items-center gap-4">
            <InputForm
              setValue={setUsername}
              label="Username"
              placeholder="Your username..."
            />
            <InputForm
              setValue={setPassword}
              label="Password"
              placeholder="Keep this safe!"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between flex-col space-y-2">
        <Button disabled={isMakingRequest} className="w-full" onClick={logIn}>
          <div className="flex space-x-1 items-center">
            <span>Log in</span>
            {isMakingRequest ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <MdAppRegistration size={logInGraphicSize} />
            )}
          </div>
        </Button>
        {error && (
          <div className="bg-red-500 w-full items-center justify-center text-sm rounded-md text-background px-4 py-2 flex space-x-2">
            <MdError />
            <span>{error}</span>
          </div>
        )}
        {userError && (
          <div className="bg-red-500 w-full items-center justify-center text-sm rounded-md text-background px-4 py-2 flex space-x-2">
            <MdError />
            <span>{userError}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
