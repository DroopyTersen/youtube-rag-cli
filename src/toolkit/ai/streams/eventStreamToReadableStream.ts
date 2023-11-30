import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";

export const parseOpenAIData = (data: string) => {};

export const eventStreamToReadableStream = (res: Response) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;
  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event?.type === "event") {
          const data = event.data;
          // console.log("🚀 | onParse | data", data);
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0]?.delta?.content || "";
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            console.log("🚀 | onParse | error", e);
            controller.error(e);
          }
        }
      }
      console.log("🚀 | streamChatCompletion | status", res.status);
      if (!res.ok) {
        let errorBody = await res.text();
        let errorMessage = `Error: OpenAI ChatCompletion failed with status ${res.status} and message ${errorBody}`;
        throw new Error(errorMessage);
      }
      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        // console.log("🚀 | forawait | chunk", decoder.decode(chunk));
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
