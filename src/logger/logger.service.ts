import { Injectable } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
      level: process.env.LOG_LEVEL || 'info',
    });
  }

  log(message: string, context?: any) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: any) {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: any) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: any) {
    this.logger.trace({ context }, message);
  }

  // Function to log function inputs and outputs
  logFunction(functionName: string, params: any, result?: any, error?: any) {
    if (error) {
      this.logger.error({
        function: functionName,
        params,
        error: error.message,
        stack: error.stack,
      }, `Error in function ${functionName}`);
      return;
    }
    
    this.logger.info({
      function: functionName,
      params,
      result,
    }, `Function ${functionName} executed`);
  }
} 