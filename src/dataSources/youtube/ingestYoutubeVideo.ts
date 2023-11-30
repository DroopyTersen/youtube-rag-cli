import { YoutubeLoader } from "langchain/document_loaders/web/youtube";
import { ChunkSearchDocument } from "../../azureSearch/chunksIndex.schema";
import { chunkText } from "../../toolkit/ai/ingestion/chunkText";
import { embedChunks } from "../../toolkit/ai/ingestion/embedder.service";
import { chunksIndexService } from "../../azureSearch/chunksIndex.service";
/**
 * Dependencies: langchain, youtube-transcript, youtubei.js
 */

export interface YoutubeVideoData {
  transcript: string;
  videoId: string;
  description: string;
  title: string;
  view_count: number;
  author: string;
}

export const ingestYoutubeVideo = async (youtubeVideoId: string) => {
  try {
    const data = await loadYoutubeVideo(youtubeVideoId);
    if (data) {
      let path = `./transcripts/youtube-${youtubeVideoId}.json`;
      console.log(`Writing to ${path}`);
      await Bun.write(path, JSON.stringify(data, null, 2));
    }
    let searchDocs = await chunkYoutubeData(data);
    let embeddingResults = await embedChunks(searchDocs.map((d) => d.content));
    let searchDocsWithEmbeddings = embeddingResults.map((result, i) => {
      return {
        ...searchDocs[i],
        embedding: result.embedding,
      };
    });
    console.log(
      "🚀 | Got embeddings for chunks:",
      searchDocsWithEmbeddings.length
    );
    console.log(
      "🚀 | Removing existing chunks for this data source:",
      youtubeVideoId
    );
    await chunksIndexService.removeByDataSourceId(youtubeVideoId);
    console.log("🚀 | Uploading new chunks");
    await chunksIndexService.uploadDocuments(searchDocsWithEmbeddings);
  } catch (err: any) {
    console.error("Error ingesting youtube video");
    console.log(err);
  }
};

export const loadYoutubeVideo = async (youtubeVideoId: string) => {
  const loader = YoutubeLoader.createFromUrl(
    `https://youtu.be/${youtubeVideoId}`,
    {
      language: "en",
      addVideoInfo: true,
    }
  );

  const docs = await loader.load();

  if (docs.length === 1) {
    return {
      videoId: youtubeVideoId,
      ...docs[0].metadata,
      transcript: docs[0].pageContent,
    } as YoutubeVideoData;
  } else {
    throw new Error(
      `Could not load video ${youtubeVideoId}. Docs.length = ${docs.length}`
    );
  }
};

export const chunkYoutubeData = async (
  youtubeVideo: YoutubeVideoData
): Promise<ChunkSearchDocument[]> => {
  let chunks = await chunkText(youtubeVideo.transcript, 800);
  let searchDocs = chunks.map((chunk) => {
    return {
      id: `${youtubeVideo.videoId}-${chunk.metadata.position}`,
      dataSourceId: youtubeVideo.videoId,
      dataSourceTitle: youtubeVideo.title,
      dataSourceType: "youtube",
      dataSourceAuthor: youtubeVideo.author,
      position: chunk.metadata.position,
      content: chunk.content,
      embedding: [],
      created_at: new Date(),
    } satisfies ChunkSearchDocument;
  });

  return searchDocs;
};
