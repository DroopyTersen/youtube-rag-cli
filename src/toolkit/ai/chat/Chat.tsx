// import { BsCpuFill } from "react-icons/bs";
import { cn } from "~/toolkit/components/utils";
import { ChatMessageInput } from "./ChatMessageInput";
import { ChatMessages } from "./ChatMessages";
import { useChatScreen } from "./useChatScreen";

export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex-1 flex flex-col gap-4 text-sm leading-6 sm:text-base sm:leading-7"
      )}
    >
      {children}
    </div>
  );
}

export const Chat = {
  Layout: ChatLayout,
  Messages: ChatMessages,
  MessageInput: ChatMessageInput,
  useChat: useChatScreen,
};
