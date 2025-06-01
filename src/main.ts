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
  let app: NestExpressApplication;

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  } catch (err) {
    const logger = new WinstonLogger();
    logger.error('Error al crear la aplicación NestJS', err.stack);
    process.exit(1);
  }

  const constantsService = app.get(ConstantsService);
  const logger = app.get(WinstonLogger);
  const ENVIRONMENT = constantsService.ENVIRONMENT;
  const PORT = constantsService.PORT;

  if (ENVIRONMENT === 'unknown') {
    logger.error('ENVIRONMENT no está seteado correctamente.');
    terminateProcess('Environment is not set', 9);
  }

  try {
    app.enableCors();

    const config = new DocumentBuilder()
      .setTitle('Star Wars Movies API')
      .setDescription('The description for the Star Wars Movies API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.useGlobalInterceptors(new LoggingInterceptor(logger));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(PORT);
    logger.log(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    logger.error('Error al iniciar la aplicación', err.stack);
    process.exit(1);
  }
}
bootstrap();
