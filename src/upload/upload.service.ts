import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { uuid } from 'uuidv4';
import { UploadResponseDto } from './dto/upload-response.dto';
import * as zlib from 'node:zlib';

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

  async uploadViaBase64(file: { base64: string }) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.azureConnectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.constainerName,
    );
    const blockBlobClient = containerClient.getBlockBlobClient(uuid() + '.png');

    const fileBuffer = Buffer.from(file.base64, 'base64');

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: 'image/png' },
    });
    return plainToInstance(UploadResponseDto, {
      link: blockBlobClient.url,
      message: 'File uploaded successfully',
    });
  }

  async deCompressGzipRequest(data: string) {
    let Buffsa;
    const buffer = [];
    const gunzip = zlib.createGunzip();

    // Event handler for handling data chunks during decompression
    gunzip.on('data', (chunk) => {
      buffer.push(chunk);
    });

    // Promise to handle the end of decompression
    const decompressPromise = new Promise((resolve, reject) => {
      // Event handler for handling the end of decompression
      gunzip.on('end', () => {
        try {
          const decompressedBuffer: any = Buffer.concat(buffer);
          const jsonData = JSON.parse(decompressedBuffer);
          Buffsa = jsonData;
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });

      // Event handler for handling errors during decompression
      gunzip.on('error', (err) => {
        console.error('Error during decompression:', err);
        reject(err);
      });
    });

    // Initiate decompression with the base64-encoded data
    gunzip.end(Buffer.from(data, 'base64'));

    console.log(Buffsa);

    return decompressPromise;
  }
}
