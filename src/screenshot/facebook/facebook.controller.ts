import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
} from '@nestjs/common';
import { FacebookService } from './facebook.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import UrlPipe from 'src/pipes/urlPipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { rm } from 'fs';
import { createTimestamp } from 'src/utils/utils';

@Controller('api/screenshot/facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @UsePipes(UrlPipe)
  async getScreenshot(
    @Query() query: { url: URL; commentsDepth: number },
  ): Promise<string> {
    const { url, commentsDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const type = split[2];
    const postId = split[3];
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1400,
        height: 1400 + (type === 'posts' ? commentsDepth * 200 : 0),
      },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

    if (type === 'posts') {
      const uglySelector =
        ' > div > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd > div > div > div';
      await page.waitForSelector(
        '.x1n2onr6.x1ja2u2z.x1jx94hy.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.x9f619.xh8yej3.x6ikm8r.x10wlt62',
        { timeout: 15000 },
      );
      const divRect: DOMRect[] = await page.$$eval(
        '.x1n2onr6.x1ja2u2z.x1jx94hy.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.x9f619.xh8yej3.x6ikm8r.x10wlt62' +
          uglySelector,
        (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
      );
      const mainPostRect = divRect[2];
      await page.waitForSelector(
        '.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp',
        { timeout: 15000 },
      );
      const commentsRect: DOMRect[] | null =
        commentsDepth > 0
          ? await page.$$eval(
              '.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp > div',
              (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
            )
          : null;
      if (!mainPostRect) {
        throw new HttpException(
          'Provided url is incorrect or there is issue with Facebook.',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (commentsDepth > 0 && commentsRect === null) {
        throw new HttpException(
          'There was an issue including comments. Try later or do not include them.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const commentsSlice =
        commentsRect?.length > 0 ? commentsRect.slice(0, commentsDepth) : [];
      const lastIncludedComment =
        commentsRect?.length > 0
          ? commentsSlice[commentsSlice.length - 1]
          : null;
      const totalHeight =
        lastIncludedComment !== null
          ? lastIncludedComment.y + lastIncludedComment.height
          : mainPostRect.y + mainPostRect.height;
      const fileName =
        userHandle +
        '_' +
        postId +
        '_cd_' +
        commentsSlice.length +
        '_' +
        createTimestamp() +
        '.jpeg';
      const path = './temp/facebook/' + fileName;
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: mainPostRect.width + 40,
          height: totalHeight + 40,
          x: mainPostRect.x - 20,
          y: 0,
        },
      });
      await browser.close();
      const res = await this.cloudinaryService.saveToCloud(path);
      rm(path, (error) => {
        if (error) throw error;
      });
      return this.facebookService.sendURL(res);
    } else if (type === 'videos') {
      const selector = '.x1jx94hy.x78zum5.x5yr21d';
      await page.waitForSelector(selector, {
        timeout: 15000,
      });
      const videoRect: DOMRect = await page.$eval(selector, (el) =>
        el.getBoundingClientRect().toJSON(),
      );
      if (!videoRect) {
        throw new HttpException(
          'Provided url is incorrect or there is issue with Facebook.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const fileName =
        userHandle + '_' + postId + '_' + createTimestamp() + '.jpeg';
      const path = './temp/facebook/' + fileName;
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: videoRect.width + 40,
          height: videoRect.y + videoRect.height + 20,
          x: videoRect.x - 20,
          y: 0,
        },
      });
      await browser.close();
      const res = await this.cloudinaryService.saveToCloud(path);
      rm(path, (error) => {
        if (error) throw error;
      });
      return res;
    } else {
      throw new HttpException('Provide url.', HttpStatus.BAD_REQUEST);
    }
  }
}
