import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UsePipes,
} from '@nestjs/common';
import { InstagramService } from './instagram.service';
import puppeteer, { Browser, Page } from 'puppeteer';
import UrlPipe from 'src/pipes/urlPipe';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { rm } from 'fs';
import { createTimestamp } from 'src/utils/utils';

@Controller('api/screenshot/instagram')
export class InstagramController {
  constructor(
    private readonly instagramService: InstagramService,
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
      defaultViewport: { width: 1000, height: 800 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: `.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }
          section.x5ur3kl.x13fuv20.x178xt8z.x1roi4f4.x2lah0s.xvs91rp.xl56j7k.x17ydfre.x1n2onr6.x10b6aqq.x1yrsyyn.x1hrcb2b.x1pi30zi { display: none; }`,
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });
    await page.waitForSelector('article._aa6a._aatb._aate._aatg._aati', {
      timeout: 15000,
    });
    const postRect: DOMRect = await page.$eval(
      'article._aa6a._aatb._aate._aatg._aati',
      (el) => el.getBoundingClientRect().toJSON(),
    );
    if (!postRect) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Instagram.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const fileName =
      userHandle + '_' + postId + '_' + createTimestamp() + '.jpeg';
    const path = './temp/instagram/' + fileName;
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
    return this.instagramService.sendURL(res);
  }
}
