import { Body, Controller, Delete, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import MostRecentScreenshotPipe from 'src/pipes/mostRecentScreenshotPipe';
import { ScreenshotData, UserBody } from './user.interface';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('recent-screenshot')
  @UsePipes(MostRecentScreenshotPipe)
  async getMostRecentScreenshot(
    @Body() body: UserBody,
  ): Promise<ScreenshotData> {
    const data = await this.userService.getMostRecentScreenshot(body);
    return data;
  }

  @Delete('recent-screenshot')
  @UsePipes(MostRecentScreenshotPipe)
  async deleteMostRecentScreenshot(
    @Body() body: UserBody,
  ): Promise<ScreenshotData> {
    const data = await this.userService.deleteMostRecentScreenshot(body);
    return data;
  }
}
