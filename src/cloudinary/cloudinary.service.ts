import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary.interface';
import { rmSync } from 'fs';

@Injectable()
export class CloudinaryService {
  async saveToCloud(
    filepath: string,
    cloudinaryId: string,
    service: string,
    timestamp: Date,
  ): Promise<CloudinaryResponse> {
    try {
      const res = await cloudinary.uploader.upload(filepath, {
        use_filename: true,
        unique_filename: false,
        folder: cloudinaryId + '/' + service,
        format: 'jpg',
        timestamp: timestamp.getTime(),
      });
      return {
        public_id: res.public_id,
        url: res.secure_url,
        timestamp: timestamp,
      };
    } catch (error: unknown) {
      console.log(error);
      rmSync(filepath);
      throw new HttpException(
        'Error uploading screenshot.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFromCloud(publicId: string): Promise<string> {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      if (res.result === 'not found') {
        throw new HttpException(
          'Screenshot to delete not found.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return res;
    } catch (error: unknown) {
      console.log(error);
      throw new HttpException(
        (error as HttpException).getResponse() || 'Error deleting screenshot.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
