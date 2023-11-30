import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export interface TextChunk {
  content: string;
  metadata: { position: number };
}
export const chunkText = async (
  text: string,
  maxChars: number
): Promise<TextChunk[]> => {
  let charSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: maxChars,
    chunkOverlap: 0,
    separators: ["\n\n", "\n", ".", "?", "!", ",", ";", " "],
  });
  let chunks = await charSplitter.splitText(text);
  let docs = chunks.map((chunk, index) => ({
    content: chunk,
    metadata: {
      position: index,
    },
  }));
  return docs;
};
