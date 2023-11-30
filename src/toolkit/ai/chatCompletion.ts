import OpenAI from "openai";
import { z } from "zod";
import { defineFunction } from "./prompts/defineFunction";
import { ChatMessage } from "./prompts/promptJsx";
import { createReadableStream } from "./streams/createReadableStream";
import { Prettify } from "../utils/typescript.utils";
// import { OpenAIClient } from "@azure/openai";

let azureOpenAI = new OpenAI({
  baseURL:
    process.env.AZURE_OPENAI_BASE_PATH +
    "/" +
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
  maxRetries: 2,
  defaultQuery: {
    "api-version": process.env.AZURE_OPENAI_API_VERSION,
  },
  defaultHeaders: {
    "api-key": process.env.AZURE_OPENAI_API_KEY,
    "content-type": "application/json",
  },
});
let openAIPromise = Promise.resolve(
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2 })
  // azureOpenAI
);
export type ChatParams = Prettify<OpenAI.Chat.ChatCompletionCreateParams>;
export type ChatMessageRole = OpenAI.Chat.ChatCompletionMessage["role"];
const LLM_DEFAULTS = {
  model: "gpt-4-1106-preview",
  temperature: 0.1,
  max_tokens: 800,
} satisfies Partial<ChatParams>;

/** Log function returns an "end" function to send the result */
export type LogLLMCall = (llmParams: ChatParams) => (result: any) => void;

export type ChatCompletionOptions = {
  signal?: AbortSignal;
  onDelta?: (delta: string) => void;
  logLLMCall?: LogLLMCall;
  // llmOptions?: Partial<ChatParams>;
} & Partial<ChatParams>;

export const chatCompletion = {
  call: async (
    messages: ChatMessage[],
    { signal, onDelta, logLLMCall, ...llmOptions }: ChatCompletionOptions = {}
  ) => {
    let openAI = await openAIPromise;
    let fullText = "";
    let functionName = "";
    let functionArgs = "";
    let validMessages = messages.filter(
      (message) => message.content !== undefined
    );
    const llmParams = {
      ...LLM_DEFAULTS,
      ...llmOptions,
      ...{ messages: validMessages },
      stream: true,
    } as ChatParams;
    // console.log("🚀 | llmParams:", JSON.stringify(llmParams, null, 2));

    let logOnComplete = logLLMCall ? logLLMCall(llmParams) : undefined;

    await openAI.chat.completions
      .create(llmParams)
      .then(async (openAIStream) => {
        for await (const part of openAIStream as any) {
          // Check if the signal is aborted
          if (signal?.aborted) {
            break;
          }
          let delta = "";
          if (part?.choices?.[0]?.delta?.function_call?.name) {
            functionName = part?.choices?.[0]?.delta?.function_call?.name;
            delta = functionName + "\n";
          } else if (part?.choices?.[0]?.delta?.function_call?.arguments) {
            delta = part?.choices?.[0]?.delta?.function_call?.arguments;
            functionArgs += delta;
          } else if (part?.choices?.[0]?.delta?.content) {
            delta = part?.choices?.[0]?.delta?.content;
          }
          if (delta) {
            if (onDelta) onDelta(delta);
            fullText += delta;
          }
        }
      });

    if (!fullText && functionName && functionArgs) {
      fullText = functionName + "\n" + functionArgs;
    }

    if (logOnComplete) {
      logOnComplete(fullText);
    }
    return fullText;
  },
  callFunction: async <TSchema extends z.ZodTypeAny>(
    messages: ChatMessage[],
    {
      name,
      schema,
    }: {
      name: string;
      schema: TSchema;
    },
    options?: {
      signal?: AbortSignal;
      onDelta?: (delta: string) => void;
      logLLMCall?: LogLLMCall;

      // llmOptions?: Partial<ChatParams>;
    } & Partial<ChatParams>
  ) => {
    let fullText = await chatCompletion.call(messages, {
      ...options,
      functions: [defineFunction(name, schema)],
      function_call: {
        name,
      },
    });
    // remove the first line which is the function name
    let jsonString = fullText.split("\n").slice(1).join("\n");
    try {
      let result = schema.parse(JSON.parse(jsonString));
      return result as z.infer<TSchema>;
    } catch (err) {
      console.log("Unable to parse args as the provded schema", jsonString);
    }
  },
  stream: (
    messages: ChatMessage[],
    {
      signal,
      ...options
    }: {
      signal: AbortSignal;
      onDelta?: (delta: string) => void;
      logLLMCall?: LogLLMCall;
    } & Partial<ChatParams>
  ) => {
    let {
      stream: readableStream,
      enqueue,
      close,
    } = createReadableStream(signal);

    chatCompletion
      .call(messages, {
        signal,
        onDelta: enqueue,
        ...options,
      })
      .then((result) => close());
    return readableStream;
  },
};
