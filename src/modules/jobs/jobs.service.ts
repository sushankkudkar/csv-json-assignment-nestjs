import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';

import { BULLMQ_QUEUE } from '~/constants/meta.constant';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue(BULLMQ_QUEUE) private readonly csvImportQueue: Queue) {}

  /**
   * Adds a CSV import job to the queue for processing
   * @param bucketName - The S3 bucket name
   * @param fileName - The CSV file name
   */
  async addCsvImportJob(bucketName: string, fileName: string) {
    try {
      await this.csvImportQueue.add(BULLMQ_QUEUE, { bucketName, fileName });

      this.logger.log(`CSV import job added to the queue: ${fileName}`);
    } catch (err) {
      this.logger.error(`Failed to add CSV import job to the queue: ${err.message}`, err.stack);
    }
  }
}
