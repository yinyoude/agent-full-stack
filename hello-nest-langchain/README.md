# hello-nest-langchain

基于 [NestJS](https://nestjs.com/) 11 + TypeScript 的服务端示例项目。当前包含一个根 `Hello World` 接口，以及一个通过 `nest g resource` 生成的图书（book）资源模块，可作为后续接入 LangChain 等能力的起点。

> 说明：`book` 模块目前是脚手架骨架，`BookService` 中各方法返回的是占位字符串，尚未接入真实的数据存储。

## 技术栈

- **框架**：NestJS 11（`@nestjs/common` / `@nestjs/core` / `@nestjs/platform-express`）
- **语言**：TypeScript 5.7（`module` / `moduleResolution` 均为 `nodenext`）
- **测试**：Jest 30 + ts-jest（单元测试），Supertest（e2e）
- **包管理**：pnpm

## 目录结构

```text
src/
├── app.module.ts
├── main.ts
│
├── common/                 # 通用工具，不依赖业务
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
│
├── core/                   # 全局基础设施
│   ├── config/
│   ├── database/
│   ├── logger/
│   ├── redis/
│   └── core.module.ts
│
├── modules/                # 业务模块
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── dto/
│   │
│   ├── order/
│   │   ├── order.module.ts
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   └── dto/
│   │
│   └── product/
│       ├── product.module.ts
│       ├── product.controller.ts
│       └── product.service.ts
```

## 接口一览

| 方法     | 路径         | 说明             |
| -------- | ------------ | ---------------- |
| `GET`    | `/`          | 返回 Hello World |
| `POST`   | `/book`      | 新增图书         |
| `GET`    | `/book`      | 查询全部图书     |
| `GET`    | `/book/:id`  | 按 id 查询单本   |
| `PATCH`  | `/book/:id`  | 按 id 更新       |
| `DELETE` | `/book/:id`  | 按 id 删除       |

## 环境准备

```bash
# 安装依赖
$ pnpm install
```

## 启动项目

```bash
# 开发模式
$ pnpm run start

# 开发模式（文件变更自动重启）
$ pnpm run start:dev

# 生产模式（需先 pnpm run build）
$ pnpm run start:prod
```

启动后访问 <http://localhost:3000> 即可看到 `Hello World!`。

## 运行测试

```bash
# 单元测试
$ pnpm run test

# e2e 测试
$ pnpm run test:e2e

# 测试覆盖率
$ pnpm run test:cov
```

## 常见问题

**IDE 中出现 “找不到名称 describe” 之类的报错？**
项目已安装 `@types/jest`，`tsc` 编译不会报错。这通常是编辑器的 TypeScript 语言服务缓存导致的，在 VS Code 中执行 `Cmd+Shift+P` → `TypeScript: Restart TS Server` 即可恢复。

## 参考资料

- [NestJS 官方文档](https://docs.nestjs.com)
- [LangChain.js 文档](https://js.langchain.com)
