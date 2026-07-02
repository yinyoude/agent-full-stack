import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Job } from '../job/entities/job.entity';

@Injectable()
export class MySqlProvider {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 3306),
      username: this.configService.get<string>('DB_USERNAME', 'root'),
      password: this.configService.get<string>('DB_PASSWORD', '123456'),
      database: this.configService.get<string>('DB_NAME', 'hello'),
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', true),
      logging: this.configService.get<boolean>('DB_LOGGING', true),
      entities: [User, Job],
    };
  }
}
