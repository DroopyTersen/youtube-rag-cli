# Youtube Rag Demo

A quick CLI demo showing how to:

1. Ingest Youtube video transcripts into Azure AI Search.
2. Ask question and retreive relevant results from search.
3. Pass the relevant results to an LLM to sythesize an answer.

![CLI Demo](assets/youtube-rag-demo.gif)

## Local Setup

First install the latest verson of Bun (a node.js alternative)

To install dependencies:

```bash
bun install
```

Setup the `.env` file by copying `.env.example` and filling in the secrets.

To run:

```bash
bun run chat.ts
```

This project was created using `bun init` in bun v1.0.9. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
