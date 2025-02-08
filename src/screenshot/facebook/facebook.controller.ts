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
  async getScreenshot(@Query() query: { url: URL }): Promise<string> {
    const { url } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1400, height: 800 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
    });
    await page.waitForSelector('.x78zum5.xkrivgy.x1gryazu.x4pn7vq', {
      timeout: 15000,
    });
    const postRect: DOMRect = await page.$eval(
      '.x78zum5.xkrivgy.x1gryazu.x4pn7vq',
      (el) => el.getBoundingClientRect().toJSON(),
    );
    if (!postRect) {
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
        width: postRect.width + 20,
        height: postRect.y + postRect.height + 20,
        x: postRect.x - 20,
        y: 0,
      },
    });
    await browser.close();
    const res = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return this.facebookService.sendURL(res);
  }
}
