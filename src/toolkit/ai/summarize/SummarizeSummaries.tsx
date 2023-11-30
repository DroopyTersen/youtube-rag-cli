import { Message } from "../prompts/promptJsx";

interface Props {
  summaries: Array<string>;
  systemPrompt?: string;
}
export const SUMMARIZE_SUMMARIES_SYSTEM_PROMPT = `You are a highly skilled research assistant. You will be provided a list of summaries from sections of a document. Your job is to read those summaries and provide a summary of the entire document. You should choose the analyze the summaries and choose the most important points to include in your overall summmary.

Respond with very clear, short, matter of fact language. try to use a few words as possible to convey the meaning.

## Output
You should respond in this format:
**Summary**: <2 or 3 sentence overview of the content>

**Facts**
 - Extract and list 2 or 3 most important facts. These should be specific, hard facts from the content. 
 - Prioritize facts that are backed by data, research, or notable sources. 
 - Don't make up any facts. if there are no important facts, leave this empty.
 - Only provide the 2 or 3 most important facts. Don't provide a long list of facts.
 - Don't just merge all the facts lists from each section's summary. Instead indentify the top 2 or 3 facts across all fact lists.

**Key Insights**
   - Identify and provide a bulleted list of 3-5 unique and significant insights from the article. These should be distinct arguments, perspectives, or thought-provoking points that stand out. 
   - Use reasoning and inference to come up with these insights. Don't just list statistics and statements. that is what Facts are for.
   - Avoid redundancy and ensure each point adds value.
  `;
export function SummarizeSummaries({
  summaries,
  systemPrompt = SUMMARIZE_SUMMARIES_SYSTEM_PROMPT,
}: Props) {
  return (
    <>
      <Message.System>{systemPrompt}</Message.System>
      <Message.User>
        Please summarize these summaries:{"\n"}
        {summaries.join("\n\n")}
      </Message.User>
    </>
  );
}
