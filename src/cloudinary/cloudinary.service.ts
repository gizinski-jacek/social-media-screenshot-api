// cloudinary.service.ts

import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async saveToCloud(path: string): Promise<string> {
    try {
      const res = await cloudinary.uploader.upload(path, {
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });
      return res.secure_url;
    } catch (error: unknown) {
      throw error;
    }
  }
}
