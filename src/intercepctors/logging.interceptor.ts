import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { WinstonLogger } from '../config/logger.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;

    this.logger.log(
      `Endpoint: ${method} ${url} - Body: ${JSON.stringify(
        body
      )} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`
    );

    return next.handle().pipe();
  }
}
