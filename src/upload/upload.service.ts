import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { uuid } from 'uuidv4';
import { UploadResponseDto } from './dto/upload-response.dto';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}
  constainerName = 'growinvoice';
  readonly azureConnectionString = this.configService.get<string>(
    'AZURE_STORAGE_CONNECTION_STRING',
  );

  async upload(file: Express.Multer.File): Promise<UploadResponseDto> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.azureConnectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.constainerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      uuid() + file.originalname,
    );

    const fileBuffer = file.buffer;

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return plainToInstance(UploadResponseDto, {
      link: blockBlobClient.url,
      message: 'File uploaded successfully',
    });
  }

  async uploadPdf(file: Express.Multer.File): Promise<UploadResponseDto> {
    const startTime = Date.now();
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.azureConnectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.constainerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(
      uuid() + file.originalname,
    );

    const fileBuffer = file.buffer;
    const blockSize = 4 * 1024 * 1024; // 4MB per block
    const blockIds: string[] = [];

    const numBlocks = Math.ceil(fileBuffer.length / blockSize);
    const maxConcurrency = 20; // Adjust this based on your testing
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < numBlocks; i++) {
      const start = i * blockSize;
      const end = Math.min(start + blockSize, fileBuffer.length);
      const blockId = btoa(uuid());
      blockIds.push(blockId);

      const blockBuffer = fileBuffer.slice(start, end);

      // Throttle the upload to avoid overloading the network
      if (uploadPromises.length >= maxConcurrency) {
        await Promise.race(uploadPromises);
      }

      const uploadPromise = blockBlobClient
        .stageBlock(blockId, blockBuffer, blockBuffer.length)
        .then(() => {
          // Remove resolved promises from the array
          const index = uploadPromises.indexOf(uploadPromise);
          if (index > -1) {
            uploadPromises.splice(index, 1);
          }
        });

      uploadPromises.push(uploadPromise);
    }

    console.log(`Number of blocks: ${numBlocks}`);

    const stageStartTime = Date.now();
    await Promise.all(uploadPromises);
    const stageEndTime = Date.now();

    console.log(
      `Block staging time: ${(stageEndTime - stageStartTime) / 1000} seconds`,
    );

    const commitStartTime = Date.now();
    await blockBlobClient.commitBlockList(blockIds, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    const commitEndTime = Date.now();

    console.log(
      `Block commit time: ${(commitEndTime - commitStartTime) / 1000} seconds`,
    );
    console.log(
      `Total upload time: ${(commitEndTime - startTime) / 1000} seconds`,
    );

    return plainToInstance(UploadResponseDto, {
      link: blockBlobClient.url,
      message: 'File uploaded successfully',
    });
  }

  async uploadPdfCompress(file: Express.Multer.File) {
    const execPromise = promisify(exec);

    const cwd = process.cwd();
    // file to base64
    const fileBuffer = file.buffer.toString('base64');
    const tempFolder = path.join(cwd, 'temp');
    const hasTempFolder = existsSync(tempFolder);

    if (!hasTempFolder) {
      await fs.mkdir(tempFolder);
    }

    const originalFilePath = path.join(cwd, 'temp', 'original.pdf');
    const compressFilePath = path.join(cwd, 'temp', 'compress.pdf');

    await fs.writeFile(originalFilePath, fileBuffer, 'base64');

    await execPromise(
      `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${compressFilePath}" ${originalFilePath}`,
    );

    const compressFileBase64 = await fs.readFile(compressFilePath, 'base64');

    await fs.unlink(originalFilePath);
    await fs.unlink(compressFilePath);

    return compressFileBase64;
    // const blobServiceClient = BlobServiceClient.fromConnectionString(
    //   this.azureConnectionString,
    // );
    // const containerClient = blobServiceClient.getContainerClient(
    //   this.constainerName,
    // );
    // const blockBlobClient = containerClient.getBlockBlobClient(
    //   uuid() + path.basename(filePath),
    // );

    // const fileBuffer = await fs.readFile(filePath);

    // await blockBlobClient.uploadData(fileBuffer, {
    //   blobHTTPHeaders: { blobContentType: 'application/pdf' },
    // });

    // return plainToInstance(UploadResponseDto, {
    //   link: blockBlobClient.url,
    //   message: 'File uploaded successfully',
    // });
  }
}
