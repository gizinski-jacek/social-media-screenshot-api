import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { BlueskyService } from './bluesky.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { UserService } from 'src/mongo/users/user.service';
import { Link } from 'src/mongo/schemas/link.schema';
import { ScreenshotBodyPiped } from '../screenshot.interface';

@Controller('api/screenshot/bsky')
export class BlueskyController {
  constructor(
    private readonly blueskyService: BlueskyService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotPipe)
  async getScreenshot(@Body() body: ScreenshotBodyPiped): Promise<string> {
    const urlData = this.blueskyService.destructureUrl(body);
    const screenshotLink = await this.blueskyService.screenshotPost(urlData);
    const screenshotData: Link = {
      service: urlData.service,
      originalPostUrl: urlData.originalPostUrl,
      screenshotUrl: screenshotLink,
      userHandle: urlData.userHandle,
      postOwnerProfileLink: urlData.postOwnerProfileLink,
      postId: urlData.postId,
      commentsDepth: urlData.commentsDepth,
    };
    await this.userService.upsertUser({
      discordId: body.discordId,
      postScreenshotData: screenshotData,
    });
    return screenshotLink;
  }
}
