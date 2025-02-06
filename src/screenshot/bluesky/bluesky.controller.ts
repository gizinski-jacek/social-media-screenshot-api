import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
} from '@nestjs/common';
import { BlueskyService } from './bluesky.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import UrlPipe from 'src/pipes/urlPipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { rm } from 'fs';
import { createTimestamp } from 'src/utils/utils';

@Controller('api/screenshot/bluesky')
export class BlueskyController {
  constructor(
    private readonly blueskyService: BlueskyService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(
    @Query() query: { url: URL; commentDepth: number },
  ): Promise<string> {
    const { url, commentDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[2];
    const postId = split[4];
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 800, height: 1600 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.waitForSelector('.css-175oi2r.r-sa2ff0');
    const domRect: DOMRect[] = await page.$$eval(
      '.css-175oi2r.r-sa2ff0 > div',
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
    if (!domRect || domRect.length < 3) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Bluesky.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const mainPost = domRect[2];
    const comments = domRect.slice(4);
    const commentsSlice =
      commentDepth > 0 ? comments.slice(0, commentDepth) : [];
    const includedCommentsHeight: number =
      commentsSlice.length > 0
        ? comments
            .slice(0, commentDepth)
            .map((c) => c.height)
            .reduce((prev, curr) => prev + curr, 0)
        : 0;
    const fileName =
      userHandle +
      '_' +
      postId +
      '_cd_' +
      commentsSlice.length +
      '_' +
      createTimestamp() +
      '.jpeg';
    const path = './temp/bluesky/' + fileName;
    await page.screenshot({
      path: path,
      quality: 100,
      clip: {
        width: mainPost.width,
        height: mainPost.y + mainPost.height + includedCommentsHeight,
        x: mainPost.x,
        y: 0,
      },
    });
    await browser.close();
    const res = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return this.blueskyService.sendURL(res);
  }
}
