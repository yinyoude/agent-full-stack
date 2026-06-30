# AGENTS.md

Guidance for AI coding agents working in this NestJS project.

## Project Scope

This directory contains a NestJS application with a LangChain tool-calling agent. Keep changes scoped to `cron-job-tool` unless the user explicitly asks for cross-project updates.

## Architecture Rules

- `AppModule` should remain the composition root for global modules and feature modules.
- `AiModule` owns all AI feature providers.
- Controllers should stay thin and delegate to services.
- `AiService` may own light invocation orchestration while the project has one small agent.
- LangChain graph definitions and factories belong in `src/ai/chains`.
- Prompt construction belongs in `src/ai/prompts`.
- Model creation and model binding belongs in `src/ai/models`.
- Tool providers and tool selection belong in `src/ai/tools`.
- Shared AI state and simple domain types belong in `src/ai/entities`.

## Dependency Direction

Preferred flow:

```text
Controller -> Service -> Chain -> Model Provider / Tool Registry -> Tool Provider
```

Avoid importing controllers or services from lower-level chain, model, prompt, or tool files.

## Tooling Conventions

- Implement each tool as an injectable Nest provider when it may need dependencies now or later.
- Register tool providers in `AiModule`.
- Return tools through `ToolRegistry` so each agent has a single place for tool selection.
- Keep tool schemas explicit with `zod`.
- Do not reach directly into databases or external APIs from chains; put that behind tool providers or services.

## Model Conventions

- Use `LlmProvider` for chat model construction, caching, and binding models to tools.
- Read model configuration through `ConfigService`; do not read `process.env` from feature providers unless there is a clear bootstrap reason.

## Verification

Run these from `cron-job-tool` after code changes:

```bash
pnpm run build
pnpm run test
```

Use focused tests when adding behavior around tools, chains, or controllers.

## Documentation

When changing provider relationships or request flow, update `README.md` so its module relationship and request flow sections stay accurate.
