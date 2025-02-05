import { Module } from '@nestjs/common';
import { ScreenshotController } from './screenshot.controller';
import { ScreenshotService } from './screenshot.service';
import { BlueskyModule } from './bluesky/bluesky.module';

@Module({
  imports: [BlueskyModule],
  controllers: [ScreenshotController],
  providers: [ScreenshotService],
})
export class ScreenshotModule {}
