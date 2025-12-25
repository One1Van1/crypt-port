import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      skipMissingProperties: false,
      forbidUnknownValues: false,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger для Auth endpoints
  const authConfig = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription('Authentication and Authorization endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const authDocument = SwaggerModule.createDocument(app, authConfig, {
    include: [],
    extraModels: [],
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  // Фильтруем только Auth endpoints
  authDocument.paths = Object.keys(authDocument.paths)
    .filter(path => path.startsWith('/auth') || path.startsWith('/admin'))
    .reduce((obj, key) => {
      obj[key] = authDocument.paths[key];
      return obj;
    }, {});

  SwaggerModule.setup('api/docs/auth', app, authDocument);

  // Swagger для App endpoints
  const appConfig = new DocumentBuilder()
    .setTitle('CRM P2P Processing API')
    .setDescription('API documentation for P2P Processing CRM system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const appDocument = SwaggerModule.createDocument(app, appConfig, {
    include: [],
    extraModels: [],
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  // Фильтруем только App endpoints (исключая Auth)
  appDocument.paths = Object.keys(appDocument.paths)
    .filter(path => !path.startsWith('/auth') && !path.startsWith('/admin'))
    .reduce((obj, key) => {
      obj[key] = appDocument.paths[key];
      return obj;
    }, {});

  SwaggerModule.setup('api/docs', app, appDocument);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger App Documentation: http://localhost:${port}/api/docs`);
  console.log(`Swagger Auth Documentation: http://localhost:${port}/api/docs/auth`);
}
bootstrap();

