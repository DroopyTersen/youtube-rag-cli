import {
  ChatMessage,
  Conversation,
  Message,
  renderMessages,
} from "../toolkit/ai/prompts/promptJsx";
import React from "react";

interface AnswerQuestionInput {
  question: string;
  results: any[];
}
export function AnswerQuestion({ results, question }: AnswerQuestionInput) {
  return (
    <>
      <Message.System>
        You are a highly skilled search assitant. You will be provided an array
        of search result snippets that should be used as context to answer the
        questions. Don't make anything up. Rely on the provided context.
        {"\n"}
        {`
        The desired output is:
        
## Notes
- List of bullet points
- The bullets should be relevant info you found in the provided context 

## Final Answer
Summarize the final answer in clear matter of fact language.

## Sources
- Bulleted list of  the sources you used to answer the question.
- Specify which which data
sources were used to answer the question. Let the user know the type of
the data source (Youtube video, article, tweet, etc...) and the title.
- Ex: "The information comes from a Youtubbe video called 'OpenAI 2023
DevDay Keynote' by OpenAI"
        `}
      </Message.System>
      <Message.User>{question}</Message.User>
      <Message.FunctionResult name="searchDocuments">
        {JSON.stringify(results, null, 2)}
      </Message.FunctionResult>
    </>
  );
}

export function getAnswerQuestionMessages(input: AnswerQuestionInput) {
  return renderMessages(<AnswerQuestion {...input} />);
}
