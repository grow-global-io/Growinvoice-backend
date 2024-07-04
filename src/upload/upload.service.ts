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
}
