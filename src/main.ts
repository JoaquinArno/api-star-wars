import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConstantsService } from './components/constants/constants.service';
import { AllExceptionsFilter } from './filters/allExceptions.filter';
import { terminateProcess } from './utils/global-error-handler';
import { LoggingInterceptor } from './intercepctors/logging.interceptor';
import { WinstonLogger } from './config/logger.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const constantsService = app.get(ConstantsService);
  const ENVIRONMENT = constantsService.ENVIRONMENT;
  const PORT = constantsService.PORT;

  if (ENVIRONMENT === 'unknown') {
    terminateProcess('Environment is not set', 9);
  }

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Star Wars Movies API')
    .setDescription('The description for the Star Wars Movies API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const logger = app.get(WinstonLogger);
  app.useGlobalInterceptors(new LoggingInterceptor(logger));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(PORT);
  console.log(`Server running on http://localhost:${PORT}`);
}
