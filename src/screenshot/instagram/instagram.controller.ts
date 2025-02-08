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
      defaultViewport: { width: 1000, height: 1600 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url.href, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await page.waitForSelector('button._a9--._ap36._a9_0');
    await page.click('button._a9--._ap36._a9_0', { offset: { x: 4, y: 4 } });
    await page.waitForNetworkIdle();
    await page.waitForSelector(
      '.x1i10hfl.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x6s0dn4.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x1ypdohk.x78zum5.xl56j7k.x1y1aw1k.x1sxyh0.xwib8y2.xurb0ha.xcdnw81',
    );
    await page.click(
      '.x1i10hfl.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x6s0dn4.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x1ypdohk.x78zum5.xl56j7k.x1y1aw1k.x1sxyh0.xwib8y2.xurb0ha.xcdnw81',
      { offset: { x: 4, y: 4 } },
    );
    await page.waitForSelector('article._aa6a._aatb._aate._aatg._aati');
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
        width: postRect.width,
        height: postRect.y + postRect.height,
        x: postRect.x,
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
