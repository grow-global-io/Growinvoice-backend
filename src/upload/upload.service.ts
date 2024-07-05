import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { uuid } from 'uuidv4';
import { UploadResponseDto } from './dto/upload-response.dto';

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
}
