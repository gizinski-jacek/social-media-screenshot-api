import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TwitterData } from './twitter.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rmSync } from 'fs';
import { BodyPipedData } from 'src/utils/types';

@Injectable()
export class TwitterService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureUrl(body: BodyPipedData): TwitterData {
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
      defaultViewport: { width: 900, height: 3000 + commentsDepth * 1000 },
    });
    const page: Page = await browser.newPage();
    await page.goto(postUrlData.href, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
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
      defaultViewport: { width: 800, height: 1800 },
    });
    const page: Page = await browser.newPage();
    await page.goto(postUrlData.href, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });
    await page.waitForSelector('#m', { timeout: 5000 });
    const postRect: DOMRect = await page.$eval('#m', (el) =>
      el.getBoundingClientRect().toJSON(),
    );
    if (!postRect) {
      throw new HttpException(
        'Invalid URL or issue with Nitter.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const commentsRect: DOMRect[] = await page.$eval('#r', (el) =>
      el.getBoundingClientRect().toJSON(),
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
