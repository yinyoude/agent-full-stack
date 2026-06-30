import { tool } from '@langchain/core/tools';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import z from 'zod';
import type { User } from '../entities/user.entity';

@Injectable()
export class QueryUserTool {
  private readonly users: Record<string, User> = {
    '001': {
      id: '001',
      name: '张三',
      email: 'zhangsan@example.com',
      role: 'admin',
    },
    '002': {
      id: '002',
      name: '李四',
      email: 'lisi@example.com',
      role: 'user',
    },
    '003': {
      id: '003',
      name: '王五',
      email: 'wangwu@example.com',
      role: 'user',
    },
  };

  getTool(): StructuredToolInterface {
    return tool(
      ({ userId }: QueryUserArgs): string => {
        const user = this.users[userId];

        if (!user) {
          return `用户 ID ${userId} 不存在。可用的 ID: ${Object.keys(this.users).join(', ')}`;
        }

        return `用户信息：\n- ID: ${user.id}\n- 姓名: ${user.name}\n- 邮箱: ${user.email}\n- 角色: ${user.role}`;
      },
      {
        name: 'query_user',
        description:
          '查询数据库中的用户信息。输入用户 ID，返回该用户的详细信息（姓名、邮箱、角色）。',
        schema: queryUserArgsSchema,
      },
    );
  }
}

export const queryUserArgsSchema = z.object({
  userId: z.string().describe('用户 ID，例如: 001, 002, 003'),
});

type QueryUserArgs = z.infer<typeof queryUserArgsSchema>;
