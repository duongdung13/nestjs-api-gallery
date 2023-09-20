import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('PORT');
  await app.listen(PORT);
  Logger.log(`🚀 ~ App running - port:${PORT}`, 'NestApplication');
}
bootstrap();
