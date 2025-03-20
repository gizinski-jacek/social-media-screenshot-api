import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { FacebookService } from './facebook.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { UserService } from 'src/mongo/users/user.service';
import { Screenshot } from 'src/mongo/schemas/screenshot.schema';
import { ScreenshotData } from 'src/mongo/users/user.interface';

@Controller('api/screenshot/facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotPipe)
  async getScreenshot(
    @Body() body: ScreenshotBodyPiped,
  ): Promise<ScreenshotData> {
    const urlData = await this.facebookService.destructureUrl(body);
    const user = await this.userService.getOrCreateUser({
      discordId: body.discordId,
    });
    const cloudData = await this.facebookService.getScreenshot(
      user.cloudinaryId,
      urlData,
    );
    const screenshotData: Screenshot = {
      public_id: cloudData.public_id,
      service: urlData.service,
      originalPostUrl: urlData.originalPostUrl,
      screenshotUrl: cloudData.url,
      userHandle: urlData.userHandle,
      postOwnerProfileLink: urlData.postOwnerProfileLink,
      postId: urlData.postId,
      commentsDepth: urlData.commentsDepth,
      type: urlData.type,
      timestamp: cloudData.timestamp,
    };
    await this.userService.updateUser({
      discordId: body.discordId,
      postScreenshotData: screenshotData,
    });
    return {
      url: cloudData.url,
      service: urlData.service,
      userHandle: urlData.userHandle,
      timestamp: cloudData.timestamp.toISOString(),
    };
  }
}
