import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { UserService } from 'src/mongo/users/user.service';
import { Link } from 'src/mongo/schemas/link.schema';

@Controller('api/screenshot/facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotPipe)
  async getScreenshot(@Body() body: ScreenshotBodyPiped): Promise<string> {
    const urlData = await this.facebookService.destructureUrl(body);
    const screenshotLink: string =
      await this.facebookService.getScreenshot(urlData);
    const screenshotData: Link = {
      service: urlData.service,
      originalPostUrl: urlData.originalPostUrl,
      screenshotUrl: screenshotLink,
      userHandle: urlData.userHandle,
      postOwnerProfileLink: urlData.postOwnerProfileLink,
      postId: urlData.postId,
      commentsDepth: urlData.commentsDepth,
      type: urlData.type,
    };
    await this.userService.upsertUser({
      discordId: body.discordId,
      postScreenshotData: screenshotData,
    });
    return screenshotLink;
  }
}
