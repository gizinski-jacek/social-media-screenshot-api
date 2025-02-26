import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { TwitterService } from './twitter.service';
import UrlPipe from 'src/pipes/urlPipe';
import { BodyPipedData } from 'src/utils/types';
import { UserService } from 'src/mongo/users/user.service';

@Controller('api/screenshot/twitter')
export class TwitterController {
  constructor(
    private readonly twitterService: TwitterService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UsePipes(UrlPipe)
  async getScreenshot(@Body() body: BodyPipedData): Promise<string> {
    const urlData = this.twitterService.destructureUrl(body);
    const screenshotLink = await this.twitterService.screenshotPost(urlData);
    this.userService.upsertUser({
      discordId: body.discordId,
      postScreenshotData: {
        service: urlData.service,
        originalPostUrl: urlData.originalPostUrl,
        screenshotUrl: screenshotLink,
        userHandle: urlData.userHandle,
        postOwnerProfileLink: urlData.postOwnerProfileLink,
        postId: urlData.postId,
        commentsDepth: urlData.commentsDepth,
      },
    });
    return screenshotLink;
  }
}
