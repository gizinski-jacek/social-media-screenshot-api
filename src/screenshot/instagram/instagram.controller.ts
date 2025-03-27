import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import ScreenshotItPipe from 'src/pipes/screenshotItPipe';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { UserService } from 'src/mongo/users/user.service';
import { Screenshot } from 'src/mongo/schemas/screenshot.schema';
import { ScreenshotData } from 'src/mongo/users/user.interface';

@Controller('api/screenshot/instagram')
export class InstagramController {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotItPipe)
  async getScreenshot(
    @Body() body: ScreenshotBodyPiped,
  ): Promise<ScreenshotData> {
    const urlData = this.instagramService.destructureUrl(body);
    const user = await this.userService.getOrCreateUser({
      discordId: body.discordId,
    });
    const cloudData = await this.instagramService.screenshotPost(
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
