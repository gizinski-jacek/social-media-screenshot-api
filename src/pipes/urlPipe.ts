import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { isURL } from 'class-validator';
import { supportedServicesData } from 'src/utils/data';
import { BodyData, BodyPipedData } from 'src/utils/types';

class UrlPipe implements PipeTransform {
  transform(body: BodyData): BodyPipedData {
    const { postUrl, commentsDepth, discordId } = body;
    if (
      !isURL(postUrl, {
        protocols: ['http', 'https'],
        require_protocol: true,
      })
    ) {
      throw new HttpException(
        'Provide valid url (http(s) included).',
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
    if (newCommentsDepth < 0 || newCommentsDepth > 20) {
      throw new HttpException(
        'Included comments value must be in 0-20 range.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      postUrlData: newUrl,
      commentsDepth: newCommentsDepth,
      service: service,
      discordId: discordId,
    };
  }
}

export default UrlPipe;
