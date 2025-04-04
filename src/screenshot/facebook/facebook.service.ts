import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FacebookData } from './facebook.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { cleanUpDirectory, createFilename } from 'src/utils/utils';
import { rmSync } from 'fs';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.interface';

@Injectable()
export class FacebookService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async destructureUrl(body: ScreenshotBodyPiped): Promise<FacebookData> {
    const { postUrlData } = body;
    const split = postUrlData.pathname.split('/');
    if (split[1] === 'watch') {
      // Links with "watch" keyword are shortened urls, after accessing
      // them site redirects you to video page with url including
      // "videos" keyword and user's handle.
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 400,
          height: 300,
        },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });
      const data = this.destructureUrl({
        ...body,
        postUrlData: new URL(page.url()),
      });
      await browser.close();
      return data;
    } else if (split[1] === 'photo') {
      // Links with "photo" keyword do not contain user's handle.
      // To get it we access url and extract it from href
      // attribute of specific <link> tag inside <head> tag.
      // In the process "photo" keyword turns into "photos".
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 400,
          height: 300,
        },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });
      const headLinkSelector = 'head > link[rel="canonical"]';
      const headLinkHref = await page.$eval(headLinkSelector, (el) => el.href);
      await browser.close();
      const newUrl = new URL(headLinkHref);
      const split = newUrl.pathname.split('/');
      const userHandle = split[1];
      const type = split[2];
      const postId = split[4];
      return {
        ...body,
        userHandle: userHandle,
        postOwnerProfileLink: 'https://www.facebook.com/' + userHandle,
        postId: postId,
        originalPostUrl: postUrlData.href,
        type: type,
      };
    } else {
      const userHandle = split[1];
      const type = split[2];
      const postId = split[3];
      return {
        ...body,
        userHandle: userHandle,
        postOwnerProfileLink: 'https://www.facebook.com/' + userHandle,
        postId: postId,
        originalPostUrl: postUrlData.href,
        type: type,
      };
    }
  }

  async getScreenshot(
    cloudinaryId: string,
    urlData: FacebookData,
  ): Promise<CloudinaryResponse> {
    if (urlData.type === 'posts') {
      return await this.screenshotPost(cloudinaryId, urlData);
    } else if (urlData.type === 'photos') {
      return await this.screenshotPhoto(cloudinaryId, urlData);
    } else if (urlData.type === 'videos') {
      return await this.screenshotVideo(cloudinaryId, urlData);
    } else {
      throw new HttpException('Invalid URL.', HttpStatus.BAD_REQUEST);
    }
  }

  async screenshotPost(
    cloudinaryId: string,
    data: FacebookData,
  ): Promise<CloudinaryResponse> {
    const tempDir = './temp/facebook/';
    try {
      const { service, postUrlData, userHandle, postId, commentsDepth } = data;
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1000,
          height: 800,
        },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
      await page.addStyleTag({
        content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
      });
      await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

      const containerSelector =
        '.x1n2onr6.x1ja2u2z.x1jx94hy.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.x9f619.xh8yej3.x6ikm8r.x10wlt62';
      const uglyDeepSelector =
        ' > div > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd > div > div > div';
      await page.waitForSelector(containerSelector, { timeout: 5000 });
      const domRect: DOMRect[] = await page.$$eval(
        containerSelector + uglyDeepSelector,
        (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
      );
      const postRect = domRect[2];
      if (!postRect) {
        throw new HttpException(
          'Invalid URL or issue with Facebook.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await page.waitForSelector(
        '.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp',
        { timeout: 5000 },
      );
      const commentsRect: DOMRect[] | null =
        commentsDepth === 0
          ? []
          : await page.$$eval(
              '.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp > div',
              (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
            );
      if (commentsDepth > 0 && commentsRect === null) {
        throw new HttpException(
          'Error including comments. Try again later or omit them.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const commentsSlice: DOMRect[] = commentsRect.slice(0, commentsDepth);
      const lastIncludedComment: DOMRect =
        commentsSlice.length === 0
          ? null
          : commentsSlice[commentsSlice.length - 1];
      const totalHeight: number =
        lastIncludedComment === null
          ? postRect.y + postRect.height + 20
          : lastIncludedComment.y + lastIncludedComment.height;

      const timestamp = new Date();
      const fileName = createFilename(
        service,
        userHandle,
        postId,
        timestamp,
        commentsSlice.length,
      );
      const path = tempDir + fileName;

      await page.setViewport({
        width: 1000,
        height: Math.round(totalHeight + 20),
        deviceScaleFactor: 1,
      });
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: postRect.width + 40,
          height: totalHeight,
          x: postRect.x - 20,
          y: 0,
        },
      });
      await browser.close();

      const resUrl = await this.cloudinaryService.saveToCloud(
        path,
        cloudinaryId,
        service,
        timestamp,
      );
      rmSync(path);
      return resUrl;
    } catch (error: unknown) {
      cleanUpDirectory(tempDir);
      throw error;
    }
  }

  async screenshotPhoto(
    cloudinaryId: string,
    data: FacebookData,
  ): Promise<CloudinaryResponse> {
    const tempDir = './temp/facebook/';
    try {
      const { service, postUrlData, userHandle, postId } = data;
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1000,
          height: 800,
        },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
      await page.addStyleTag({
        content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
      });
      await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

      const containerSelector =
        '.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4';
      await page.waitForSelector(containerSelector, { timeout: 5000 });
      const domRect: DOMRect = await page.$eval(containerSelector, (el) =>
        el.getBoundingClientRect().toJSON(),
      );
      if (!domRect) {
        throw new HttpException(
          'Invalid URL or issue with Facebook.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const timestamp = new Date();
      const fileName = createFilename(service, userHandle, postId, timestamp);
      const path = './temp/facebook/' + fileName;

      await page.setViewport({
        width: 1000,
        height: Math.round(domRect.y + domRect.height + 20),
        deviceScaleFactor: 1,
      });
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: domRect.width + 40,
          height: domRect.y + domRect.height + 20,
          x: domRect.x - 20,
          y: 0,
        },
      });
      await browser.close();

      const resUrl = await this.cloudinaryService.saveToCloud(
        path,
        cloudinaryId,
        service,
        timestamp,
      );
      rmSync(path);
      return resUrl;
    } catch (error: unknown) {
      cleanUpDirectory(tempDir);
      throw error;
    }
  }

  async screenshotVideo(
    cloudinaryId: string,
    data: FacebookData,
  ): Promise<CloudinaryResponse> {
    const tempDir = './temp/facebook/';
    try {
      const { service, postUrlData, userHandle, postId } = data;
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: {
          width: 1400,
          height: 1000,
        },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
      await page.addStyleTag({
        content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
      });
      await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

      const selector = '.x1jx94hy.x78zum5.x5yr21d';
      await page.waitForSelector(selector, {
        timeout: 5000,
      });
      const videoRect: DOMRect = await page.$eval(selector, (el) =>
        el.getBoundingClientRect().toJSON(),
      );
      if (!videoRect) {
        throw new HttpException(
          'Invalid URL or issue with Facebook.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const timestamp = new Date();
      const fileName = createFilename(service, userHandle, postId, timestamp);
      const path = './temp/facebook/' + fileName;

      await page.setViewport({
        width: 1400,
        height: Math.round(videoRect.height + 20),
        deviceScaleFactor: 1,
      });
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: videoRect.width + 40,
          height: videoRect.height + 20,
          x: videoRect.x - 20,
          y: 0,
        },
      });
      await browser.close();

      const resUrl = await this.cloudinaryService.saveToCloud(
        path,
        cloudinaryId,
        service,
        timestamp,
      );
      rmSync(path);
      return resUrl;
    } catch (error: unknown) {
      cleanUpDirectory(tempDir);
      throw error;
    }
  }
}
