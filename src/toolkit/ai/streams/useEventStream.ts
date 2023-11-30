import { useEffect, useState } from "react";
import { readTextStream } from "./readTextStream";
// import { readTextStream } from "./readTextStream";
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
/**
 *
 * @param apiPath the api path to POST to
 * @returns
 */
export function useEventStream<TInputData = any>(
  apiPath: string,
  onEvent: (event: { event: string; data: string }) => void
) {
  let [streamId, setStreamId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  let generate = async (input: TInputData) => {
    setStatus("loading");
    setStreamId(Date.now().toString());
    await readEventStream(apiPath, input, onEvent).catch((err) => {
      console.error("🚀 | generate | err:", err);
      alert("something went wrong");
      setStatus("error");
    });
    setStatus("idle");
    return;
  };

  return {
    id: streamId,
    status,
    generate,
  };
}

const tryParseEventDataJson = (event: { event: string; data: string }) => {
  if (
    event?.data &&
    typeof event?.data === "string" &&
    (event.data.startsWith("{") || event.data.startsWith("["))
  ) {
    try {
      return JSON.parse(event.data);
    } catch (error) {
      console.error("🚀 | tryParseEventDataJson | error:", error);
      return event.data;
    }
  }
  return event.data;
};
export function useEventStreamEvents<TInputData = any, TEventData = any>(
  apiPath: string,
  processEventData: (event: {
    event: string;
    data: string;
  }) => TEventData = tryParseEventDataJson
) {
  let [events, setEvents] = useState<
    Array<{ event: string; data: TEventData }>
  >([]);
  let eventStream = useEventStream<TInputData>(apiPath, (event) => {
    // console.log("🚀 | onEvent:", event);
    setEvents((prevEvents) =>
      prevEvents.concat({
        event: event.event,
        data: processEventData(event),
      })
    );
  });
  useEffect(() => {
    if (eventStream.id) {
      setEvents([]);
    }
  }, [eventStream.id]);

  return {
    ...eventStream,
    events,
    setEvents,
  };
}

async function readEventStream(
  apiPath: string,
  input: any,
  onEvent: (event: { event: string; data: string }) => void
) {
  const response = await fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  let counter = 0;

  // let lastEventName = "";
  // const encoder = new TextEncoder();
  function onParseEvent(event: ParsedEvent | ReconnectInterval) {
    if (event?.type === "event") {
      try {
        const data = event.data;
        if (data === "[DONE]") {
          return;
        }
        const json = JSON.parse(data);
        let payload = { event: event.event || "message", data: json };
        // console.log("🚀 | onParseEvent | payload:", payload);
        onEvent(payload);
        counter++;
      } catch (e) {
        console.error("🚀 | onParse | error", e);
      }
    }
  }
  const parser = createParser(onParseEvent);

  return readTextStream(response, parser.feed);
}
