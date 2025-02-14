import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { BlueskyService } from './bluesky.service';
import UrlPipe from 'src/pipes/urlPipe';
import { QueryData } from './bluesky.interface';

@Controller('api/screenshot/bsky')
export class BlueskyController {
  constructor(private readonly blueskyService: BlueskyService) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(@Query() query: QueryData): Promise<string> {
    const urlData = this.blueskyService.destructureQuery(query);
    return this.blueskyService.takeScreenshotOfPost(urlData);
  }
}
