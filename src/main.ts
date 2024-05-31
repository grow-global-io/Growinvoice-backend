import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RequestLoggerMiddleware } from '@shared/middleware/logger.middleware';
import { wakeDyno, wakeDynos } from 'heroku-keep-awake';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const DYNO_URL = 'https://growinvoice-94ee0dd2031b.herokuapp.com';
  const DYNO_URLS = ['https://growinvoice-94ee0dd2031b.herokuapp.com'];
  app.use(new RequestLoggerMiddleware().use);
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()

    .setTitle('Growinvoice API')
    .setDescription('Enhance your business with Growinvoice API')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/api-docs.json',
    swaggerOptions: {
      url: '/api-docs.json',
      displayRequestDuration: true,
    },
  });

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT || 3000, () => {
    wakeDyno(DYNO_URL); // Use this function when only needing to wake a single Heroku app.

    wakeDynos(DYNO_URLS); // Use this function when needing to wake multiple Heroku apps.
  });
}
bootstrap();
