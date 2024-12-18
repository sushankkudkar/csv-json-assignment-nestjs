import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(@InjectQueue('csv-import') private readonly csvImportQueue: Queue) {}

  /**
   * Adds a CSV import job to the queue for processing
   * @param bucketName - The S3 bucket name
   * @param fileName - The CSV file name
   */
  async addCsvImportJob(bucketName: string, fileName: string) {
    try {
      await this.csvImportQueue.add({ bucketName, fileName }, { attempts: 5, delay: 1000 });
      this.logger.log(`CSV import job added to the queue: ${fileName}`);
    } catch (err) {
      this.logger.error('Failed to add CSV import job to the queue', err);
    }
  }
}
