import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TwitterData } from './twitter.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rmSync } from 'fs';
import { ScreenshotBodyPiped } from '../screenshot.interface';

@Injectable()
export class TwitterService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureUrl(body: ScreenshotBodyPiped): TwitterData {
    const { postUrlData } = body;
    const split = postUrlData.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    return {
      ...body,
      userHandle: userHandle,
      postOwnerProfileLink: 'https://x.com/' + userHandle,
      postId: postId,
      originalPostUrl: postUrlData.href,
    };
  }

  createNitterUrlData(urlData: URL): URL {
    return new URL('https://nitter.net' + urlData.pathname);
  }

  async getScreenshot(data: TwitterData): Promise<string> {
    if (data.nitter) {
      const urlData = this.createNitterUrlData(data.postUrlData);
      return await this.screenshotNitter({ ...data, postUrlData: urlData });
    } else {
      return await this.screenshotTwitter(data);
    }
  }

  async screenshotTwitter(data: TwitterData): Promise<string> {
    const { postUrlData, userHandle, postId, commentsDepth } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 900, height: 700 },
    });
    const page: Page = await browser.newPage();
    await page.goto(postUrlData.href, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    );
    await page.addStyleTag({
      content:
        '.css-175oi2r.r-aqfbo4.r-zchlnj.r-1d2f490.r-1xcajam.r-1p0dtai.r-12vffkv { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });
    await page.waitForSelector(
      '.css-175oi2r[aria-label="Timeline: Conversation"] ',
      { timeout: 5000 },
    );
    const domRect: DOMRect[] = await page.$$eval(
      '.css-175oi2r[aria-label="Timeline: Conversation"] > div > div',
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
    if (!domRect || domRect.length < 1) {
      throw new HttpException(
        'Invalid URL or issue with Twitter.',
        HttpStatus.INTERNAL_SERVER_ERROR,
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

    await page.setViewport({
      width: 900,
      height: Math.round(totalHeight + 20),
      deviceScaleFactor: 1,
    });
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
    rmSync(path);
    return resUrl;
  }

  async screenshotNitter(data: TwitterData): Promise<string> {
    const { postUrlData, userHandle, postId, commentsDepth } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 700,
        height: 500,
      },
    });
    const page: Page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    );
    await page.goto(postUrlData.href, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });
    await page.waitForSelector('.main-tweet', { timeout: 5000 });
    const postRect: DOMRect = await page.$eval('.main-tweet', (el) =>
      el.getBoundingClientRect().toJSON(),
    );
    if (!postRect) {
      throw new HttpException(
        'Invalid URL or issue with Nitter.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const commentsRect: DOMRect[] = await page.$$eval(
      '.reply.thread.thread-line',
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
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
    const path = './temp/nitter/' + fileName;

    await page.setViewport({
      width: 700,
      height: Math.round(totalHeight + 20),
      deviceScaleFactor: 1,
    });
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
    rmSync(path);
    return resUrl;
  }
}
