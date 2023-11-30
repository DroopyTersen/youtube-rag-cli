import { chunksIndexService } from "./src/azureSearch/chunksIndex.service";
import { chatCompletion } from "./src/toolkit/ai/chatCompletion";
import { getAnswerQuestionMessages } from "./src/prompts/AnswerQuestion";

const DEFAULT_QUERY = "What did tom brady say about today's NFL?";

export const answerQuestion = async (question = DEFAULT_QUERY) => {
  let results = await chunksIndexService.vectorSearch(
    {
      standaloneQuestion: question,
    },
    7
  );

  if (results.items) {
    console.log("🚀 | results:", JSON.stringify(results, null, 2));
    console.log("\n\n");
    await chatCompletion.call(
      getAnswerQuestionMessages({
        question: question,
        results: results.items,
      }),
      {
        model: "gpt-4-1106-preview",
        temperature: 0.5,
        max_tokens: 800,
        onDelta: (delta) => {
          process.stdout.write(delta);
        },
      }
    );
  }
  console.log("\n\n");
};
