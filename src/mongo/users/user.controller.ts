import { Body, Controller, Delete, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import MostRecentScreenshotPipe from 'src/pipes/mostRecentScreenshotPipe';
import { ScreenshotData, UserBody, UserBodyPiped } from './user.interface';
import ToDatePipe from 'src/pipes/toDatePipe';
import FromDatePipe from 'src/pipes/fromDatePipe';
import FromToDatePipe from 'src/pipes/fromToDatePipe';

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

  @Post('screenshot-from-to-date')
  @UsePipes(FromToDatePipe)
  async getScreenshotsFromToDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsFromToDate(body);
    return data;
  }

  @Post('screenshot-to-date')
  @UsePipes(ToDatePipe)
  async getScreenshotsToDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsToDate(body);
    return data;
  }

  @Post('screenshot-from-date')
  @UsePipes(FromDatePipe)
  async getScreenshotsFromDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsFromDate(body);
    return data;
  }
}
