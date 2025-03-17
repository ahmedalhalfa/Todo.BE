import { Module } from '@nestjs/common';
import { LoggerMiddleware } from './logger.middleware';
import { LoggerService } from './logger.service';
import { LoggingInterceptor } from './logger.interceptor';
import { PinoHttpMiddleware } from './pino-http.middleware';

@Module({
  providers: [LoggerService, LoggingInterceptor],
  exports: [LoggerService, LoggingInterceptor],
})
export class LoggerModule {
  static configure() {
    return [LoggerMiddleware, PinoHttpMiddleware];
  }
} 