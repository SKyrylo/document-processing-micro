import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.use((req, res, next) => { // CSRF protection (write requests from other domains)
    const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const origin = req.headers.origin;
    if (isWrite && origin && origin !== process.env.FRONTEND_URL) {
      return res.status(403).json({ message: 'Forbidden origin' });
    }
    next();
  });
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
