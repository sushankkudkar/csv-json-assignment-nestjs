import { Injectable } from '@nestjs/common';
import { AwsS3Service } from '~/processors/aws/aws-s3.service';
import { Readable } from 'stream';

@Injectable()
export class CsvParserService {
  constructor(private readonly awsS3Service: AwsS3Service) {}

  async parseCsvFromS3(bucketName: string, fileName: string): Promise<any[]> {
    const fileStream = await this.awsS3Service.readCsvFileStream(bucketName, fileName);
    return await this.parseCsvStream(fileStream);
  }

  private parseCsvStream(fileStream: Readable): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let rawData = '';
      const results: any[] = [];
      fileStream.on('data', (chunk) => {
        rawData += chunk;
      });

      fileStream.on('end', () => {
        const rows = this.parseCsvData(rawData);
        resolve(rows);
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Parse CSV data into an array of objects.
   * @param csvData The raw CSV data.
   * @returns Parsed CSV data as an array of objects.
   */
  private parseCsvData(csvData: string): any[] {
    const rows = csvData.split('\n');
    const headers = this.parseCsvRow(rows[0]);

    const parsedData = rows.slice(1).map((row) => {
      const columns = this.parseCsvRow(row);
      const rowData: Record<string, string> = {};

      headers.forEach((header, index) => {
        rowData[header] = columns[index];
      });

      return rowData;
    });

    return parsedData;
  }

  /**
   * Split a CSV row into its columns, handling quoted fields with commas.
   * @param row The CSV row to parse.
   * @returns An array of columns.
   */
  private parseCsvRow(row: string): string[] {
    const columns: string[] = [];
    let currentColumn = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"' && (i === 0 || row[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(currentColumn.trim());
        currentColumn = '';
      } else {
        currentColumn += char;
      }
    }
    if (currentColumn) {
      columns.push(currentColumn.trim());
    }

    return columns;
  }
}
