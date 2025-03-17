import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  // Create logger instance
  const logger = new LoggerService();
  
  // Create NestJS app with custom logger
  const app = await NestFactory.create(AppModule, {
    logger: {
      log: (message) => logger.log(message),
      error: (message, trace) => logger.error(message, trace),
      warn: (message) => logger.warn(message),
      debug: (message) => logger.debug(message),
      verbose: (message) => logger.verbose(message),
    },
  });
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Todo API')
    .setDescription('The Todo API with authentication')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('todos', 'Todo management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This is a key to be used as a name in @ApiBearerAuth() decorator
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
