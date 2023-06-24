import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const logger = new Logger('main');

  const app = await NestFactory.create(AppModule, { cors: true });

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  if (process.env.NODE_ENV === 'development') {
    logger.log(`Initializing Swagger module for ${process.env.NODE_ENV}`);

    const config = new DocumentBuilder()
      .setTitle('Zenbit-Challenger')
      .setDescription('Official documentation for platform APIs')
      .setVersion('0.1')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: 'https://url.production',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    });
  }

  await app.listen(process.env.PORT || 3333);
}

bootstrap();
