import { Processor, WorkerHost } from '@nestjs/bullmq'; // Import WorkerHost along with Processor
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CsvParserService } from '~/modules/csv-parser/csv-parser.service';
import { User } from '~/processors/database/services/all.model';
import { UserService } from '~/processors/database/services/all.services';
import { BULLMQ_QUEUE } from '~/constants/meta.constant';

@Processor(BULLMQ_QUEUE)
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(
    private readonly csvParserService: CsvParserService,
    private readonly userService: UserService,
  ) {
    super();
  }

  /**
   * This method is required by WorkerHost and should be implemented to process jobs.
   * @param job - The job being processed.
   */
  async process(job: Job<any, any, string>) {
    // Assuming BULLMQ_QUEUE jobs contain the necessary information like bucketName and fileName
    const { bucketName, fileName } = job.data;

    this.logger.log(`Processing CSV file from S3: ${fileName}`);

    try {
      // Step 1: Parse CSV data from S3
      const parsedData = await this.csvParserService.parseCsvFromS3(bucketName, fileName);

      // Step 2: Transform the parsed CSV data into the User format
      const userData = this.transformUserCsvData(parsedData);

      // Step 3: Bulk insert the user data into the database
      await this.userService.bulkCreateUsers(userData);

      // Step 4: Generate and print the age distribution report
      await this.generateAgeDistributionReport();

      this.logger.log('CSV file processed successfully and data inserted into DB.');
    } catch (error) {
      this.logger.error(`Error processing CSV import job: ${error.message}`, error.stack);
      throw new Error(`Failed to process CSV import job: ${error.message}`);
    }
  }

  /**
   * Transform CSV data into the appropriate format for the database
   * @param data - The parsed CSV data
   * @returns Transformed data
   */
  private transformUserCsvData(data: any[]): User[] {
    return data.map((row) => {
      const trimmedRow = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim(), value]));

      const firstName = trimmedRow['name.firstName'];
      const lastName = trimmedRow['name.lastName'];
      const name = `${firstName} ${lastName}`;
      const age = Number(trimmedRow['age']);

      const { 'name.firstName': firstNameField, 'name.lastName': lastNameField, 'age': ageField, ...rest } = trimmedRow;

      const address: Record<string, any> = {};
      for (const key in rest) {
        if (key.startsWith('address.')) {
          const addressKey = key.replace('address.', '');
          address[addressKey] = rest[key];
          delete rest[key];
        }
      }
      const additionalInfo = { ...rest };
      const user: User = {
        name,
        age,
        createdAt: new Date(),
        address: address,
        additionalInfo,
      };
      return user;
    });
  }

  /**
   * Generate and print the age distribution report for users
   */
  private async generateAgeDistributionReport(): Promise<void> {
    // Step 1: Query the database to get the number of users in each age group
    const ageGroups = await this.getAgeGroupCounts();

    // Step 2: Print the report to the console
    this.logger.log('Age Group Distribution:');
    this.logger.log(`< 20: ${ageGroups['< 20']}`);
    this.logger.log(`20 - 40: ${ageGroups['20 - 40']}`);
    this.logger.log(`40 - 60: ${ageGroups['40 - 60']}`);
    this.logger.log(`> 60: ${ageGroups['> 60']}`);
  }

  /**
   * Aggregates users into age groups and counts the number of users in each group.
   * @returns The counts of users in each age group.
   */
  private async getAgeGroupCounts() {
    const users = await this.userService.findMany();

    // Initialize the age groups
    const ageGroups = {
      '< 20': 0,
      '20 - 40': 0,
      '40 - 60': 0,
      '> 60': 0,
    };

    // Iterate through the user data and classify into age groups
    users.forEach((user) => {
      if (user.age < 20) {
        ageGroups['< 20']++;
      } else if (user.age >= 20 && user.age <= 40) {
        ageGroups['20 - 40']++;
      } else if (user.age >= 40 && user.age <= 60) {
        ageGroups['40 - 60']++;
      } else if (user.age > 60) {
        ageGroups['> 60']++;
      }
    });

    return ageGroups;
  }
}
