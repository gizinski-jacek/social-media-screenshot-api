import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { isURL } from 'class-validator';
import { supportedServicesData } from 'src/utils/data';
import {
  ScreenshotBody,
  ScreenshotBodyPiped,
} from 'src/screenshot/screenshot.interface';

class ScreenshotItPipe implements PipeTransform {
  transform(body: ScreenshotBody): ScreenshotBodyPiped {
    const { postUrl, commentsDepth, discordId, nitter } = body;
    if (!discordId) {
      throw new HttpException('Provide discordId.', HttpStatus.BAD_REQUEST);
    }
    if (
      !isURL(postUrl, {
        protocols: ['http', 'https'],
        require_protocol: true,
      })
    ) {
      throw new HttpException(
        'Invalid URL (include http(s)).',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newUrl = new URL(postUrl);
    const removedWWW = newUrl.hostname.replace('www.', '');
    let service = removedWWW.slice(0, removedWWW.indexOf('.'));
    if (service === 'x') {
      service = 'twitter';
    }
    const supportedService = supportedServicesData[service];
    if (!supportedService) {
      throw new HttpException(
        'Unsupported social media service.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newCommentsDepth =
      commentsDepth === undefined ? 0 : Number(commentsDepth);
    if (isNaN(newCommentsDepth)) {
      throw new HttpException(
        'Included comments value must be a number.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (newCommentsDepth < 0 || newCommentsDepth > 10) {
      throw new HttpException(
        'Included comments value must be in 0-10 range.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newNitter = nitter === true ? true : false;
    return {
      postUrlData: newUrl,
      commentsDepth: newCommentsDepth,
      service: service,
      discordId: discordId,
      nitter: newNitter,
    };
  }
}

export default ScreenshotItPipe;
