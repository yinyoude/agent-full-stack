import {
  RunnablePassthrough,
  RunnableLambda,
  RunnableSequence,
  RunnableMap,
} from "@langchain/core/runnables";

const chain = RunnableSequence.from([
  RunnableLambda.from((input) => ({ concept: input })),
  RunnableMap.from(
    {
      original: new RunnablePassthrough(),
      processed: RunnableLambda.from((obj) => ({
        concept: input,
        upper: obj.concept.toUpperCase(),
        length: obj.concept.length,
      })),
    },
  ),
]);

const input = "hello world";
const result = await chain.invoke(input);
console.log(result);
