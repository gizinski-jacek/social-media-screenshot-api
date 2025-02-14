import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { isURL } from 'class-validator';

class UrlPipe implements PipeTransform {
  transform(data: { url: string; cd: string }): {
    url: URL;
    commentsDepth: number;
  } {
    const { url, cd } = data;
    if (
      !isURL(data.url, {
        protocols: ['http', 'https'],
        require_protocol: true,
      })
    ) {
      throw new HttpException('Provide url.', HttpStatus.BAD_REQUEST);
    }
    const newUrl = new URL(url);
    const commentsDepth = cd === undefined ? 0 : Number(cd);
    if (isNaN(commentsDepth)) {
      throw new HttpException(
        'Included comments value must be a number.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (commentsDepth < 0 || commentsDepth > 20) {
      throw new HttpException(
        'Included comments value must be in 0-20 range.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return { url: newUrl, commentsDepth: commentsDepth };
  }
}

export default UrlPipe;
