import { Module } from '@nestjs/common';
import { BlueskyController } from './bluesky.controller';
import { BlueskyService } from './bluesky.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import ScreenshotItPipe from 'src/pipes/screenshotItPipe';
import { UserService } from 'src/mongo/users/user.service';
import { UserModule } from 'src/mongo/users/user.module';

@Module({
  imports: [ScreenshotItPipe, UserModule],
  controllers: [BlueskyController],
  providers: [BlueskyService, CloudinaryService, UserService],
})
export class BlueskyModule {}
