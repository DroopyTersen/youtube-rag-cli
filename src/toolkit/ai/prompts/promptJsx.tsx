import he from "he";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { z } from "zod";

export const ChatMessageSchema = z.object({
  role: z.union([
    z.literal("user"),
    z.literal("assistant"),
    z.literal("function"),
    z.literal("system"),
  ]),
  name: z.string().optional().describe("Used to provide the function name"),
  content: z.string().min(1, "You must provide at lease some content"),
});
const ChatMessagesSchema = z.array(ChatMessageSchema);
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type MessageRole = ChatMessage["role"];

interface MessageProps {
  children: React.ReactNode | React.ReactNode[];
  role: MessageRole;
  name?: string;
}

interface MessageComponent extends React.FC<MessageProps> {
  System: typeof SystemMessage;
  FunctionResult: typeof FunctionMessage;
  User: typeof UserMessage;
  Assistant: typeof AssistantMessage;
  Conversation: typeof Conversation;
  renderMessages: typeof renderMessages;
}

export const Message: MessageComponent = ({ children, role, name }) => {
  // Process children
  let processedChildren =
    React.Children.map(children, (child) => {
      // If child is a React element, render it to a string
      if (child && React.isValidElement(child)) {
        return renderToStaticMarkup(child);
      }
      // If child is a string or number, return it as is
      return child;
    })
      ?.filter(Boolean)
      .join("") || "";

  return (
    JSON.stringify({
      role: role,
      content: processedChildren,
      name,
    }) + ",\n"
  );
};
export const SystemMessage: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  return Message({ children, role: "system" });
};
Message.System = SystemMessage;

export const FunctionMessage: React.FC<{
  children: any;
  name: string;
}> = ({ children, name }) => {
  return Message({
    children:
      typeof children === "string"
        ? children
        : JSON.stringify(children, null, 2),
    role: "function",
    name,
  });
};
Message.FunctionResult = FunctionMessage;

export const UserMessage: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  return Message({ children, role: "user" });
};
Message.User = UserMessage;
export const AssistantMessage: React.FC<{
  children: React.ReactNode | React.ReactNode[];
}> = ({ children }) => {
  return Message({ children, role: "assistant" });
};
Message.Assistant = AssistantMessage;

export const Conversation: React.FC<{ messages?: ChatMessage[] }> = ({
  messages = [],
}) => {
  return messages.map((message, index) => (
    <Message key={index} role={message.role}>
      {message.content}
    </Message>
  ));
};
Message.Conversation = Conversation;

export function renderMessages(
  parent: React.ReactElement<any, string | React.JSXElementConstructor<any>>
) {
  let messageStr = "";

  try {
    messageStr = renderToStaticMarkup(parent);
    messageStr = he.decode(messageStr);
    // console.log("🚀 ~ --- START ----");
    // console.log(messageStr);
    // console.log("🚀 ~ --- END ----");
    // Remove the trailing comma on the last item
    let stringToParse = messageStr.replace(/,\n\s*$/, "");
    let messages = JSON.parse(`[ ${stringToParse}\n ]`);
    return ChatMessagesSchema.parse(messages);
  } catch (err) {
    console.error("Unable to render messages", err);
    console.log("🚀 | messageStr:", messageStr);
    throw err;
  }
}

Message.renderMessages = renderMessages;
