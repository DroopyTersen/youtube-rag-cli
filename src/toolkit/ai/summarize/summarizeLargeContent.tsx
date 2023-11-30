import { createTraceEvent } from "~/features/langfuse/langfuse.server";
import { AsyncReturnType } from "~/toolkit/utils/typescript.utils";
import { chatCompletion } from "../chatCompletion";

const CHUNK_SIZE = 10000;
const wait = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));
export type SummarizationResult = AsyncReturnType<typeof summarizeLargeContent>;

interface SummarizeLargeContentArgs {
  content: string;
  onDelta?: (delta: string) => void;
  summaryPrompt?: string;
  max_tokens?: number;
  temperature?: number;
  model?: string;
  /** Langfuse trace Id */
  traceId?: string;
}

export const summarizeLargeContent = async ({
  content,
  ...options
}: SummarizeLargeContentArgs) => {
  console.log("🚀 | options:", options);

  let traceEvent = options.traceId
    ? createTraceEvent(options.traceId, {
        name: "Summarize",
        input: {
          content,
          ...options,
        },
      })
    : null;

  let summary = await chatCompletion.call(
    [
      {
        role: "system",
        content: options.summaryPrompt || "You are an expert summarizer.",
      },
      {
        role: "user",
        content: "Please summarize this:\n" + content,
      },
    ],
    {
      model: options.model || "gpt-3.5-turbo-16k",
      temperature: options.temperature || 0,
      max_tokens: options.max_tokens || 600,
      onDelta: (delta) => {
        process.stdout.write(delta);
        if (options.onDelta) options.onDelta(delta);
      },
      logLLMCall: traceEvent
        ? (llmParams) => traceEvent!.logLLMCall(llmParams, "Generate Summary")
        : undefined,
    }
  );
  console.log("\n\n");

  if (traceEvent) {
    traceEvent.end(summary);
  }
  return {
    overallSummary: summary,
  };
};
