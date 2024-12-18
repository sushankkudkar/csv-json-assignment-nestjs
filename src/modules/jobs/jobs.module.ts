import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';

import { CsvParserModule } from '~/modules/csv-parser/csv-parser.module'; // Import CsvParserModule correctly
import { AwsS3Service } from '~/processors/aws/aws-s3.service';
import { UserService } from '~/processors/database/services/all.services';

import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsProcessor } from './csv-import.job';

@Module({
  imports: [
    // Registering Bull queue configuration asynchronously using ConfigService
    BullModule.registerQueueAsync({
      name: 'csv-import',
      useFactory: async (configService: ConfigService) => ({
        redis: {
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
          groupKey: 'csv-import',
          max: 10,
          duration: 1000,
        },
      }),
      inject: [ConfigService],
    }),

    // Properly adding CsvParserModule to the imports array
    CsvParserModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsProcessor, AwsS3Service, UserService],
})
export class JobsModule implements OnModuleInit {
  private readonly logger = new Logger(JobsModule.name);

  constructor(@InjectQueue('csv-import') private readonly csvImportQueue: Queue) {}

  async onModuleInit() {}
}
