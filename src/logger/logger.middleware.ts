import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body, query, params } = req;
    const requestTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);

    // Log request
    this.loggerService.log(`Incoming Request`, {
      requestId,
      method,
      url: originalUrl,
      body,
      query,
      params,
    });

    // Capture original end function to intercept response
    const originalEnd = res.end;
    const originalJson = res.json;
    let responseBody: any;
    const logger = this.loggerService;

    // Override res.json to capture response body
    res.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Override res.end to log response
    res.end = function (chunk?: any, ...rest: any[]) {
      const responseTime = Date.now() - requestTime;

      // Log response
      logger?.log(`Outgoing Response`, {
        requestId,
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        body: responseBody || chunk,
      });

      return originalEnd.apply(this, arguments);
    };

    next();
  }
} 