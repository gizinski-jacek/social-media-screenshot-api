import { Module } from '@nestjs/common';
import { ScreenshotController } from './screenshot.controller';
import { BlueskyModule } from './bluesky/bluesky.module';
import { TwitterModule } from './twitter/twitter.module';
import { FacebookModule } from './facebook/facebook.module';
import { InstagramModule } from './instagram/instagram.module';

@Module({
  imports: [BlueskyModule, TwitterModule, FacebookModule, InstagramModule],
  controllers: [ScreenshotController],
  providers: [],
})
export class ScreenshotModule {}
