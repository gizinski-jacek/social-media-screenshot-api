import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryData, UrlData } from './bluesky.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rm } from 'fs';

@Injectable()
export class BlueskyService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureQuery(query: QueryData): UrlData {
    const { url, commentsDepth } = query;
    const split = url.pathname.split('/');
    const userHandle = split[2];
    const postId = split[4];
    return { url: url.href, userHandle, postId, commentsDepth };
  }

  async takeScreenshotOfPost(data: UrlData): Promise<string> {
    const { url, userHandle, postId, commentsDepth } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 900, height: 3000 + commentsDepth * 200 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    await page.addStyleTag({
      content: 'nav[role="main"].css-175oi2r { display: none; }',
    });
    await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

    await page.waitForSelector('.css-175oi2r.r-sa2ff0', { timeout: 15000 });
    const domRect: DOMRect[] = await page.$$eval(
      '.css-175oi2r.r-sa2ff0 > div',
      (array) => array.map((el) => el.getBoundingClientRect().toJSON()),
    );
    if (!domRect || domRect.length < 3) {
      throw new HttpException(
        'Provided url is incorrect or there is issue with Bluesky.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const postRect: DOMRect = domRect[2];
    const commentsRect: DOMRect[] = domRect.slice(4);
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
    const path = './temp/bluesky/' + fileName;

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
