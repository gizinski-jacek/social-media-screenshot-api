import { Module } from '@nestjs/common';
import { TwitterController } from './twitter.controller';
import { TwitterService } from './twitter.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import UrlPipe from 'src/pipes/urlPipe';
import { UserService } from 'src/mongo/users/user.service';
import { UserModule } from 'src/mongo/users/user.module';

@Module({
  imports: [UrlPipe, UserModule],
  controllers: [TwitterController],
  providers: [TwitterService, CloudinaryService, UserService],
})
export class TwitterModule {}
