import { Injectable } from '@nestjs/common';

@Injectable()
export class FacebookService {
  sendURL(string: string): string {
    return string;
  }
}
