import { Module } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import UrlPipe from 'src/pipes/urlPipe';

@Module({
  imports: [UrlPipe],
  controllers: [FacebookController],
  providers: [FacebookService, CloudinaryService],
})
export class FacebookModule {}
