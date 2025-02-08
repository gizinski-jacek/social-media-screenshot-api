import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
} from '@nestjs/common';
import { TwitterService } from './twitter.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import UrlPipe from 'src/pipes/urlPipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { rm } from 'fs';
import { createTimestamp } from 'src/utils/utils';

@Controller('api/screenshot/twitter')
export class TwitterController {
  constructor(
    private readonly twitterService: TwitterService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(
    @Query() query: { url: URL; commentDepth: number },
  ): Promise<string> {
    const { url, commentDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 900, height: 3000 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content:
        '.css-175oi2r.r-aqfbo4.r-zchlnj.r-1d2f490.r-1xcajam.r-1p0dtai.r-12vffkv { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });
    await page.waitForSelector(
      '.css-175oi2r[aria-label="Timeline: Conversation"] ',
      { timeout: 15000 },
    );
    const domRect: DOMRect[] = await page.$$eval(
      '.css-175oi2r[aria-label="Timeline: Conversation"] > div > div',
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
    if (!domRect || !domRect.length) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Twitter.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const mainPost = domRect[0];
    // const comments = domRect.slice(2);
    // const commentsSlice =
    //   commentDepth > 0 ? comments.slice(0, commentDepth) : [];
    // const includedCommentsHeight: number =
    //   commentsSlice.length > 0
    //     ? comments
    //         .slice(0, commentDepth)
    //         .map((c) => c.height)
    //         .reduce((prev, curr) => prev + curr, 0)
    //     : 0;
    const fileName =
      userHandle +
      '_' +
      postId +
      // '_cd_' +
      // commentsSlice.length +
      '_' +
      createTimestamp() +
      '.jpeg';
    const path = './temp/twitter/' + fileName;
    await page.screenshot({
      path: path,
      quality: 100,
      clip: {
        width: mainPost.width + 20,
        height:
          mainPost.y + mainPost.height /* + includedCommentsHeight */ + 20,
        x: mainPost.x - 20,
        y: 0,
      },
    });
    await browser.close();
    const res = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return this.twitterService.sendURL(res);
  }
}
