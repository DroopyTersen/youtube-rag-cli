/**
 * Returns an instance of a stream and an enqueue function to add to the stream via onDelta callbacks
 * @param signal AbortSignal
 * @returns { stream, enqueue, close }
 */
export function createReadableStream(signal: AbortSignal) {
  let enqueue: (delta: string) => void = () => {};
  let close: (error?: any) => void = () => {};

  const stream = new ReadableStream<string>({
    async start(controller) {
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

      enqueue = (delta: string) => {
        if (!closed) {
          controller.enqueue(delta);
        }
      };
      signal.addEventListener("abort", close);
      if (signal.aborted) return close();
    },
  });

  return {
    stream,
    enqueue,
    close,
  };
}
