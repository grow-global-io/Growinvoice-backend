import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { uuid } from 'uuidv4';
import { UploadResponseDto } from './dto/upload-response.dto';
import * as zlib from 'zlib';
import { promisify } from 'util';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}
  constainerName = 'growinvoice';
  readonly azureConnectionString = this.configService.get<string>(
    'AZURE_STORAGE_CONNECTION_STRING',
  );

  gunzip = promisify(zlib.gunzip);

  async upload(file: Express.Multer.File): Promise<UploadResponseDto> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      this.azureConnectionString,
    );
    const containerClient = blobServiceClient.getContainerClient(
      this.constainerName,
    );
    let blockBlobClient = containerClient.getBlockBlobClient(
      uuid() + file.originalname,
    );

    let fileBuffer = file.buffer;
    if (
      file.mimetype === 'application/gzip' ||
      file.originalname.endsWith('.gz')
    ) {
      try {
        fileBuffer = await this.gunzip(file.buffer);
        const fileName = file.originalname.replace('.gz', '');
        blockBlobClient = containerClient.getBlockBlobClient(uuid() + fileName);
      } catch (error) {
        throw new Error('Failed to decompress gzip file');
      }
    }
    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return plainToInstance(UploadResponseDto, {
      link: blockBlobClient.url,
      message: 'File uploaded successfully',
    });
  }
}
