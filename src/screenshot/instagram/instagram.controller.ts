import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import ScreenshotPipe from 'src/pipes/screenshotPipe';
import { ScreenshotBodyPiped } from '../screenshot.interface';
import { UserService } from 'src/mongo/users/user.service';
import { Link } from 'src/mongo/schemas/link.schema';
import { ScreenshotData } from 'src/mongo/users/user.interface';

@Controller('api/screenshot/instagram')
export class InstagramController {
  constructor(
    private readonly instagramService: InstagramService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(ScreenshotPipe)
  async getScreenshot(
    @Body() body: ScreenshotBodyPiped,
  ): Promise<ScreenshotData> {
    const urlData = this.instagramService.destructureUrl(body);
    const screenshotLink = await this.instagramService.screenshotPost(urlData);
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
    return {
      url: screenshotLink,
      service: urlData.service,
      userHandle: urlData.userHandle,
      date: new Date().toISOString(),
    };
  }
}
