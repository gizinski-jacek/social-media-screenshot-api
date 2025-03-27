import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import ScreenshotItPipe from 'src/pipes/screenshotItPipe';
import { UserModule } from 'src/mongo/users/user.module';
import { UserService } from 'src/mongo/users/user.service';

@Module({
  imports: [ScreenshotItPipe, UserModule],
  controllers: [InstagramController],
  providers: [InstagramService, CloudinaryService, UserService],
})
export class InstagramModule {}
