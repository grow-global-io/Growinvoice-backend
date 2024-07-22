import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';
import * as fs from 'fs';
import { UploadService } from '@/upload/upload.service';

@Injectable()
export class Json2excelService {
  constructor(private uploadService: UploadService) {}

  async createXls(dataa?: any) {
    const data = dataa ?? [
      {
        name: 'John Doe',
        age: 20,
        isStudent: true,
      },
      {
        name: 'Jane Doe',
        age: 25,
        isStudent: false,
      },
    ];

    const rows = [];

    data.forEach((item) => {
      rows.push(Object.values(item));
    });

    const book = new Workbook();

    const sheet = book.addWorksheet('Sheet1');

    rows.unshift(Object.keys(data[0]));

    sheet.addRows(rows);

    const File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'myExcelSheet',
          postfix: '.xlsx',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException('Error creating file');
          }

          book?.xlsx
            ?.writeFile(file)
            .then(() => {
              resolve(file);
            })
            .catch((error) => {
              reject(error);
            });
        },
      );
    });

    const b = await fs?.readFileSync(File as any);

    const a = await this.uploadService.uploadBuffer(
      b,
      '.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return a;
  }

  async createCsv(dataa?: any) {
    const data = dataa ?? [
      {
        name: 'John Doe',
        age: 20,
        isStudent: true,
      },
      {
        name: 'Jane Doe',
        age: 25,
        isStudent: false,
      },
    ];

    const rows = [];

    data.forEach((item) => {
      rows.push(Object.values(item));
    });

    const book = new Workbook();

    const sheet = book.addWorksheet('Sheet1');

    rows.unshift(Object.keys(data[0]));

    sheet.addRows(rows);

    const File = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'myExcelSheet',
          postfix: '.csv',
          mode: parseInt('0600', 8),
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException('Error creating file');
          }

          book?.csv
            ?.writeFile(file)
            .then(() => {
              resolve(file);
            })
            .catch((error) => {
              reject(error);
            });
        },
      );
    });

    const b = await fs?.readFileSync(File as any);

    const a = await this.uploadService.uploadBuffer(
      b,
      '.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    return a;
  }
}
