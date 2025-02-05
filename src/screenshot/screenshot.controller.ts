import { Controller, Get, Res } from '@nestjs/common';

@Controller('api/screenshot')
export class ScreenshotController {
  constructor() {}

  @Get()
  index(@Res() res) {
    res.status(302).redirect('/api');
  }
}
