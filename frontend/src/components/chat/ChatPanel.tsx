import { ChatFriends } from "./ChatFriends";
import { ChatWindow } from "./ChatWindow";

export const ChatPanel = () => {
  return (
    <div className="flex">
      <ChatFriends />
      <ChatWindow />
    </div>
  );
};
