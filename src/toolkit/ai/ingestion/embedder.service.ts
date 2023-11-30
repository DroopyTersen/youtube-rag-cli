import { OpenAIEmbeddings } from "langchain/embeddings/openai";

let embeddingsService = new OpenAIEmbeddings({
  stripNewLines: true,
  verbose: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
});
export const embedChunks = async (textChunks: string[]) => {
  let embeddings = await embeddingsService.embedDocuments(textChunks);
  let results: Array<{ content: string; embedding: number[] }> = [];
  for (var i = 0; i < textChunks.length; i++) {
    results.push({ content: textChunks[i], embedding: embeddings[i] });
  }
  return results;
};

export const embedText = async (text: string) => {
  let embeddings = await embeddingsService.embedDocuments([text]);
  return embeddings[0];
};
