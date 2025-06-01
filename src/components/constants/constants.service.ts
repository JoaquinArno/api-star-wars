import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { WinstonLogger } from '../../config/logger.config';

@Injectable()
export class ConstantsService {
  constructor(private readonly configService: ConfigService) {}

  readonly ENVIRONMENT = this.configService.get<string>(
    'ENVIRONMENT',
    'development'
  );
  readonly PORT = this.configService.get<number>('PORT', 63636);
  readonly API_VERSION = this.configService.get<string>('API_VERSION');

  readonly DB_HOST = this.configService.get<string>('DB_HOST');
  readonly DB_USER = this.configService.get<string>('DB_USER');
  readonly DB_PASSWORD = this.configService.get<string>('DB_PASSWORD');
  readonly DB_NAME = this.configService.get<string>('DB_NAME');
  readonly DB_PORT = this.configService.get<number>('DB_PORT');
  readonly DB_SSL = this.configService.get<string>('DB_SSL', 'true') === 'true';

  get typeOrmConfig(): TypeOrmModuleOptions {
    try {
      return {
        type: 'postgres',
        host: this.DB_HOST,
        port: this.DB_PORT,
        username: this.DB_USER,
        password: this.DB_PASSWORD,
        database: this.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
        ssl: this.DB_SSL ? { rejectUnauthorized: false } : false,
      };
    } catch (error) {
      const logger = new WinstonLogger();
      logger.error('Error construyendo configuración de TypeORM', error.stack);
      throw error;
    }
  }

  readonly URLS = {
    AUTH: '/auth',
    MOVIES: '/movies',
    USERS: '/users',
  };

  getEndpoint(resource: keyof typeof this.URLS): string {
    return this.URLS[resource];
  }
}
