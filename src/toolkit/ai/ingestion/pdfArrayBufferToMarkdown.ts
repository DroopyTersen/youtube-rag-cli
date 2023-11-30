// @ts-ignore - ignore the untyped 3rd party library
import pdf2md from "@opendocsg/pdf2md";

export const pdfArrayBufferToMarkdown = async (
  arrayBuffer: ArrayBuffer
): Promise<string> => {
  // @ts-ignore - ignore the untyped 3rd party library
  // const pdf2md = await import("@opendocsg/pdf2md");
  let markdown = await pdf2md(arrayBuffer);
  return markdown;
};
