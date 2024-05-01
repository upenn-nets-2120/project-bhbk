"use client";

import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import React, { useEffect, useState } from "react";
import { DatePicker } from "../common/forms/DatePicker";
import { InputForm } from "../common/forms/InputForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { isEqual } from "lodash";
import { Button } from "../ui/button";
import { MdError, MdUpdate } from "react-icons/md";
import { AiOutlineLoading } from "react-icons/ai";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Hashtag } from "@/lib/hashtag";

const processUser = (user?: Partial<User>) => {
  const processedUser = { ...user };
  if (processedUser.dob) {
    processedUser.dob = new Date(processedUser.dob);
    processedUser.dob.setHours(0, 0, 0);
  }

  return processedUser;
};

export const ProfileDetails = () => {
  const {
    user,
    updateUser,
    refreshUser,
    isMakingRequest,
    error: userError,
    uploadProfilePic,
  } = useUser();

  const [username, setUsername] = useState<string | undefined>(user?.username);
  const [password, setPassword] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>(user?.email);
  const [firstName, setFirstName] = useState<string | undefined>(
    user?.firstName
  );
  const [lastName, setLastName] = useState<string | undefined>(user?.lastName);
  const [affiliation, setAffiliation] = useState<string | undefined>(
    user?.affiliation
  );
  const [dob, setDob] = useState<Date | undefined>(user?.dob);

  const [profilePic, setProfilePic] = useState<File>();

  const [previewUrl, setPreviewUrl] = useState<string>();

  const [updatedUser, setUpdatedUser] = useState<Partial<User> | undefined>(
    user
  );

  const isMissingFields =
    !username || !email || !firstName || !lastName || !affiliation || !dob;

  const isUpdatingUser =
    !isEqual(processUser(user), processUser(updatedUser)) || profilePic;

  useEffect(() => {
    if (isMissingFields) {
      return;
    }

    const newUser: User = {
      username,
      email,
      firstName,
      lastName,
      dob,
      affiliation,
      ...(password && {
        password,
      }),
    };

    setUpdatedUser({ ...user, ...newUser });
  }, [
    username,
    email,
    firstName,
    lastName,
    affiliation,
    dob,
    profilePic,
    password,
  ]);

  const updateUserDetails = async () => {
    if (updatedUser) {
      await updateUser(updatedUser);
      setPassword(undefined);
      await refreshUser();
    }

    if (profilePic) {
      await uploadProfilePic(profilePic);
      await refreshUser();
      setProfilePic(undefined);
    }

    setPreviewUrl(undefined);
  };

  const onProfilePicChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files?.length > 0) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        setProfilePic(file);
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:space-y-2">
        <div className="text-primary text-2xl md:text-[2rem] font-semibold">
          Welcome, {user?.username}!
        </div>
        <div className="text-foreground text-sm text-opacity-40">
          Manage your user profile here.
        </div>
      </div>
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle>⚙️ Your user details</CardTitle>
          <CardDescription>Update your user details</CardDescription>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <form>
            <div className="grid w-full grid-cols-1 md:grid-cols-2 items-center gap-4">
              <InputForm
                setValue={setUsername}
                label="Username"
                placeholder="Your username..."
                value={username}
                disabled
              />
              <InputForm
                setValue={setEmail}
                label="Email"
                placeholder="Your email..."
                value={email}
              />
              <InputForm
                setValue={setFirstName}
                label="First name"
                placeholder="Your first name..."
                value={firstName}
              />
              <InputForm
                setValue={setLastName}
                label="Last name"
                placeholder="Your last name..."
                value={lastName}
              />
              <InputForm
                setValue={setAffiliation}
                label="Affiliation"
                placeholder="e.g Upenn..."
                value={affiliation}
              />
              <DatePicker
                date={dob}
                setDate={setDob}
                label="Your Date of Birth"
                placeholder="Your DOB..."
              />
              <InputForm
                setValue={setPassword}
                label="Change your password"
                placeholder="Your new password..."
                value={password}
              />
              <InputForm
                type="file"
                label={
                  user?.profileUrl
                    ? "Change your profile pic"
                    : "Upload your profile pic"
                }
                placeholder="Upload your profile picture..."
                inputProps={{
                  onChange: onProfilePicChange,
                  accept: "image/*",
                }}
              />
              {previewUrl && (
                <div className="flex space-y-2 flex-col">
                  <Label>Preview your updated profile pic</Label>
                  <Avatar className="border-2 border-primary w-12 h-12">
                    <AvatarImage src={previewUrl} />
                  </Avatar>
                </div>
              )}
              {user && user?.profileUrl && (
                <div className="flex space-y-2 flex-col">
                  <Label>Your current profile pic</Label>
                  <Avatar className="border-2 border-primary w-12 h-12">
                    <AvatarImage src={user.profileUrl} />
                  </Avatar>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex space-x-2">
            <Button
              onClick={updateUserDetails}
              className="flex items-center text-sm space-x-2"
              disabled={!isUpdatingUser}
            >
              {isMakingRequest ? (
                <AiOutlineLoading className="animate-spin" />
              ) : (
                <MdUpdate />
              )}
              <span>Update details</span>
            </Button>
            {userError && (
              <div className="bg-red-500 w-full items-center justify-center text-sm rounded-md text-background px-4 py-2 flex space-x-2">
                <MdError />
                <span>{userError}</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
