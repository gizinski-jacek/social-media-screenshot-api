import { Module } from '@nestjs/common';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import UrlPipe from 'src/pipes/urlPipe';

@Module({
  imports: [UrlPipe],
  controllers: [TwitterController],
  providers: [TwitterService, CloudinaryService],
})
export class TwitterModule {}
