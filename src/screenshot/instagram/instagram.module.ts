import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { UserModule } from 'src/mongo/users/user.module';
import { UserService } from 'src/mongo/users/user.service';

@Module({
  imports: [ScreenshotPipe, UserModule],
  controllers: [InstagramController],
  providers: [InstagramService, CloudinaryService, UserService],
})
export class InstagramModule {}
