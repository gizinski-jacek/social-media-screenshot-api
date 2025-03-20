import { Module } from '@nestjs/common';
import { ApiController, AppController } from './app.controller';
import { AppService } from './app.service';
import { ScreenshotModule } from './screenshot/screenshot.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './mongo/users/user.module';
import { UserController } from './mongo/users/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? process.env.MONGO_DB_URI
        : process.env.MONGO_DB_URI,
    ),
    ScreenshotModule,
    UserModule,
  ],
  controllers: [AppController, ApiController, UserController],
  providers: [AppService, CloudinaryProvider],
})
export class AppModule {}
