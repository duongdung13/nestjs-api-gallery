import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './core/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  //config CORS
  app.enableCors({
    origin: '*',
    methods: 'GET, HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
  });


  const configService = app.get(ConfigService);
  const PORT = configService.get<string>('PORT');
  await app.listen(PORT);
  Logger.log(`🚀 ~ App running - port:${PORT}`, 'NestApplication');
}
bootstrap();
