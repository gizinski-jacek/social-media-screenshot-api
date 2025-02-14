import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { QueryData, UrlData } from './instagram.interface';
import puppeteer, { Browser, Page } from 'puppeteer';
import { createFilename } from 'src/utils/utils';
import { rm } from 'fs';
@Injectable()
export class InstagramService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  destructureQuery(query: QueryData): UrlData {
    const { url } = query;
    const split = url.pathname.split('/');
    const userHandle = split[1];
    const postId = split[3];
    return { url: url.href, userHandle, postId };
  }

  async takeScreenshotOfPost(data: UrlData): Promise<string> {
    const { url, userHandle, postId } = data;
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1000, height: 800 },
    });
    const page: Page = await browser.newPage();
    await page.goto(url, {
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

    const fileName = createFilename(userHandle, postId);
    const path = './temp/instagram/' + fileName;

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

    const resUrl = await this.cloudinaryService.saveToCloud(path);
    rm(path, (error) => {
      if (error) throw error;
    });
    return resUrl;
  }
}
