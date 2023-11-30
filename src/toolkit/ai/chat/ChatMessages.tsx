import { motion } from "framer-motion";
import Markdown from "markdown-to-jsx";
import React, { useEffect, useRef } from "react";
import { CopyToClipboardButton } from "~/toolkit/components/buttons/CopyToClipboardButton";
import { cn } from "~/toolkit/components/utils";
export const ChatMessages = React.memo(function ChatMessages({
  messages,
  className = "",
  isStreaming = false,
}: {
  messages: { role: string; content: string }[];
  className?: string;
  isStreaming?: boolean;
}) {
  let isInititialRef = useRef(true);
  useEffect(() => {
    isInititialRef.current = false;
  }, []);
  return messages.map((m, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.95, y: m.role === "user" ? 20 : -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.15,
        y: {
          duration: 0.2,
          type: "spring",
          bounce: 0.25,
        },
        opacity: {
          duration: 0.25,
          type: "tween",
          ease: "easeOut",
        },
        delay: isInititialRef?.current ? index * 0.15 : 0.25,
      }}
      className={cn("", className)}
    >
      <ChatMessage
        isStreaming={isStreaming && index === messages?.length - 1}
        role={m.role}
      >
        {m.content}
      </ChatMessage>
    </motion.div>
  ));
});

function AIAvatar() {
  return (
    <MessageAvatar role={"assistant"}>
      <span>AI</span>
    </MessageAvatar>
  );
}

function UserAvatar() {
  return (
    <MessageAvatar role={"user"}>
      <span>ME</span>
    </MessageAvatar>
  );
}

export function ChatMessage({
  children,
  role,
  className = "",
  isStreaming = false,
}: {
  className?: string;
  children: string;
  role: string;
  isStreaming?: boolean;
}) {
  if (role === "assistant") {
    return (
      <div className="mb-4 rounded-xl bg-base-200 px-2 py-6 sm:px-4 w-full">
        <div className="flex gap-4">
          <AIAvatar />

          <div className="prose prose-sm whitespace-pre-wrap [&>*>*:first-child]:mt-0 ">
            <Markdown>{children}</Markdown>
          </div>
        </div>
        <div className="flex justify-center">
          {!isStreaming && (
            <CopyToClipboardButton
              markdown={children}
              className="opacity-80 hover:opacity-100 btn-sm"
            />
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-4 flex rounded-xl px-2 py-6 sm:px-4 w-full border">
      <UserAvatar />

      <div className="flex max-w-3xl items-center rounded-xl ml-3">
        <div className={`prose prose-sm whitespace-pre-wrap`}>
          <Markdown>{children}</Markdown>
        </div>
      </div>
    </div>
  );
}

function MessageAvatar({
  children,
  role,
}: {
  role: string;
  children: React.ReactNode;
}) {
  let bgColor = role === "assistant" ? "bg-neutral" : "bg-primary/10";
  let textColor = role === "assistant" ? "text-white" : "text-primary";

  return (
    <div className="avatar placeholder">
      <div className={`w-10 h-10 rounded-full ${bgColor} ${textColor}`}>
        {children}
      </div>
    </div>
  );
}
