import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import UserPipe from 'src/pipes/userPipe';
import { ScreenshotData, UserBody } from './user.interface';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('last-screenshot')
  @UsePipes(UserPipe)
  async getLastScreenshot(@Body() body: UserBody): Promise<ScreenshotData> {
    const data = await this.userService.getLastScreenshot(body);
    return data;
  }
}
