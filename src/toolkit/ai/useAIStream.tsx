import { useState } from "react";
import { readTextStream } from "./streams/readTextStream";

export function useAIStream<TInputData = any>(apiPath: string) {
  const [streamedText, setStreamedText] = useState("");
  let [streamId, setStreamId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  let generate = async (input: TInputData) => {
    if (status === "loading") {
      console.log("Already streaming");
      return;
    }
    let fullStreamedText = "";
    console.log("Clearing streamed text");
    setStreamedText("");
    setStatus("loading");
    setStreamId(Date.now().toString());
    return readAIStream(apiPath, input, (chunk) => {
      if (chunk) {
        fullStreamedText += chunk;
        setStreamedText((prev) => {
          return prev + chunk;
        });
      }
    })
      .then(() => {
        console.log("🚀 | .then | streamedText:", fullStreamedText);
        setTimeout(() => {
          setStreamedText(fullStreamedText);
          setStatus("idle");
        }, 200);
        return fullStreamedText;
      })
      .catch((err) => {
        console.error("🚀 | generate | err:", err);
        alert("something went wrong");
        setStatus("error");
      });
  };

  return {
    id: streamId,
    streamText: streamedText,
    status,
    generate,
  };
}

export async function readAIStream(
  apiPath: string,
  input: any,
  onData: (chunk: string) => void
) {
  const response = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return readTextStream(response, onData);
}
