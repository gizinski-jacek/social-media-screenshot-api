import { Injectable } from '@nestjs/common';

@Injectable()
export class InstagramService {
  sendURL(string: string): string {
    return string;
  }
}
