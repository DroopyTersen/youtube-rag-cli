import { embedText } from "../toolkit/ai/ingestion/embedder.service";
import {
  ChunkSearchDocument,
  chunksIndexDefinition,
} from "./chunksIndex.schema";
import { searchService } from "./searchService";

interface ChunkSearchCriteria {
  standaloneQuestion: string;
  dataSourceType?: string;
  author?: string;
}

export const chunksIndexService = {
  recreateIndex: async () => {
    throw new Error("Not implemented");
  },
  ensureIndex: async () => {
    await searchService.ensureIndex(chunksIndexDefinition);
  },
  getByDataSourceId: async (dataSourceId: string) => {
    const client = searchService.createSearchClient<ChunkSearchDocument>(
      chunksIndexDefinition.name
    );
    let docs = await client.search(`dataSourceId:${dataSourceId}`, {
      queryType: "full",
      select: ["id"],
      includeTotalCount: true,
    });
    let items = [];
    if (!docs) return [];
    for await (let doc of docs.results) {
      items.push(doc.document);
    }
    return items;
  },
  removeByDataSourceId: async (dataSourceId: string) => {
    const client = searchService.createSearchClient<ChunkSearchDocument>(
      chunksIndexDefinition.name
    );
    let items = await chunksIndexService.getByDataSourceId(dataSourceId);

    if (items?.length) {
      console.log("deleting documents...");
      let deleteResult = await client.deleteDocuments(items as any);
      console.log(
        "🚀 | removeChunksByDataSourceId | deleteResult:",
        deleteResult
      );
    }
  },
  uploadDocuments: async (chunks: ChunkSearchDocument[]) => {
    return searchService.uploadDocuments(chunksIndexDefinition.name, chunks);
  },
  vectorSearch: async (criteria: ChunkSearchCriteria, maxResults = 5) => {
    let embeddedQuery = await embedText(criteria.standaloneQuestion);
    const client = searchService.createSearchClient<ChunkSearchDocument>(
      chunksIndexDefinition.name
    );
    let searchResponse = await client.search("*", {
      queryType: "semantic",
      top: maxResults,
      select: [
        "id",
        "dataSourceTitle",
        "content",
        "position",
        "dataSourceAuthor",
        "dataSourceId",
      ],
      semanticSearchOptions: {
        answers: {
          answerType: "extractive",
          count: 1,
        },
        configurationName: "my-semantic-config",
      },
      vectorSearchOptions: {
        queries: [
          {
            kind: "vector",
            vector: embeddedQuery,
            fields: ["embedding"],
          },
        ],
      },
    });
    console.log("🚀 | vectorSearch | searchResponse:", searchResponse);
    let items = [];
    if (searchResponse) {
      for await (let doc of searchResponse.results) {
        items.push(doc.document);
      }
    }
    return {
      items,
      answers: searchResponse?.answers,
      count: searchResponse?.count,
    };
  },
};
