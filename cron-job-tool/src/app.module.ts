import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlProvider } from './providers/mysql.provider';
import { ScheduleModule } from '@nestjs/schedule';
import { JobModule } from './job/job.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useClass: MySqlProvider,
    }),
    ScheduleModule.forRoot(),
    AiModule,
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// export class AppModule implements OnApplicationBootstrap {
//   @Inject(SchedulerRegistry)
//   schedulerRegistry: SchedulerRegistry;

//   onApplicationBootstrap() {
//     const job = new CronJob(CronExpression.EVERY_SECOND, () => {
//       console.log('run job');
//     });
//     this.schedulerRegistry.addCronJob('job1', job);
//     job.start();
//     setTimeout(() => {
//       this.schedulerRegistry.deleteCronJob('job1');
//     }, 5000);

//     const intervalRef = setInterval(() => {
//       console.log('run interval job');
//     }, 1000);
//     this.schedulerRegistry.addInterval('interval1', intervalRef);
//     setTimeout(() => {
//       this.schedulerRegistry.deleteInterval('interval1');
//     }, 5000);

//     const timeoutRef = setTimeout(() => {
//       console.log('run timeout job');
//     }, 3000);
//     this.schedulerRegistry.addTimeout('timeout1', timeoutRef);
//     setTimeout(() => {
//       this.schedulerRegistry.deleteTimeout('timeout1');
//     }, 5000);
//   }
// }
