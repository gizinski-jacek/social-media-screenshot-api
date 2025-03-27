import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import ScreenshotItPipe from 'src/pipes/screenshotItPipe';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { UserService } from 'src/mongo/users/user.service';
import { Screenshot } from 'src/mongo/schemas/screenshot.schema';
import { ScreenshotData } from 'src/mongo/users/user.interface';

@Controller('api/screenshot/twitter')
export class TwitterController {
  constructor(
    private readonly twitterService: TwitterService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotItPipe)
  async getScreenshot(
    @Body() body: ScreenshotBodyPiped,
  ): Promise<ScreenshotData> {
    const urlData = this.twitterService.destructureUrl(body);
    const user = await this.userService.getOrCreateUser({
      discordId: body.discordId,
    });
    const cloudData = await this.twitterService.getScreenshot(
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
