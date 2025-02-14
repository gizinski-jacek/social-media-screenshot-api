import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryData, UrlData } from './twitter.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rm } from 'fs';

@Injectable()
export class TwitterService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureQuery(query: QueryData): UrlData {
    const { url, commentsDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    return { url: url.href, userHandle, postId, commentsDepth };
  }

  async takeScreenshotOfPost(data: UrlData): Promise<string> {
    const { url, userHandle, postId, commentsDepth } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 900, height: 3000 + commentsDepth * 1000 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url, {
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
    if (!domRect || domRect.length < 1) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Twitter.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const postRect: DOMRect = domRect[0];
    const commentsRect: DOMRect[] = domRect.slice(2);
    const commentsSlice: DOMRect[] = commentsRect.slice(0, commentsDepth);
    const lastIncludedComment: DOMRect =
      commentsSlice.length === 0
        ? null
        : commentsSlice[commentsSlice.length - 1];
    const totalHeight: number =
      lastIncludedComment === null
        ? postRect.y + postRect.height
        : lastIncludedComment.y + lastIncludedComment.height;

    const fileName = createFilename(userHandle, postId, commentsSlice.length);
    const path = './temp/twitter/' + fileName;

    await page.screenshot({
      path: path,
      quality: 100,
      clip: {
        width: postRect.width + 40,
        height: totalHeight + 20,
        x: postRect.x - 20,
        y: 0,
      },
    });
    await browser.close();

    const resUrl = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return resUrl;
  }
}
