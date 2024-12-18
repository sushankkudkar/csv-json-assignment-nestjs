import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiProperty } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import streamifier from 'streamifier';

import { AwsS3Service } from '~/processors/aws/aws-s3.service';
import { JobsService } from './jobs.service';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary', // Indicates it's a file upload
    description: 'CSV file to be uploaded',
  })
  file: any;
}

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly jobsService: JobsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * API endpoint to trigger the CSV import job.
   * Accepts a file, uploads it to S3, and starts the CSV import process.
   * @param file - The file to be uploaded
   */
  @Post('import-csv')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload CSV file to S3 and start import job' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file to be uploaded',
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 202,
    description: 'CSV file successfully uploaded to S3 and import job queued.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Missing or invalid data.',
  })
  async importCsv(@UploadedFile() file: any) {
    const s3BucketName = this.configService.get('app.s3Bucket');
    if (!file) {
      throw new BadRequestException('file is required.');
    }
    try {
      const fileName = `${Date.now()}-${file.originalname}`;
      const fileStream = streamifier.createReadStream(file.buffer);
      const uploadResult = await this.awsS3Service.uploadFile(s3BucketName, fileName, fileStream);

      if (uploadResult) {
        await this.jobsService.addCsvImportJob(s3BucketName, fileName);
        this.logger.log({
          message: 'CSV file successfully uploaded to S3 and import job queued.',
          s3Url: uploadResult.Location,
        });
        return {
          message: 'CSV file successfully uploaded to S3 and import job queued.',
          s3Url: uploadResult.Location,
        };
      } else {
        throw new Error('Failed to upload the file to S3.');
      }
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }
}
