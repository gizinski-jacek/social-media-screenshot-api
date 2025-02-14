import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
} from '@nestjs/common';
import { FacebookService } from './facebook.service';
import UrlPipe from 'src/pipes/urlPipe';
import { QueryData } from './facebook.interface';

@Controller('api/screenshot/facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(@Query() query: QueryData): Promise<string> {
    const urlData = this.facebookService.destructureQuery(query);

    if (urlData.type === 'posts') {
      return this.facebookService.takeScreenshotOfPost(urlData);
    } else if (urlData.type === 'videos') {
      return this.facebookService.takeScreenshotOfVideo(urlData);
    } else {
      throw new HttpException('Issue with url.', HttpStatus.BAD_REQUEST);
    }
  }
}
