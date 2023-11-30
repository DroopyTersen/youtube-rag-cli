interface SendFunctionArgs {
  /**
   * @default "message"
   */
  event?: string;
  data: string | Record<string, any> | Array<any>;
}

export interface SendEventStreamFunction {
  (args: SendFunctionArgs): void;
}

interface CleanupFunction {
  (): void;
}

interface InitFunction {
  (send: SendEventStreamFunction): CleanupFunction;
}

/**
 * Returns an instance of a stream and an send function add an event to the EventStream
 * @param signal AbortSignal
 * @returns { stream, send, close }
 */
export function createEventStream(signal: AbortSignal) {
  let send: SendEventStreamFunction = () => {};
  let close: (error?: any) => void = () => {};

  const stream = new ReadableStream({
    async start(controller) {
      let encoder = new TextEncoder();
      let closed = false;
      close = (error?: any) => {
        if (closed) return;
        closed = true;
        signal.removeEventListener?.("abort", close);
        if (error) {
          controller.error(error);
        } else {
          controller.close();
        }
      };

      send = ({ event = "message", data }: SendFunctionArgs) => {
        if (!closed) {
          let dataStr = typeof data === "string" ? data : JSON.stringify(data);
          controller.enqueue(encoder.encode(`event: ${event}\n`));
          controller.enqueue(encoder.encode(`data: ${dataStr}\n\n`));
        }
      };
      signal.addEventListener("abort", close);
      if (signal.aborted) return close();
    },
  });

  let response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
  return {
    response,
    send,
    // stream,
    close,
  };
}
