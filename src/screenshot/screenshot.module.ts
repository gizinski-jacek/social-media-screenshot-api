import { Module } from '@nestjs/common';
import { ScreenshotController } from './screenshot.controller';
import { BlueskyModule } from './bluesky/bluesky.module';
import { TwitterModule } from './twitter/twitter.module';

@Module({
  imports: [BlueskyModule, TwitterModule],
  controllers: [ScreenshotController],
  providers: [],
})
export class ScreenshotModule {}
