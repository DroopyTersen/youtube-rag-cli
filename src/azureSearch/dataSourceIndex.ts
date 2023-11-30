import {
  SearchIndexClient,
  AzureKeyCredential,
  SearchIndex,
} from "@azure/search-documents";
import { searchService } from "./searchService";

export const ensureDataSourceINdex = async () => {
  await searchService.ensureIndex(dataSourceIndexDefinition);
};

export const indexDataSource = async (doc: DataSourceSearchDocument) => {
  await searchService.uploadDocuments(dataSourceIndexDefinition.name, [doc]);
};

export interface DataSourceSearchDocument {
  id: string;
  title: string;
  type: string;
  author: string;
  content: string;
  created_at: Date;
}

export let dataSourceIndexDefinition = {
  name: "idx-data-sources",
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
      name: "title",
      type: "Edm.String",
      searchable: true,
      filterable: false,
      sortable: false,
      facetable: false,
    },
    {
      name: "type",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
    },
    {
      name: "author",
      type: "Edm.String",
      searchable: true,
      filterable: true,
      sortable: false,
      facetable: true,
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
      name: "created_at",
      type: "Edm.DateTimeOffset",
      searchable: false,
      filterable: true,
      sortable: true,
      facetable: false,
    },
  ],
  semanticSearch: {
    configurations: [
      {
        name: "default-semantic-config",
        prioritizedFields: {
          titleField: {
            name: "title",
          },
          contentFields: [
            {
              name: "content",
            },
            {
              name: "author",
            },
          ],
          keywordsFields: [
            {
              name: "type",
            },
          ],
        },
      },
    ],
  },
} satisfies SearchIndex;
