import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "~/toolkit/components/forms";
import { ChatScreenProps } from "./Chat.types";
export function ChatMessageInput({
  handleSubmit,
  input,
  handleInputChange,
  inputRef,
  placeholder = "Enter your message...",
  autoFocus = false,
}: {
  handleSubmit?: ChatScreenProps["handleSubmit"];
  input?: ChatScreenProps["input"];
  placeholder?: string;
  handleInputChange?: ChatScreenProps["handleInputChange"];
  inputRef?: ChatScreenProps["textAreaRef"];
  autoFocus?: boolean;
}) {
  const [height, setHeight] = useState(60);
  let textAreaRef = useRef<HTMLTextAreaElement>(inputRef?.current ?? null);

  const updateHeight = (newHeight?: number) => {
    if (textAreaRef.current) {
      // Temporarily set height to 'auto' to allow scrollHeight to shrink
      // textAreaRef.current.style.height = "auto";
      // Set the height to the scrollHeight
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };
  useEffect(() => {
    updateHeight();
  }, []);
  // useEffect(() => {
  //   if (textAreaRef.current) {
  //     // Apply the height state to the textarea's style
  //     textAreaRef.current.style.height = `${height}px`;
  //   }
  // }, [height]);

  useEffect(() => {
    updateHeight();
  }, [input]);
  return (
    // <motion.div initial={false} layout="position" className="">
    <form onSubmit={handleSubmit} className="mt-2">
      <label htmlFor="chat-input" className="sr-only">
        Enter your prompt
      </label>
      <div className="relative flex items-center">
        <Textarea
          ref={textAreaRef as any}
          id="chat-input"
          className="block w-full resize-none rounded-xl p-4 text-sm shadow-sm min-h-[54px] focus:textarea-primary pr-24"
          placeholder={placeholder}
          required
          autoFocus={autoFocus}
          value={input}
          rows={1}
          onChange={(e) => {
            if (handleInputChange) {
              handleInputChange(e);
            }
            updateHeight();
          }}
          // style={{ height: height + "px", minHeight: "60px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              // trigger a form submission on the parent form
              e.preventDefault();
              handleSubmit?.(e as any);
            }
          }}
        ></Textarea>
        <button
          type="submit"
          className="absolute top-2 bottom-2 right-2 btn btn-primary h-auto min-h-0"
        >
          Send <span className="sr-only">Send message</span>
        </button>
      </div>
    </form>
    // </motion.div>
  );
}

export function ChatMessageInput2({
  handleSubmit,
  input,
  handleInputChange,
  textAreaRef,
  autoFocus = false,
}: {
  handleSubmit: ChatScreenProps["handleSubmit"];
  input: ChatScreenProps["input"];
  handleInputChange: ChatScreenProps["handleInputChange"];
  textAreaRef: ChatScreenProps["textAreaRef"];
  autoFocus?: boolean;
}) {
  const [height, setHeight] = useState(100);

  const updateHeight = (newHeight?: number) => {
    if (textAreaRef.current) {
      setHeight(newHeight || textAreaRef?.current?.scrollHeight);
    }
  };

  useEffect(() => {
    if (input) {
      updateHeight();
    } else {
      updateHeight(100);
    }
  }, [input]);
  return (
    <motion.div
      initial={false}
      layout="position"
      className="grid gap-x-2 grid-cols-1  md:grid-cols-[48px_1fr_48px]"
    >
      <form onSubmit={handleSubmit} className="mt-4 md:col-start-2">
        <div className="space-y-2">
          <label>
            <Textarea
              className="text-base"
              autoFocus={autoFocus}
              value={input}
              onChange={handleInputChange}
              style={{ height: height + "px", minHeight: "100px" }}
              ref={textAreaRef as any}
              required
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  // trigger a form submission on the parent form
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
          </label>
          <div className="flex flex-row-reverse justify-start w-full gap-3">
            <button className="btn btn-primary" type="submit">
              Answer
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

export function MicrophoneButton() {
  return (
    <button
      type="button"
      className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-secondary"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        stroke-width="2"
        stroke="currentColor"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z"></path>
        <path d="M5 10a7 7 0 0 0 14 0"></path>
        <path d="M8 21l8 0"></path>
        <path d="M12 17l0 4"></path>
      </svg>
      <span className="sr-only">Use voice input</span>
    </button>
  );
}
