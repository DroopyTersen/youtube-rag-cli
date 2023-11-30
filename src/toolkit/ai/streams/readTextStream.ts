export async function readTextStream(
  response: Response,
  onData: (chunk: string) => void
) {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = response.body;
  if (!data) {
    return;
  }
  try {
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      if (chunkValue) {
        onData(chunkValue);
      }
    }
  } catch (err) {
    console.error("🚀 | readTextStream err:", err);
    throw new Error("Unable to read response stream");
  }
}
