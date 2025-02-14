import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryData, UrlData } from './facebook.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rm } from 'fs';

@Injectable()
export class FacebookService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureQuery(query: QueryData): UrlData {
    const { url, commentsDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const type = split[2];
    const postId = split[3];
    return { url: url.href, userHandle, type, postId, commentsDepth };
  }

  async takeScreenshotOfPost(data: UrlData): Promise<string> {
    const { url, userHandle, postId, commentsDepth } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1400,
        height: 1400 + commentsDepth * 200,
      },
    });
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

    const containerSelector =
      '.x1n2onr6.x1ja2u2z.x1jx94hy.x1qpq9i9.xdney7k.xu5ydu1.xt3gfkd.x9f619.xh8yej3.x6ikm8r.x10wlt62';
    const uglyDeepSelector =
      ' > div > .html-div.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd > div > div > div';
    await page.waitForSelector(containerSelector, { timeout: 15000 });
    const domRect: DOMRect[] = await page.$$eval(
      containerSelector + uglyDeepSelector,
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
    const postRect = domRect[2];
    if (!postRect) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Facebook.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await page.waitForSelector(
      '.html-div.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1gslohp',
      { timeout: 15000 },
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
        'There was an issue including comments. Try again later or omit them.',
        HttpStatus.BAD_REQUEST,
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

    const fileName = createFilename(userHandle, postId, commentsSlice.length);
    const path = './temp/facebook/' + fileName;

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

    const resUrl = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return resUrl;
  }

  async takeScreenshotOfVideo(data: UrlData): Promise<string> {
    const { url, userHandle, postId } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1400,
        height: 1000,
      },
    });
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: '.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

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

    const fileName = createFilename(userHandle, postId);
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

    const resUrl = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return resUrl;
  }
}
