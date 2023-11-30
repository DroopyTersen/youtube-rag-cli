import { UseChatOptions } from "ai";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

export type ChatScreenOptions = UseChatOptions & {
  autoFocus?: boolean;
};
export function useChatScreen({
  api = "",
  initialMessages = [],
  autoFocus = false,
  ...rest
}: ChatScreenOptions) {
  const hasMountedRef = useRef(false);
  let textAreaRef = useRef<HTMLTextAreaElement>(null);
  let messagesContainerRef = useRef<HTMLDivElement>(null);
  let hasLoadedOnce = useRef(false);

  const { isLoading, ...chat } = useChat({
    initialMessages: initialMessages,
    api,
    headers: {
      "Content-Type": "application/json",
    },
    ...rest,
  });

  useEffect(() => {
    if (isLoading && !hasLoadedOnce?.current) {
      hasLoadedOnce.current = true;
    }
    if (isLoading) {
      textAreaRef.current?.focus();
      // scroll to the textarea
      textAreaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      messagesContainerRef?.current?.scrollTo({
        top: messagesContainerRef?.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [isLoading, chat?.messages]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);
  return {
    ...chat,
    messagesContainerRef,
    isLoading,
    textAreaRef,
  };
}
