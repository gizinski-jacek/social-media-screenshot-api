import { Module } from '@nestjs/common';
import { ApiController, AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreenshotModule } from './screenshot/screenshot.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';

@Module({
  imports: [ConfigModule.forRoot(), ScreenshotModule],
  controllers: [AppController, ApiController],
  providers: [AppService, CloudinaryProvider],
})
export class AppModule {}
