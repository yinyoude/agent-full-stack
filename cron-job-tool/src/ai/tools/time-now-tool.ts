import { tool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeNowTool {
  getTool() {
    return tool(
      () => {
        const now = new Date();
        return {
          iso: now.toISOString(),
          timestamp: now.getTime(),
        };
      },
      {
        name: 'time_now',
        description:
          '获取当前服务器时间，返回 ISO 字符串（iso）和毫秒级时间戳（timestamp）',
      },
    );
  }
}
