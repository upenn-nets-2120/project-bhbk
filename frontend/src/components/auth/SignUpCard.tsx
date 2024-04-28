"use client";

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
import { BsInstagram } from "react-icons/bs";
import { useEffect, useState } from "react";
import { DatePicker } from "../common/forms/DatePicker";
import { MdAppRegistration, MdError } from "react-icons/md";
import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import { AiOutlineLoading } from "react-icons/ai";

export const signUpCardGraphicSize = 40;

export const signUpRegisterGraphicSize = 18;

export const SignUpCard = () => {
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [affiliation, setAffiliation] = useState<string>();
  const [dob, setDob] = useState<Date>();
  const {
    setUser,
    registerUser,
    error: userError,
    isMakingRequest,
  } = useUser();
  const [error, setError] = useState<string>();
  const isMissingFields =
    !username ||
    !email ||
    !firstName ||
    !lastName ||
    !password ||
    !affiliation ||
    !dob;

  useEffect(() => {
    if (isMissingFields) {
      return;
    }

    setError(undefined);

    const newUser: User = {
      username,
      email,
      firstName,
      lastName,
      password,
      dob,
      affiliation,
    };

    setUser(newUser);
  }, [username, email, firstName, lastName, password, affiliation, dob]);

  const signUp = async () => {
    if (isMissingFields) {
      setError("Missing fields, please fill out all details");
      return;
    }

    await registerUser();
  };

  return (
    <Card className="w-[80%] md:w-[500px]">
      <CardHeader className="flex items-center text-center">
        <BsInstagram size={signUpCardGraphicSize} className="text-primary" />
        <CardTitle>Welcome to InstaLite!</CardTitle>
        <CardDescription>
          Sign up to join the InstaLite community
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-6">
        <form>
          <div className="grid w-full grid-cols-1 md:grid-cols-2 items-center gap-4">
            <InputForm
              setValue={setUsername}
              label="Username"
              placeholder="Your username..."
            />
            <InputForm
              setValue={setEmail}
              label="Email"
              placeholder="Your email..."
            />
            <InputForm
              setValue={setFirstName}
              label="First name"
              placeholder="Your first name..."
            />
            <InputForm
              setValue={setLastName}
              label="Last name"
              placeholder="Your last name..."
            />
            <InputForm
              setValue={setPassword}
              label="Password"
              placeholder="Keep this safe!"
            />
            <InputForm
              setValue={setAffiliation}
              label="Affiliation"
              placeholder="e.g Upenn..."
            />
            <DatePicker
              date={dob}
              setDate={setDob}
              label="Your Date of Birth"
              placeholder="Your DOB..."
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between flex-col space-y-2">
        <Button disabled={isMakingRequest} className="w-full" onClick={signUp}>
          <div className="flex space-x-1 items-center">
            <span>Register</span>
            {isMakingRequest ? (
              <AiOutlineLoading className="animate-spin" />
            ) : (
              <MdAppRegistration size={signUpRegisterGraphicSize} />
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
