import { Module } from '@nestjs/common';
import { CsvParserService } from './csv-parser.service';
import { AwsS3Service } from '~/processors/aws/aws-s3.service'; // Import AWS S3 Service

@Module({
  providers: [CsvParserService, AwsS3Service],
  exports: [CsvParserService],
})
export class CsvParserModule {}
