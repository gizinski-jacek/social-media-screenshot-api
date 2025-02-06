import { Injectable } from '@nestjs/common';

@Injectable()
export class TwitterService {
  sendURL(string: string): string {
    return string;
  }
}
