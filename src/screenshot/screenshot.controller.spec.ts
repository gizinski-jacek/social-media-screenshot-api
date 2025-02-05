import { Test, TestingModule } from '@nestjs/testing';
import { ScreenshotController } from './screenshot.controller';

describe('ScreenshotController', () => {
  let controller: ScreenshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreenshotController],
    }).compile();

    controller = module.get<ScreenshotController>(ScreenshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
