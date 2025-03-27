import { Body, Controller, Delete, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import MostRecentScreenshotPipe from 'src/pipes/mostRecentScreenshotPipe';
import { ScreenshotData, UserBody, UserBodyPiped } from './user.interface';
import EndDatePipe from 'src/pipes/endDatePipe';
import StartDatePipe from 'src/pipes/startDatePipe';
import StartToEndDatePipe from 'src/pipes/startToEndDatePipe';
import SpecificScreenshotPipe from 'src/pipes/specificScreenshotPipe';

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

  @Delete('specific-screenshot')
  @UsePipes(SpecificScreenshotPipe)
  async deleteSpecificScreenshot(
    @Body() body: UserBody,
  ): Promise<ScreenshotData> {
    const data = await this.userService.deleteSpecificScreenshot(body);
    return data;
  }

  @Post('screenshot-start-to-end-date')
  @UsePipes(StartToEndDatePipe)
  async getScreenshotsStartToEndDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsStartToEndDate(body);
    return data;
  }

  @Post('screenshot-end-date')
  @UsePipes(EndDatePipe)
  async getScreenshotsEndDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsEndDate(body);
    return data;
  }

  @Post('screenshot-start-date')
  @UsePipes(StartDatePipe)
  async getScreenshotsStartDate(
    @Body() body: UserBodyPiped,
  ): Promise<ScreenshotData[]> {
    const data = await this.userService.getScreenshotsStartDate(body);
    return data;
  }
}
