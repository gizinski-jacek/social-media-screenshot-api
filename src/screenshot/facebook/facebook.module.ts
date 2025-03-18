import { Module } from '@nestjs/common';
import { FacebookController } from './facebook.controller';
import { FacebookService } from './facebook.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { UserModule } from 'src/mongo/users/user.module';
import { UserService } from 'src/mongo/users/user.service';

@Module({
  imports: [ScreenshotPipe, UserModule],
  controllers: [FacebookController],
  providers: [FacebookService, CloudinaryService, UserService],
})
export class FacebookModule {}
