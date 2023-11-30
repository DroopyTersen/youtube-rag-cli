import { answerQuestion } from "./query";
import { chunksIndexService } from "./src/azureSearch/chunksIndex.service";
import { ingestYoutubeVideo } from "./src/dataSources/youtube/ingestYoutubeVideo";
import realine from "readline";

console.log("=== Welcome to the Youtube Chat Demo! ===\n\n");
const rl = realine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = async (question: string) => {
  return new Promise<string>((resolve) => {
    rl.question("\n\n💬 " + question + "\n", (answer) => {
      resolve(answer.trim());
    });
  });
};

try {
  await chunksIndexService.ensureIndex();
  let intent = await askQuestion(
    `What would you like to do? 'query' or 'ingest'?`
  );

  if (intent === "ingest") {
    const youtubeVideoId: string = await askQuestion(
      "Please enter Youtube video ID (e.g. pq34V_V5j18)"
    );
    console.log("🚀 | youtubeVideoId:", youtubeVideoId);
    if (youtubeVideoId) {
      await ingestYoutubeVideo(youtubeVideoId);
    }
  } else if (intent === "query") {
    const query: string = await askQuestion("What is your query/question?");
    await answerQuestion(query);
  }
  exit();
} catch (err: any) {
  console.log(err);
  exit();
}

function exit() {
  rl.close();
  console.log("Goodbye!");
  process.exit(0);
}
