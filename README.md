# agent-full-stack

LangChain 学习与实验仓库，包含 **RAG（检索增强生成）** 与 **Agent + MCP 工具调用** 两个子项目。

## 项目结构

| 目录 | 说明 |
|------|------|
| `rag-test/` | 文档加载、向量检索与 RAG 问答 |
| `tool-test/` | LangChain 对话、自定义 Tool、MCP Server 集成 |

---

## LangChain 相关依赖

两个子项目的 `package.json` 中共用到以下 LangChain 生态包。LangChain.js 采用**分层模块化**设计：`@langchain/core` 提供抽象与协议，各 `@langchain/*` 包负责具体集成。

### `@langchain/core`

**核心基础层**，定义整个生态共用的类型与接口。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `Document` | 统一文档结构（`pageContent` + `metadata`） | `hello-rag.mjs` 中构造故事片段 |
| Messages | `HumanMessage`、`SystemMessage`、`ToolMessage` 等对话消息 | Agent 多轮对话与工具结果回传 |
| `tool()` | 将普通函数包装为 LLM 可调用的 Tool | `all-tools.mjs`、`tool-file-read.mjs` 定义读写文件等工具 |
| Runnable | 链式调用、`invoke` / `stream` 等执行协议 | 所有模型、检索器、工具的统一调用方式 |

### `@langchain/openai`

**OpenAI 兼容 API 集成层**，对接 Chat 与 Embedding 模型（本项目通过 `baseURL` 接入通义等兼容接口）。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `ChatOpenAI` | 对话大模型封装，支持 `invoke`、`bindTools` | 各脚本中的主 LLM |
| `OpenAIEmbeddings` | 文本向量化（Embedding） | `hello-rag.mjs` 将文档转为向量 |

### `@langchain/classic`

**经典组件包**，承载 LangChain 早期版本中仍常用的模块（向量库、部分 Chain 等），与新版 `@langchain/*` 拆分后的架构并存。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `MemoryVectorStore` | 内存向量数据库，支持相似度检索 | `hello-rag.mjs` 存储文档向量并检索 Top-K 片段 |
| `asRetriever()` | 将向量库转为 Retriever 接口 | 按问题检索相关 `Document`，再拼入 Prompt |

### `@langchain/community`

**社区集成包**，收录大量第三方数据源、文档加载器与工具适配器。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `CheerioWebBaseLoader` | 基于 Cheerio 抓取网页并解析为 `Document` | `loader-and-splitter.mjs` 从掘金文章加载段落 |

### `@langchain/textsplitters`

**文本切分包**，将长文档按字符、Token 或语义边界切分为适合 Embedding 的小块。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `RecursiveCharacterTextSplitter` 等 | 递归按分隔符切分，控制 `chunkSize` / `chunkOverlap` | 已安装，典型用于 Loader 之后、入库之前的 RAG 预处理步骤 |

### `@langchain/mcp-adapters`

**MCP（Model Context Protocol）适配层**，把 MCP Server 上的工具和资源桥接为 LangChain Tool。

| 能力 | 说明 | 本仓库中的用法 |
|------|------|----------------|
| `MultiServerMCPClient` | 同时连接多个 MCP Server（stdio 等方式） | `langchain-mcp-test.mjs`、`mcp-test.mjs` |
| `getTools()` | 将 MCP 工具转为 LangChain Tool 列表 | 与 `model.bindTools()` 配合实现 Agent 工具调用 |
| `listResources()` / `readResource()` | 读取 MCP 资源（如使用文档） | 将 `docs://guide` 注入 SystemMessage 上下文 |

---

## 典型工作流

### RAG（`rag-test`）

```
Document / Loader →（可选 Splitter）→ Embedding → VectorStore → Retriever → Prompt + ChatOpenAI
```

1. 用 `Document` 或 `CheerioWebBaseLoader` 准备文本
2. `OpenAIEmbeddings` 向量化后存入 `MemoryVectorStore`
3. 用户提问时，`Retriever` 检索相关片段
4. 片段拼入 Prompt，由 `ChatOpenAI` 生成回答

### Agent + MCP（`tool-test`）

```
User Query → ChatOpenAI（bindTools）→ tool_calls → MCP Tool / 自定义 Tool → ToolMessage → 最终回复
```

1. `MultiServerMCPClient` 启动并连接本地 MCP Server（如 `my-mcp-server.mjs`）
2. `getTools()` 获取工具，`bindTools()` 绑定到模型
3. 模型决定是否调用工具；执行结果以 `ToolMessage` 回传，直至给出最终答案

---

## 环境变量

各子项目通常在 `.env` 中配置（参考各脚本）：

- `OPENAI_API_KEY` — API 密钥
- `BASE_URL` — 兼容 OpenAI 的 API 地址
- `MODEL_NAME` — 对话模型名称
- `EMBEDDINGS_MODEL_NAME` — Embedding 模型名称（RAG 用）
