import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import UrlPipe from 'src/pipes/urlPipe';
import { QueryData } from './instagram.interface';

@Controller('api/screenshot/instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(@Query() query: QueryData): Promise<string> {
    const urlData = this.instagramService.destructureQuery(query);
    return this.instagramService.takeScreenshotOfPost(urlData);
  }
}
