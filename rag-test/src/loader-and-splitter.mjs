import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const cheerioLoader = new CheerioWebBaseLoader(
  "https://juejin.cn/post/7233327509919547452",
  {
    selector: '.main-area p'
  }
)

const documents = await cheerioLoader.load();

/**
 * 使用 tiktoken 按照 token 来计算分块大小
import { encoding_for_model } from "tiktoken";

const enc = encoding_for_model("gpt-4o");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
  // splitter 默认按照字符数来分块
  // 但我们可以通过 lengthFunction 自定义分块的长度计算方式
  // splitter -> chunk -> chunk 调用 lengthFunction 看是否满足 chunkSize，不满足的继续递归
  lengthFunction: (text) => enc.encode(text).length,
});
 */

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400, // 每个分块的字符数
  // overlap 只有文本超过 chunk size，文本被打断了才会加，不是所有的块都会有 overlap
  // 通常设置为 chunkSize 的 10% - 20%
  chunkOverlap: 50, // 分块之间的重叠字符数
  separators: ["。", "！", "？"], // 分割符，优先使用段落分隔
})

const splitDocuments = await textSplitter.splitDocuments(documents);

console.log(splitDocuments);