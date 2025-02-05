import { Injectable } from '@nestjs/common';

@Injectable()
export class BlueskyService {
  sendURL(string: string): string {
    return string;
  }
}
