import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function generateSwaggerJson() {
  // Create a NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error'], // Only show errors to keep the console clean
  });

  // Configure Swagger the same way as in main.ts
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
      'JWT-auth',
    )
    .build();

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Ensure the output directory exists
  const outputDir = path.resolve(process.cwd(), 'swagger');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the Swagger JSON to a file
  const outputPath = path.resolve(outputDir, 'swagger.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2), 'utf8');

  console.log(`Swagger JSON has been generated at: ${outputPath}`);

  // Close the application
  await app.close();
}

// Run the function
generateSwaggerJson().catch(err => {
  console.error('Error generating Swagger JSON:', err);
  process.exit(1);
}); 