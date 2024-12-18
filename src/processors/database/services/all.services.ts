import { Injectable } from '@nestjs/common';
import { BaseService } from '~/processors/database/base.service';
import { BaseRepository } from '../base.repository';
import { User } from './all.model'; // Adjust the path as needed

@Injectable()
export class UserService extends BaseService<User> {
  constructor(baseRepository: BaseRepository) {
    super(baseRepository, 'user');
  }

  /**
   * Bulk insert users into the database.
   * @param users - Array of transformed user data.
   */
  async bulkCreateUsers(users: User[]): Promise<void> {
    const batchSize = 1000; // Adjust batch size depending on performance
    const totalRecords = users.length;

    for (let i = 0; i < totalRecords; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      try {
        await this.createMany(batch);
        console.log(`Successfully inserted batch: ${i + 1} to ${i + batch.length}`);
      } catch (error) {
        console.error(`Error inserting batch ${i + 1}:`, error);
        throw error; // Propagate error to stop processing
      }
    }
  }
}
