import { SearchIndex } from "@azure/search-documents";

export interface ChunkSearchDocument {
  id: string;
  dataSourceId: string;
  dataSourceTitle: string;
  dataSourceType: string;
  dataSourceAuthor: string;
  position: number;
  content: string;
  embedding: number[];
  created_at: Date;
}

export const chunksIndexDefinition = {
  name: "idx-chunks",
  fields: [
    {
      name: "id",
      type: "Edm.String",
      key: true,
      searchable: false,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "dataSourceId",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: false,
    },
    {
      name: "dataSourceTitle",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "dataSourceType",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "dataSourceAuthor",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "position",
      type: "Edm.Int32",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
    {
      name: "content",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "embedding",
      type: "Collection(Edm.Single)",
      searchable: true,
      vectorSearchDimensions: 1536,
      vectorSearchProfileName: "hnsw-vector-profile",
    },
    {
      name: "created_at",
      type: "Edm.DateTimeOffset",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
  ],
  vectorSearch: {
    algorithms: [
      {
        name: "hnsw-vector-config",
        kind: "hnsw",
        parameters: {
          m: 4,
          efConstruction: 400,
          efSearch: 300,
          metric: "cosine",
        },
      },
    ],
    profiles: [
      {
        name: "hnsw-vector-profile",
        algorithmConfigurationName: "hnsw-vector-config",
      },
    ],
  },
  semanticSearch: {
    configurations: [
      {
        name: "my-semantic-config",
        prioritizedFields: {
          titleField: {
            name: "dataSourceTitle",
          },
          contentFields: [
            {
              name: "content",
            },
            {
              name: "dataSourceAuthor",
            },
          ],
          keywordsFields: [
            {
              name: "dataSourceType",
            },
          ],
        },
      },
    ],
  },
} satisfies SearchIndex;
