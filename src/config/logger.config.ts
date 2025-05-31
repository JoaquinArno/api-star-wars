import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import * as path from 'path';

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: Logger;

  constructor() {
    const projectRoot = path.join(__dirname, '../../');
    const errorLogPath = path.join(projectRoot, 'logs', 'error.log');
    const combinedLogPath = path.join(projectRoot, 'logs', 'combined.log');

    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ level, message, timestamp }) => {
              return `${timestamp} [${level}]: ${message}`;
            })
          ),
        }),
        new transports.File({ filename: errorLogPath, level: 'error' }),
        new transports.File({ filename: combinedLogPath }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug?(message: string) {
    this.logger.debug(message);
  }

  verbose?(message: string) {
    this.logger.verbose(message);
  }
}
