import { Module } from '@nestjs/common';
import { BlueskyController } from './bluesky.controller';
import { BlueskyService } from './bluesky.service';
import UrlPipe from 'src/pipes/urlPipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  imports: [UrlPipe],
  controllers: [BlueskyController],
  providers: [BlueskyService, CloudinaryService],
})
export class BlueskyModule {}
