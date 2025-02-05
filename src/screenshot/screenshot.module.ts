import { Module } from '@nestjs/common';
import { ScreenshotController } from './screenshot.controller';
import { BlueskyModule } from './bluesky/bluesky.module';

@Module({
  imports: [BlueskyModule],
  controllers: [ScreenshotController],
  providers: [],
})
export class ScreenshotModule {}
