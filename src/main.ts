import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import AuthGuard from './guards/authGuard';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URI
        : process.env.CLIENT_URI_DEV,
  });
  app.useGlobalGuards(new AuthGuard());
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
