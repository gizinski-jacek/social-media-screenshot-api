import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import UrlPipe from 'src/pipes/urlPipe';
import { QueryData } from './twitter.interface';

@Controller('api/screenshot/twitter')
export class TwitterController {
  constructor(private readonly twitterService: TwitterService) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(@Query() query: QueryData): Promise<string> {
    const urlData = this.twitterService.destructureQuery(query);
    return this.twitterService.takeScreenshotOfPost(urlData);
  }
}
