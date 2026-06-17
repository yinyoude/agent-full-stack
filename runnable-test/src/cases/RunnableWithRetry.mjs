import { RunnableLambda } from "@langchain/core/runnables";

let attempt = 0;

// 一个会随机失败的 Runnable，用来演示 withRetry
const unstableRunnable = RunnableLambda.from(async (input) => {
  attempt += 1;
  console.log(`第 ${attempt} 次尝试，输入: ${input}`);

  // 模拟 70% 概率失败的情况
  if (Math.random() < 0.7) {
    console.log("本次尝试失败，抛出错误。");
    thrownewError("模拟的随机错误");
  }

  console.log("本次尝试成功。");
  return `成功处理: ${input}`;
});

// 使用 withRetry 为 runnable 加上重试逻辑
// withRetry retry 的是前面的 runnable sequence，所以
/**
 prompt
  .pipe(model)
  .pipe(parser)
  .withRetry()
 和
  prompt
   .pipe(model)
   .withRetry()
   .pipe(parser)

  retry 的不是同一个东西，第一个 retry 的是 [prompt, model, parser]，第二个 retry 的是 [prompt, model]
  如果只想retry model，应该

  prompt
   .pipe(
    model.withRetry()
   )
   .pipe(parser)

 */
const runnableWithRetry = unstableRunnable.withRetry({
  // 总共最多 5 次尝试
  stopAfterAttempt: 5,
});

try {
  const result = await runnableWithRetry.invoke("演示 withRetry");
  console.log("✅ 最终结果:", result);
} catch (err) {
  console.error("❌ 重试多次后仍然失败:", err?.message ?? err);
}
