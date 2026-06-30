import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  MailerOptions,
  MailerOptionsFactory,
} from '@nestjs-modules/mailer';

@Injectable()
export class MailProvider implements MailerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.configService.get<string>('MAIL_HOST'),
        port: Number(this.configService.get<string>('MAIL_PORT')),
        secure: this.configService.get<string>('MAIL_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      },
      defaults: {
        from: this.configService.get<string>('MAIL_FROM'),
      },
    };
  }
}
