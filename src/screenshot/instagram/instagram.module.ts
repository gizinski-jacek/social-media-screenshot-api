import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import UrlPipe from 'src/pipes/urlPipe';

@Module({
  imports: [UrlPipe],
  controllers: [InstagramController],
  providers: [InstagramService, CloudinaryService],
})
export class InstagramModule {}
