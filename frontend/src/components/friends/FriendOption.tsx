"use client";

import { toast } from "@/lib/utils";
import { useUser } from "@/providers/UserProvider";
import { User } from "@/types/user";
import { FC, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import { BsPlusCircle } from "react-icons/bs";
import { FaUserCircle } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Toggle } from "../ui/toggle";
import { RiProgress8Line } from "react-icons/ri";
import { IoMdLogOut } from "react-icons/io";

interface FriendOptionProps {
  user: User;
}

export const FriendOption: FC<FriendOptionProps> = ({ user }) => {
  const {
    addFriend,
    friends,
    removeFriend,
    setFriends,
    user: loggedInUser,
    isLoggedIn,
  } = useUser();

  const friendsIdSet = new Set(friends.map((friend) => friend.id));

  const isSameUser = loggedInUser && loggedInUser.id == user.id;

  const [isMakingRequest, setIsMakingRequest] = useState(false);

  const isFriend = friendsIdSet.has(user.id);

  const handleFriend = async (pressed: boolean) => {
    if (!pressed && user.id) {
      setIsMakingRequest(true);
      await removeFriend(user.id);
      toast(`Unfriend ${user.username} successfully!`);
      setFriends((prevFriends: User[]) => {
        const newFriends = prevFriends.filter(
          (friend) => friend.id !== user.id
        );
        return newFriends;
      });

      setIsMakingRequest(false);
    }
    if (pressed && user.id) {
      setIsMakingRequest(true);
      await addFriend(user.id);
      toast(`Add ${user.username} as friend successfully!`);
      setFriends((prevFriends: User[]) => {
        const newFriends = [...prevFriends, user];
        return newFriends;
      });
      setIsMakingRequest(false);
    }
  };
  return (
    <>
      <div className="flex py-5 px-3 space-x-5 items-center justify-between w-full">
        <div className="flex space-x-3">
          <div className="flex items-center justify-center">
            {user.profileUrl ? (
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profileUrl} />
              </Avatar>
            ) : (
              <FaUserCircle className="h-9 w-9 text-primary" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-semibold text-sm flex space-x-1">
              <div>{user.username}</div>
              {user.isOnline ? (
                <div className="flex space-x-0.5 text-background px-1 rounded-full text-[0.6rem] items-center text-green-500">
                  <RiProgress8Line className="animate-pulse" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex space-x-0.5 text-background px-1 rounded-full text-[0.6rem] items-center text-red-500">
                  <IoMdLogOut />
                  <span>Inactive</span>
                </div>
              )}
            </div>
            <div className="opacity-60 text-xs">
              {user.affiliation}{" "}
              {user.linkedActor && <> / {user.linkedActor}</>}
            </div>
          </div>
        </div>
        <div className="flex">
          <Toggle
            onPressedChange={handleFriend}
            pressed={isFriend}
            className="flex space-x-2 text-primary data-[state=on]:text-white data-[state=on]:bg-red-500"
            disabled={isMakingRequest || isSameUser || !isLoggedIn}
          >
            {isMakingRequest && <AiOutlineLoading className="animate-spin" />}
            {!isMakingRequest &&
              (isFriend ? <MdOutlineDelete /> : <BsPlusCircle />)}
            <span className="inline data-[state=on]:hidden">
              {isFriend ? "Remove friend" : "Add friend"}
            </span>
          </Toggle>
        </div>
      </div>
      <Separator />
    </>
  );
};
