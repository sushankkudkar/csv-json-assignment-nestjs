import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';

import { AWSModule } from '~/processors/aws/aws.module';
import { LoggerModule } from '~/processors/logger/logger.module';
import { DatabaseModule } from '~/processors/database/database.module';
import { AppConfigModule } from '~/processors/app-config/app-config.module';
import configuration from '~/processors/app-config/configuration';

import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    LoggerModule,
    AppConfigModule,
    DatabaseModule,
    AWSModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
