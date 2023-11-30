import { ArticleData } from "@extractus/article-extractor";
import TurndownService from "turndown";
import { DataSourceType } from "~/features/dataSources/data/dataSource.schemas";
import { getMimeType } from "./getMimeType";
import { pdfArrayBufferToMarkdown } from "./pdfArrayBufferToMarkdown";

export async function convertUrlToMarkdown(url: string): Promise<{
  markdown: string;
  data: ArticleData | { url: string };
  type: DataSourceType;
} | null> {
  console.log("START: Convert URL to markdown");

  console.log("Fetching mime type...");
  let mimeType = await getMimeType(url);
  console.log("\tMime type: " + mimeType);
  if (!mimeType || mimeType.startsWith("text/html")) {
    const { extract: extractArticle, extractFromHtml } = await import(
      "@extractus/article-extractor"
    );
    console.log("Fetching article html...");
    let extractedArticle = await extractArticle(url);
    let html = extractedArticle?.content;
    if (html && extractedArticle?.title) {
      html = `<body><h1>${extractedArticle?.title}</h1>${html}</body>`;
    }

    if (!html) {
      throw new Error("Could not get read the Article from URL: " + url);
    }

    let markdown = await converHtmlToMarkdown(html);
    return { markdown, data: extractedArticle || { url }, type: "article" };
  } else if (mimeType && mimeType.startsWith("application/pdf")) {
    console.log("Downloading PDF...");
    let markdown = await fetch(url)
      .then((resp) => resp.arrayBuffer())
      .then(pdfArrayBufferToMarkdown);
    return {
      markdown,
      data: {
        url: url,
      },
      type: "pdf",
    };
  }

  console.error("Unrecognized mime type");
  return null;
}

export const converHtmlToMarkdown = async (html: string) => {
  if (!html) return "";

  var turndownService = new TurndownService({
    codeBlockStyle: "fenced",
    linkReferenceStyle: "collapsed",
  });
  turndownService.remove("script");
  turndownService.remove("style");
  turndownService.remove("img");

  turndownService.remove("iframe");
  console.log("Converting HTML to markdown...");
  var markdown: string = await turndownService.turndown(html);
  console.log("COMPLETE: Convert URL to markdown");
  return markdown;
};
