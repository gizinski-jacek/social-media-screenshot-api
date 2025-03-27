import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InstagramData } from './instagram.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { cleanUpDirectory, createFilename } from 'src/utils/utils';
import { rmSync } from 'fs';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary.interface';
@Injectable()
export class InstagramService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureUrl(body: ScreenshotBodyPiped): InstagramData {
    const { postUrlData } = body;
    const split = postUrlData.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    return {
      ...body,
      userHandle: userHandle,
      postOwnerProfileLink: 'https://www.instagram.com/' + userHandle,
      postId: postId,
      originalPostUrl: postUrlData.href,
    };
  }

  async screenshotPost(
    cloudinaryId: string,
    data: InstagramData,
  ): Promise<CloudinaryResponse> {
    const tempDir = './temp/instagram/';
    try {
      const { service, postUrlData, userHandle, postId } = data;
      const browser: Browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1000, height: 800 },
      });
      const page: Page = await browser.newPage();
      await page.goto(postUrlData.href, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
      await page.addStyleTag({
        content: `.x78zum5.xdt5ytf.xippug5.xg6iff7.x1n2onr6 { display: none; }
          section.x5ur3kl.x13fuv20.x178xt8z.x1roi4f4.x2lah0s.xvs91rp.xl56j7k.x17ydfre.x1n2onr6.x10b6aqq.x1yrsyyn.x1hrcb2b.x1pi30zi { display: none; }`,
      });
      await page.waitForNetworkIdle({ concurrency: 2, timeout: 15000 });

      await page.waitForSelector('._aa6a._aatb._aate._aatg._aati', {
        timeout: 5000,
      });
      const postRect: DOMRect = await page.$eval(
        '._aa6a._aatb._aate._aatg._aati',
        (el) => el.getBoundingClientRect().toJSON(),
      );
      if (!postRect) {
        throw new HttpException(
          'Invalid URL or issue with Instagram.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const timestamp = new Date();
      const fileName = createFilename(service, userHandle, postId, timestamp);
      const path = tempDir + fileName;

      await page.setViewport({
        width: 1000,
        height: Math.round(postRect.y + postRect.height + 20),
        deviceScaleFactor: 1,
      });
      await page.screenshot({
        path: path,
        quality: 100,
        clip: {
          width: postRect.width + 40,
          height: postRect.y + postRect.height + 20,
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
}
