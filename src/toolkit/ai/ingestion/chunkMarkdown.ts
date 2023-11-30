import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  MarkdownHeaderTextSplitter,
  type Document,
} from "./MarkdownHeaderTextSplitter";

export interface ChunkMarkdownOptions {
  /** The maximum number of characters per chunk */
  maxChars?: number;
  /** Include the headings path at the beginning of the chunk text */
  prependHeadings?: boolean;
}
const DEFAULT_OPTIONS: ChunkMarkdownOptions = {
  prependHeadings: true,
  maxChars: 800,
};
export const chunkMarkdown = async (
  markdown: string,
  options?: ChunkMarkdownOptions
): Promise<Document[]> => {
  let mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const markdownSplitter = new MarkdownHeaderTextSplitter();
  let docs = markdownSplitter
    .splitText(markdown)
    .filter((doc) => doc.pageContent && !doc.pageContent.match(/^#+\s.*/gm));

  if (mergedOptions.maxChars) {
    let charSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: mergedOptions.maxChars,
      chunkOverlap: 0,
    });
    let newDocs = [];
    for (let doc of docs) {
      let chunks = await charSplitter.splitText(doc.pageContent);
      let newChunks = chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          position: index + "",
          ...doc.metadata,
        },
      }));
      newDocs.push(...newChunks);
    }
    docs = newDocs;
  }

  if (mergedOptions.prependHeadings) {
    docs = docs.map((doc) => ({
      ...doc,
      pageContent: `${doc.metadata?.headingPath}\n${doc.pageContent}`,
    }));
  }

  return docs;
};
