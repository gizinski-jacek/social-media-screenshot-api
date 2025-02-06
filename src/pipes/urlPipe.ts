import { HttpException, HttpStatus, PipeTransform } from '@nestjs/common';
import { isURL } from 'class-validator';

class UrlPipe implements PipeTransform {
  transform(data: { url: string; cd: string }): {
    url: URL;
    commentDepth: number;
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
    const number = Number(cd);
    if (number < 0) {
      throw new HttpException(
        'Comment depth must positive number.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const commentDepth: number = isNaN(number) ? 0 : number;
    return { url: newUrl, commentDepth: commentDepth };
  }
}

export default UrlPipe;
