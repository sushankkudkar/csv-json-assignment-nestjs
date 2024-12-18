import { Logger, Module, OnModuleInit } from '@nestjs/common';
<<<<<<< HEAD
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import { CsvParserModule } from '~/modules/csv-parser/csv-parser.module'; // Import CsvParserModule correctly
=======
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';

import { CsvParserModule } from '~/modules/csv-parser/csv-parser.module'; // Ensure correct import of CsvParserModule
>>>>>>> 62855db (feat: added parse csv data to postgres user tb)
import { AwsS3Service } from '~/processors/aws/aws-s3.service';
import { UserService } from '~/processors/database/services/all.services';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './csv-import.job';
import { BULLMQ_QUEUE } from '~/constants/meta.constant';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: BULLMQ_QUEUE,
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('app.redis.host'),
          port: configService.get<number>('app.redis.port'),
          password: configService.get<string>('app.redis.password'),
        },
        defaultJobOptions: {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
        limiter: {
          groupKey: BULLMQ_QUEUE,
          max: 5,
          duration: 10000,
        },
      }),
      inject: [ConfigService],
    }),

    CsvParserModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor, AwsS3Service, UserService],
})
export class JobsModule implements OnModuleInit {
  private readonly logger = new Logger(JobsModule.name);

  constructor(@InjectQueue(BULLMQ_QUEUE) private readonly csvImportQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('JobsModule initialized and ready to process jobs.');

    const queueName = this.csvImportQueue.name;
    this.logger.log(`Queue name: ${queueName} is ready.`);
  }
}
