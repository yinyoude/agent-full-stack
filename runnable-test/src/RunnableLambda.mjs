import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";

const addOne = RunnableLambda.from(async (input) => {
  const func = () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        console.log(`输入: ${input}`);
        resolve(input + 1);
      }, 2000);
    });
    return promise;
  };
  const result = await func();
  return result;
});

const multiplyTwo = RunnableLambda.from((input) => {
  console.log(`输入: ${input}`);
  return input * 2;
});

const chain = RunnableSequence.from([addOne, multiplyTwo, addOne]);

const result = await chain.invoke(5);
console.log(result);
