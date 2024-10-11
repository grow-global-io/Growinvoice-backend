import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { uuid } from 'uuidv4';
import { UploadResponseDto } from './dto/upload-response.dto';
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from '@firebase/storage';

@Injectable()
export class UploadService {
  async uploadBuffer(
    file: Buffer,
    ext: string,
    mimetype: string,
  ): Promise<UploadResponseDto> {
    const storage = getStorage();
    const dateTime = this.giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${uuid() + '       ' + dateTime + ext}`,
    );
    const metadata = {
      contentType: mimetype,
    };
    const snapshot = await uploadBytesResumable(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return plainToInstance(UploadResponseDto, {
      link: downloadURL,
      message: 'File uploaded successfully',
    });
  }

  // firebase

  giveCurrentDateTime = () => {
    const today = new Date();
    const date =
      today.getFullYear() +
      '-' +
      (today.getMonth() + 1) +
      '-' +
      today.getDate();
    const time =
      today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
  };

  async uploadFile(file: Express.Multer.File) {
    const storage = getStorage();
    const dateTime = this.giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `files/${file.originalname + '       ' + dateTime}`,
    );
    const metadata = {
      contentType: file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
      storageRef,
      file.buffer,
      metadata,
    );
    const downloadURL = await getDownloadURL(snapshot.ref);
    return plainToInstance(UploadResponseDto, {
      link: downloadURL,
      message: 'File uploaded successfully',
    });
  }
}
