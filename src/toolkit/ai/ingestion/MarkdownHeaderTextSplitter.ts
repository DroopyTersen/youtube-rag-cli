interface LineType {
  content: string;
  metadata: { [key: string]: string };
}

export interface Document {
  pageContent: string;
  metadata: { [key: string]: string };
}

interface HeaderType {
  level: number;
  name: string;
  data: string;
}

export class MarkdownHeaderTextSplitter {
  private returnEachLine: boolean;
  private headersToSplitOn: Array<[string, string]>;

  constructor(
    headersToSplitOn: Array<[string, string]> = [
      ["#", "h1"],
      ["##", "h2"],
      ["###", "h3"],
      ["####", "h4"],
      ["#####", "h5"],
      ["######", "h6"],
    ],
    returnEachLine: boolean = false
  ) {
    this.returnEachLine = returnEachLine;
    // Sort the headers by length in descending order
    this.headersToSplitOn = headersToSplitOn.sort(
      (a, b) => b[0].length - a[0].length
    );
  }

  private aggregateLinesToChunks(lines: LineType[]): Document[] {
    let aggregatedChunks: LineType[] = [];

    for (const line of lines) {
      if (
        aggregatedChunks.length > 0 &&
        aggregatedChunks[aggregatedChunks.length - 1].metadata === line.metadata
      ) {
        aggregatedChunks[aggregatedChunks.length - 1].content +=
          "  \n" + line.content;
      } else {
        aggregatedChunks.push(line);
      }
    }

    return aggregatedChunks.map((chunk) => ({
      pageContent: chunk.content?.trim(),
      metadata: chunk.metadata,
    }));
  }
  public splitText(text: string): Document[] {
    const lines = text.split("\n");
    let linesWithMetadata: LineType[] = [];
    let currentContent: string[] = [];
    let currentMetadata: { [key: string]: string } = {};
    let headerStack: HeaderType[] = [];
    let initialMetadata: { [key: string]: string } = {};
    let isHeader = false;

    for (const line of lines) {
      const strippedLine = line.trim();
      isHeader = false;

      for (const [sep, name] of this.headersToSplitOn) {
        if (
          strippedLine.startsWith(sep) &&
          (strippedLine.length === sep.length ||
            strippedLine[sep.length] === " ")
        ) {
          isHeader = true;
          if (name !== null) {
            const currentHeaderLevel = sep
              .split("")
              .filter((char) => char === "#").length;

            while (
              headerStack.length > 0 &&
              headerStack[headerStack.length - 1].level >= currentHeaderLevel
            ) {
              const poppedHeader = headerStack.pop();
              if (poppedHeader && poppedHeader.name in initialMetadata) {
                delete initialMetadata[poppedHeader.name];
              }
            }

            const header: HeaderType = {
              level: currentHeaderLevel,
              name: name,
              data: strippedLine.substring(sep.length).trim(),
            };
            headerStack.push(header);
            initialMetadata["headingPath"] = headerStack
              .map((header) => header.data)
              .join(" > ");
          }

          if (currentContent.length > 0) {
            linesWithMetadata.push({
              content: currentContent.join("\n"),
              metadata: { ...currentMetadata },
            });
            currentContent = [];
          }

          break;
        }
      }

      if (!isHeader) {
        currentContent.push(strippedLine);
      }

      currentMetadata = { ...initialMetadata };
    }

    if (currentContent.length > 0) {
      linesWithMetadata.push({
        content: currentContent.join("\n"),
        metadata: currentMetadata,
      });
    }

    if (!this.returnEachLine) {
      return this.aggregateLinesToChunks(linesWithMetadata);
    } else {
      return linesWithMetadata.map((chunk) => ({
        pageContent: chunk.content.trim(),
        metadata: chunk.metadata,
      }));
    }
  }
}
